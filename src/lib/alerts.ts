import type { Alert, ClockRecord, Employee, Shift, Zone, CompanySettings } from '@/types';
import { distanceToNearestZone } from './geofencing';

function uid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function diffMinutes(scheduled: string, actual: string): number {
  // scheduled: 'HH:MM', actual: ISO timestamp
  const [h, m] = scheduled.split(':').map(Number);
  const a = new Date(actual);
  const sched = new Date(a);
  sched.setHours(h, m, 0, 0);
  return Math.round((a.getTime() - sched.getTime()) / 60000);
}

/**
 * Evaluates the just-inserted record and returns alerts to add (out_of_zone, late, overtime).
 */
export function evaluateRecordAlerts(
  record: ClockRecord,
  employee: Employee,
  shift: Shift | undefined,
  zones: Zone[],
  todayRecords: ClockRecord[],
  settings: CompanySettings,
): Alert[] {
  const alerts: Alert[] = [];

  if (settings.alertOutZone && !record.inZone) {
    const nearest = distanceToNearestZone(record.lat, record.lng, zones);
    const distLabel = nearest ? `a ${nearest.distance < 1000 ? Math.round(nearest.distance) + 'm' : (nearest.distance / 1000).toFixed(1) + 'km'} de ${nearest.zone.name}` : 'sin zonas configuradas';
    alerts.push({
      id: uid('al'),
      employeeId: employee.id,
      type: 'out_of_zone',
      description: `${employee.name} fichó ${record.type === 'entry' ? 'entrada' : 'salida'} fuera de zona — ${record.address} (${distLabel})`,
      status: 'unread',
      createdAt: record.timestamp,
      recordId: record.id,
    });
  }

  if (settings.alertLate && shift && shift.startTime && record.type === 'entry') {
    const minsLate = diffMinutes(shift.startTime, record.timestamp);
    if (minsLate > shift.lateToleranceMinutes) {
      alerts.push({
        id: uid('al'),
        employeeId: employee.id,
        type: 'late',
        description: `${employee.name} fichó ${minsLate} minutos tarde — ${new Date(record.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}, turno ${shift.startTime}`,
        status: 'unread',
        createdAt: record.timestamp,
        recordId: record.id,
      });
    }
  }

  if (settings.alertOvertime && record.type === 'exit') {
    const worked = computeWorkedMinutes([...todayRecords, record].filter(r => r.employeeId === employee.id));
    const expected = shiftExpectedMinutes(shift);
    if (expected && worked > expected + 30) {
      const extra = worked - expected;
      alerts.push({
        id: uid('al'),
        employeeId: employee.id,
        type: 'overtime',
        description: `${employee.name} trabajó ${formatHm(worked)} (turno ${formatHm(expected)}) — +${formatHm(extra)} extra`,
        status: 'unread',
        createdAt: record.timestamp,
        recordId: record.id,
      });
    }
  }

  return alerts;
}

/**
 * Generates 'absent' alerts for active employees who haven't clocked in today
 * by the time `now` is past 10:00. Returns only NEW alerts not already in `existing`.
 */
export function evaluateAbsentAlerts(
  employees: Employee[],
  todayRecords: ClockRecord[],
  existing: Alert[],
  settings: CompanySettings,
  now: Date = new Date(),
): Alert[] {
  if (!settings.alertAbsent) return [];
  if (now.getHours() < 10) return [];
  const today = now.toISOString().split('T')[0];
  const out: Alert[] = [];
  for (const e of employees) {
    if (e.status !== 'active') continue;
    const hasRecord = todayRecords.some(r => r.employeeId === e.id);
    if (hasRecord) continue;
    const alreadyAlerted = existing.some(a => a.type === 'absent' && a.employeeId === e.id && a.createdAt.startsWith(today));
    if (alreadyAlerted) continue;
    out.push({
      id: uid('al'),
      employeeId: e.id,
      type: 'absent',
      description: `${e.name} no ha fichado hoy`,
      status: 'unread',
      createdAt: now.toISOString(),
    });
  }
  return out;
}

// ==================== Helpers ====================

export function computeWorkedMinutes(records: ClockRecord[]): number {
  // Pair entry→exit chronologically.
  const sorted = [...records].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  let total = 0;
  let openEntry: ClockRecord | null = null;
  for (const r of sorted) {
    if (r.type === 'entry') {
      openEntry = r;
    } else if (r.type === 'exit' && openEntry) {
      total += (new Date(r.timestamp).getTime() - new Date(openEntry.timestamp).getTime()) / 60000;
      openEntry = null;
    }
  }
  return Math.round(total);
}

export function shiftExpectedMinutes(shift: Shift | undefined): number {
  if (!shift || !shift.startTime || !shift.endTime) return 0;
  const [sh, sm] = shift.startTime.split(':').map(Number);
  const [eh, em] = shift.endTime.split(':').map(Number);
  let mins = (eh * 60 + em) - (sh * 60 + sm) - shift.breakMinutes;
  if (mins < 0) mins += 24 * 60;
  return mins;
}

export function formatHm(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, '0')}min`;
}
