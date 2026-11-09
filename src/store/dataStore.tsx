import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Alert, ClockRecord, CompanySettings, DataState, Department, Employee, Shift, Zone } from '@/types';
import { buildDemoSeed, buildEmptyDataset } from './seedData';
import { evaluateAbsentAlerts, evaluateRecordAlerts } from '@/lib/alerts';
import { findMatchingZone } from '@/lib/geofencing';

const STORAGE_PREFIX = 'clockin_data_';
const DEMO_ADMIN_ID = 'admin-1';

function storageKey(adminId: string) {
  return `${STORAGE_PREFIX}${adminId}`;
}

function loadDataset(adminId: string, fallbackCompany: string, fallbackCif?: string): DataState {
  try {
    const raw = localStorage.getItem(storageKey(adminId));
    if (raw) return JSON.parse(raw) as DataState;
  } catch {}
  const seed = adminId === DEMO_ADMIN_ID ? buildDemoSeed() : buildEmptyDataset(fallbackCompany, fallbackCif);
  localStorage.setItem(storageKey(adminId), JSON.stringify(seed));
  return seed;
}

export function saveDataset(adminId: string, state: DataState) {
  localStorage.setItem(storageKey(adminId), JSON.stringify(state));
}

export function deleteDataset(adminId: string) {
  localStorage.removeItem(storageKey(adminId));
}

export function ensureDataset(adminId: string, companyName: string, cif?: string): DataState {
  return loadDataset(adminId, companyName, cif);
}

/** Search every dataset for an employee with this PIN. Used at PIN login. */
export function findEmployeeByPinAcrossAllAdmins(pin: string): { adminId: string; employee: Employee } | null {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(STORAGE_PREFIX)) continue;
    try {
      const data = JSON.parse(localStorage.getItem(key)!) as DataState;
      const emp = data.employees.find(e => e.pin === pin && e.status === 'active');
      if (emp) return { adminId: key.slice(STORAGE_PREFIX.length), employee: emp };
    } catch {}
  }
  return null;
}

export function getDatasetReadOnly(adminId: string): DataState | null {
  try {
    const raw = localStorage.getItem(storageKey(adminId));
    return raw ? (JSON.parse(raw) as DataState) : null;
  } catch {
    return null;
  }
}

export function patchDatasetReadOnly(adminId: string, mutator: (s: DataState) => DataState) {
  const ds = getDatasetReadOnly(adminId);
  if (!ds) return;
  saveDataset(adminId, mutator(ds));
}

// ==================== Context ====================

