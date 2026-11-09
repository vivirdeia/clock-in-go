// ==================== DOMAIN TYPES ====================

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  departmentId: string;
  shiftId: string;
  pin: string;
  status: 'active' | 'inactive';
  createdAt: string;
  consentAcceptedAt?: string;
}

export interface Department {
  id: string;
  name: string;
  managerId: string;
  description: string;
  defaultShiftId: string;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  lateToleranceMinutes: number;
}

export interface ClockRecord {
  id: string;
  employeeId: string;
  type: 'entry' | 'exit';
  timestamp: string;
  lat: number;
  lng: number;
  address: string;
  accuracy: number;
  inZone: boolean;
  zoneId: string | null;
  /** Set when this record corrects a previous one (admin manual fix). */
  correctsId?: string;
  /** True when created/edited by an admin, not by the employee. */
  editedByAdmin?: boolean;
  /** Motivo indicado por el empleado (p. ej. al fichar fuera de zona). */
  employeeNote?: string;
  /** Motivo de la corrección administrativa. */
  reason?: string;
  /** Admin que creó la corrección. */
  correctedBy?: string;
  /** Fecha de creación de la corrección (ISO). */
  correctedAt?: string;
}

export interface Zone {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  /** Department ids, or ['all']. */
  assignedTo: string[];
  active: boolean;
}

export type AlertType = 'out_of_zone' | 'late' | 'absent' | 'overtime';

export interface Alert {
  id: string;
  employeeId: string;
  type: AlertType;
  description: string;
  status: 'unread' | 'read' | 'resolved';
  resolvedNote?: string;
  createdAt: string;
  /** Linked clock record when applicable. */
  recordId?: string;
  /** Motivo indicado por el empleado. */
  employeeNote?: string;
}

export interface CompanySettings {
  companyName: string;
  cif: string;
  timezone: string;
  timeFormat: '24h' | '12h';
  pressTimeSeconds: number;
  requireGps: boolean;
  vibration: boolean;
  sound: boolean;
  alertOutZone: boolean;
  alertLate: boolean;
  alertAbsent: boolean;
  alertOvertime: boolean;
  consentText: string;
  requireConsent: boolean;
}

export interface DataState {
  employees: Employee[];
  departments: Department[];
  shifts: Shift[];
  zones: Zone[];
  clockRecords: ClockRecord[];
  alerts: Alert[];
  settings: CompanySettings;
}

// ==================== HELPERS (pure) ====================

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const DEFAULT_SETTINGS: CompanySettings = {
  companyName: '',
  cif: '',
  timezone: 'europe_madrid',
  timeFormat: '24h',
  pressTimeSeconds: 2,
  requireGps: true,
  vibration: true,
  sound: true,
  alertOutZone: true,
  alertLate: true,
  alertAbsent: true,
  alertOvertime: true,
  consentText:
    'Al utilizar ClockIn, consiento que se registre la hora y ubicación GPS de mis fichajes con el fin de control horario según el RD-ley 8/2019. La ubicación se captura exclusivamente en el momento del fichaje y no se realiza seguimiento continuo.',
  requireConsent: true,
};

export const DEFAULT_SHIFTS: Shift[] = [
  { id: 's1', name: 'Mañana', startTime: '08:30', endTime: '17:00', breakMinutes: 30, lateToleranceMinutes: 5 },
  { id: 's2', name: 'Tarde', startTime: '14:00', endTime: '22:00', breakMinutes: 30, lateToleranceMinutes: 5 },
  { id: 's3', name: 'Flexible', startTime: '', endTime: '', breakMinutes: 0, lateToleranceMinutes: 0 },
];

export const PLAN_LIMITS: Record<'starter' | 'business' | 'enterprise', { employees: number; zones: number }> = {
  starter: { employees: 5, zones: 1 },
  business: { employees: 25, zones: 10 },
  enterprise: { employees: 100, zones: Infinity },
};