interface DataStoreContextValue extends DataState {
  adminId: string | null;
  // Employees
  addEmployee: (data: Omit<Employee, 'id' | 'createdAt' | 'status'> & { status?: Employee['status'] }) => Employee;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  // Departments
  addDepartment: (data: Omit<Department, 'id'>) => Department;
  updateDepartment: (id: string, patch: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;
  // Shifts
  addShift: (data: Omit<Shift, 'id'>) => Shift;
  deleteShift: (id: string) => void;
  // Zones
  addZone: (data: Omit<Zone, 'id'>) => Zone;
  updateZone: (id: string, patch: Partial<Zone>) => void;
  deleteZone: (id: string) => void;
  // Clock records (immutable: only insert)
  addClockRecord: (data: { employeeId: string; lat: number; lng: number; address: string; accuracy: number; type?: 'entry' | 'exit' }) => ClockRecord;
  addEmployeeNote: (recordId: string, note: string) => void;
  addCorrectionRecord: (originalId: string, patch: { timestamp?: string; type?: 'entry' | 'exit'; address?: string }) => ClockRecord | null;
  // Alerts
  markAlertRead: (id: string) => void;
  resolveAlert: (id: string, note: string) => void;
  // Settings
  updateSettings: (patch: Partial<CompanySettings>) => void;
  // Derived helpers
  getEmployee: (id: string) => Employee | undefined;
  getDepartment: (id: string) => Department | undefined;
  getShift: (id: string) => Shift | undefined;
  getEmployeesByDepartment: (deptId: string) => Employee[];
  getTodayRecords: () => ClockRecord[];
  getEmployeeTodayStatus: (empId: string) => 'present' | 'absent' | 'left';
  getEmployeeRecords: (empId: string) => ClockRecord[];
  // Consent
  acceptConsent: (employeeId: string) => void;
}

const DataStoreContext = createContext<DataStoreContextValue | null>(null);

interface ProviderProps {
  adminId: string | null;
  fallbackCompany?: string;
  fallbackCif?: string;
  children: ReactNode;
}

export function DataStoreProvider({ adminId, fallbackCompany = '', fallbackCif, children }: ProviderProps) {
  const [state, setState] = useState<DataState>(() =>
    adminId ? loadDataset(adminId, fallbackCompany, fallbackCif) : buildEmptyDataset(fallbackCompany, fallbackCif),
  );
  const adminIdRef = useRef(adminId);

  // Reload dataset when admin changes
  useEffect(() => {
    adminIdRef.current = adminId;
    if (adminId) setState(loadDataset(adminId, fallbackCompany, fallbackCif));
    else setState(buildEmptyDataset(fallbackCompany, fallbackCif));
  }, [adminId, fallbackCompany, fallbackCif]);

  // Persist on every change
  useEffect(() => {
    if (adminIdRef.current) saveDataset(adminIdRef.current, state);
  }, [state]);

  const update = useCallback((mutator: (s: DataState) => DataState) => {
    setState(prev => mutator(prev));
  }, []);

  const uid = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // ============ Employees ============
  const addEmployee: DataStoreContextValue['addEmployee'] = (data) => {
    const emp: Employee = {
      id: uid('e'),
      createdAt: new Date().toISOString().split('T')[0],
      status: data.status ?? 'active',
      name: data.name,
      email: data.email,
      phone: data.phone,
      departmentId: data.departmentId,
      shiftId: data.shiftId,
      pin: data.pin,
    };
    update(s => ({ ...s, employees: [...s.employees, emp] }));
    return emp;
  };
  const updateEmployee: DataStoreContextValue['updateEmployee'] = (id, patch) => {
    update(s => ({ ...s, employees: s.employees.map(e => (e.id === id ? { ...e, ...patch } : e)) }));
  };
  const deleteEmployee: DataStoreContextValue['deleteEmployee'] = (id) => {
    update(s => ({ ...s, employees: s.employees.filter(e => e.id !== id) }));
  };

  // ============ Departments ============
  const addDepartment: DataStoreContextValue['addDepartment'] = (data) => {
    const d: Department = { id: uid('d'), ...data };
    update(s => ({ ...s, departments: [...s.departments, d] }));
    return d;
  };
  const updateDepartment: DataStoreContextValue['updateDepartment'] = (id, patch) => {
    update(s => ({ ...s, departments: s.departments.map(d => (d.id === id ? { ...d, ...patch } : d)) }));
  };
  const deleteDepartment: DataStoreContextValue['deleteDepartment'] = (id) => {
    update(s => ({ ...s, departments: s.departments.filter(d => d.id !== id) }));
  };

  // ============ Shifts ============
  const addShift: DataStoreContextValue['addShift'] = (data) => {
    const sh: Shift = { id: uid('s'), ...data };
    update(s => ({ ...s, shifts: [...s.shifts, sh] }));
    return sh;
  };
  const deleteShift: DataStoreContextValue['deleteShift'] = (id) => {
    update(s => ({ ...s, shifts: s.shifts.filter(sh => sh.id !== id) }));
  };

  // ============ Zones ============
  const addZone: DataStoreContextValue['addZone'] = (data) => {
    const z: Zone = { id: uid('z'), ...data };
    update(s => ({ ...s, zones: [...s.zones, z] }));
    return z;
  };
  const updateZone: DataStoreContextValue['updateZone'] = (id, patch) => {
    update(s => ({ ...s, zones: s.zones.map(z => (z.id === id ? { ...z, ...patch } : z)) }));
  };
  const deleteZone: DataStoreContextValue['deleteZone'] = (id) => {
    update(s => ({ ...s, zones: s.zones.filter(z => z.id !== id) }));
  };

  // ============ Clock records ============
  const addClockRecord: DataStoreContextValue['addClockRecord'] = (data) => {
    const employee = state.employees.find(e => e.id === data.employeeId);
    if (!employee) throw new Error('Employee not found');
    const today = new Date().toISOString().split('T')[0];
    const todayRecs = state.clockRecords.filter(r => r.employeeId === data.employeeId && r.timestamp.startsWith(today));
    const lastToday = todayRecs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    const type: 'entry' | 'exit' = data.type ?? (lastToday?.type === 'entry' ? 'exit' : 'entry');

    const matchedZone = findMatchingZone(data.lat, data.lng, state.zones, employee.departmentId);
    const inZone = !!matchedZone;
    const record: ClockRecord = {
      id: uid('cr'),
      employeeId: data.employeeId,
      type,
      timestamp: new Date().toISOString(),
      lat: data.lat,
      lng: data.lng,
      address: data.address,
      accuracy: data.accuracy,
      inZone,
      zoneId: matchedZone?.id ?? null,
    };

    const shift = state.shifts.find(s => s.id === employee.shiftId);
    const newAlerts = evaluateRecordAlerts(record, employee, shift, state.zones, todayRecs, state.settings);

    update(s => ({
      ...s,
      clockRecords: [...s.clockRecords, record],
      alerts: [...s.alerts, ...newAlerts],
    }));
    return record;
  };

  const addCorrectionRecord: DataStoreContextValue['addCorrectionRecord'] = (originalId, patch) => {
    const original = state.clockRecords.find(r => r.id === originalId);
    if (!original) return null;
    const correction: ClockRecord = {
      ...original,
      id: uid('cr'),
      timestamp: patch.timestamp ?? original.timestamp,
      type: patch.type ?? original.type,
      address: patch.address ?? original.address,
      correctsId: originalId,
      editedByAdmin: true,
    };
    update(s => ({ ...s, clockRecords: [...s.clockRecords, correction] }));
    return correction;
  };

  const addEmployeeNote: DataStoreContextValue['addEmployeeNote'] = (recordId, note) => {
    update(s => ({
      ...s,
      clockRecords: s.clockRecords.map(r => (r.id === recordId ? { ...r, employeeNote: note } : r)),
      alerts: s.alerts.map(a => (a.recordId === recordId ? { ...a, employeeNote: note } : a)),
    }));
  };

  // ============ Alerts ============
  const markAlertRead: DataStoreContextValue['markAlertRead'] = (id) => {
    update(s => ({ ...s, alerts: s.alerts.map(a => (a.id === id ? { ...a, status: 'read' } : a)) }));
  };
  const resolveAlert: DataStoreContextValue['resolveAlert'] = (id, note) => {
    update(s => ({ ...s, alerts: s.alerts.map(a => (a.id === id ? { ...a, status: 'resolved', resolvedNote: note } : a)) }));
  };

  // ============ Settings ============
  const updateSettings: DataStoreContextValue['updateSettings'] = (patch) => {
    update(s => ({ ...s, settings: { ...s.settings, ...patch } }));
  };

  // ============ Consent ============
  const acceptConsent: DataStoreContextValue['acceptConsent'] = (employeeId) => {
    updateEmployee(employeeId, { consentAcceptedAt: new Date().toISOString() });
  };

  // ============ Derived ============
  const getEmployee = (id: string) => state.employees.find(e => e.id === id);
  const getDepartment = (id: string) => state.departments.find(d => d.id === id);
  const getShift = (id: string) => state.shifts.find(s => s.id === id);
  const getEmployeesByDepartment = (deptId: string) => state.employees.filter(e => e.departmentId === deptId);
  const getTodayRecords = () => {
    const today = new Date().toISOString().split('T')[0];
    return state.clockRecords.filter(r => r.timestamp.startsWith(today));
  };
  const getEmployeeTodayStatus = (empId: string): 'present' | 'absent' | 'left' => {
    const recs = getTodayRecords().filter(r => r.employeeId === empId);
    if (recs.length === 0) return 'absent';
    const last = recs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
    return last.type === 'entry' ? 'present' : 'left';
  };
  const getEmployeeRecords = (empId: string) =>
    state.clockRecords.filter(r => r.employeeId === empId).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // ============ Background absent evaluation ============
  useEffect(() => {
    const tick = () => {
      const todayRecs = getTodayRecords();
      const newAbsents = evaluateAbsentAlerts(state.employees, todayRecs, state.alerts, state.settings);
      if (newAbsents.length > 0) {
        update(s => ({ ...s, alerts: [...s.alerts, ...newAbsents] }));
      }
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.employees, state.alerts, state.settings.alertAbsent]);

  const value = useMemo<DataStoreContextValue>(
    () => ({
      ...state,
      adminId,
      addEmployee, updateEmployee, deleteEmployee,
      addDepartment, updateDepartment, deleteDepartment,
      addShift, deleteShift,
      addZone, updateZone, deleteZone,
      addClockRecord, addCorrectionRecord, addEmployeeNote,
      markAlertRead, resolveAlert,
      updateSettings,
      getEmployee, getDepartment, getShift, getEmployeesByDepartment,
      getTodayRecords, getEmployeeTodayStatus, getEmployeeRecords,
      acceptConsent,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, adminId],
  );

  return <DataStoreContext.Provider value={value}>{children}</DataStoreContext.Provider>;
}

export function useDataStore() {
  const ctx = useContext(DataStoreContext);
  if (!ctx) throw new Error('useDataStore must be used within DataStoreProvider');
  return ctx;
}
