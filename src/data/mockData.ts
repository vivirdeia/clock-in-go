// ==================== TYPES ====================
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
}

export interface Zone {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  radiusMeters: number;
  assignedTo: string[];
  active: boolean;
}

export interface Alert {
  id: string;
  employeeId: string;
  type: 'out_of_zone' | 'late' | 'absent' | 'overtime';
  description: string;
  status: 'unread' | 'read' | 'resolved';
  resolvedNote?: string;
  createdAt: string;
}

// ==================== DATA ====================

export const shifts: Shift[] = [
  { id: 's1', name: 'Mañana', startTime: '08:30', endTime: '17:00', breakMinutes: 30, lateToleranceMinutes: 5 },
  { id: 's2', name: 'Tarde', startTime: '14:00', endTime: '22:00', breakMinutes: 30, lateToleranceMinutes: 5 },
  { id: 's3', name: 'Flexible', startTime: '', endTime: '', breakMinutes: 0, lateToleranceMinutes: 0 },
];

export const departments: Department[] = [
  { id: 'd1', name: 'Desarrollo', managerId: 'e1', description: 'Equipo de desarrollo de software', defaultShiftId: 's1' },
  { id: 'd2', name: 'Diseño', managerId: 'e6', description: 'Equipo de diseño UX/UI', defaultShiftId: 's1' },
  { id: 'd3', name: 'Marketing', managerId: 'e8', description: 'Equipo de marketing y comunicación', defaultShiftId: 's1' },
  { id: 'd4', name: 'Ventas', managerId: 'e11', description: 'Equipo comercial', defaultShiftId: 's1' },
  { id: 'd5', name: 'RRHH', managerId: 'e13', description: 'Recursos humanos', defaultShiftId: 's1' },
  { id: 'd6', name: 'Dirección', managerId: 'e14', description: 'Dirección general', defaultShiftId: 's3' },
  { id: 'd7', name: 'Soporte', managerId: 'e15', description: 'Atención al cliente y soporte técnico', defaultShiftId: 's1' },
  { id: 'd8', name: 'Contabilidad', managerId: 'e19', description: 'Contabilidad y finanzas', defaultShiftId: 's1' },
  { id: 'd9', name: 'Producto', managerId: 'e21', description: 'Gestión de producto', defaultShiftId: 's1' },
];

export const employees: Employee[] = [
  { id: 'e1', name: 'Carlos Martínez', email: 'carlos@techcorp.es', phone: '+34 612 345 678', departmentId: 'd1', shiftId: 's1', pin: '1234', status: 'active', createdAt: '2024-01-15' },
  { id: 'e2', name: 'Marcos García', email: 'marcos@techcorp.es', phone: '+34 612 345 679', departmentId: 'd1', shiftId: 's1', pin: '2345', status: 'active', createdAt: '2024-02-01' },
  { id: 'e3', name: 'Roberto Hernández', email: 'roberto@techcorp.es', phone: '+34 612 345 680', departmentId: 'd1', shiftId: 's1', pin: '3456', status: 'active', createdAt: '2024-02-15' },
  { id: 'e4', name: 'Pablo Navarro', email: 'pablo@techcorp.es', phone: '+34 612 345 681', departmentId: 'd1', shiftId: 's1', pin: '4567', status: 'active', createdAt: '2024-03-01' },
  { id: 'e5', name: 'Adrián Blanco', email: 'adrian@techcorp.es', phone: '+34 612 345 682', departmentId: 'd1', shiftId: 's1', pin: '5678', status: 'active', createdAt: '2024-03-15' },
  { id: 'e6', name: 'Ana Torres', email: 'ana@techcorp.es', phone: '+34 612 345 683', departmentId: 'd2', shiftId: 's1', pin: '6789', status: 'active', createdAt: '2024-01-20' },
  { id: 'e7', name: 'Laura Medina', email: 'laura@techcorp.es', phone: '+34 612 345 684', departmentId: 'd2', shiftId: 's1', pin: '7890', status: 'active', createdAt: '2024-02-10' },
  { id: 'e8', name: 'Lucía Fernández', email: 'lucia@techcorp.es', phone: '+34 612 345 685', departmentId: 'd3', shiftId: 's1', pin: '8901', status: 'active', createdAt: '2024-01-25' },
  { id: 'e9', name: 'Isabel Moreno', email: 'isabel@techcorp.es', phone: '+34 612 345 686', departmentId: 'd3', shiftId: 's1', pin: '9012', status: 'active', createdAt: '2024-02-20' },
  { id: 'e10', name: 'Carmen Díaz', email: 'carmen@techcorp.es', phone: '+34 612 345 687', departmentId: 'd3', shiftId: 's1', pin: '0123', status: 'active', createdAt: '2024-03-05' },
  { id: 'e11', name: 'Jorge Pérez', email: 'jorge@techcorp.es', phone: '+34 612 345 688', departmentId: 'd4', shiftId: 's1', pin: '1357', status: 'active', createdAt: '2024-01-10' },
  { id: 'e12', name: 'Elena López', email: 'elena.l@techcorp.es', phone: '+34 612 345 689', departmentId: 'd4', shiftId: 's1', pin: '2468', status: 'active', createdAt: '2024-02-25' },
  { id: 'e13', name: 'Elena Sánchez', email: 'elena.s@techcorp.es', phone: '+34 612 345 690', departmentId: 'd5', shiftId: 's1', pin: '3579', status: 'active', createdAt: '2024-01-05' },
  { id: 'e14', name: 'David Rodríguez', email: 'david@techcorp.es', phone: '+34 612 345 691', departmentId: 'd6', shiftId: 's3', pin: '4680', status: 'active', createdAt: '2024-01-01' },
  { id: 'e15', name: 'Óscar Méndez', email: 'oscar@techcorp.es', phone: '+34 612 345 692', departmentId: 'd7', shiftId: 's1', pin: '5791', status: 'active', createdAt: '2024-02-05' },
  { id: 'e16', name: 'Sara Vega', email: 'sara@techcorp.es', phone: '+34 612 345 693', departmentId: 'd7', shiftId: 's1', pin: '6802', status: 'active', createdAt: '2024-02-28' },
  { id: 'e17', name: 'Cristina Romero', email: 'cristina@techcorp.es', phone: '+34 612 345 694', departmentId: 'd7', shiftId: 's1', pin: '7913', status: 'active', createdAt: '2024-03-10' },
  { id: 'e18', name: 'Javier López', email: 'javier@techcorp.es', phone: '+34 612 345 695', departmentId: 'd7', shiftId: 's2', pin: '8024', status: 'active', createdAt: '2024-03-20' },
  { id: 'e19', name: 'Andrea Blanco', email: 'andrea@techcorp.es', phone: '+34 612 345 696', departmentId: 'd8', shiftId: 's1', pin: '9135', status: 'active', createdAt: '2024-01-30' },
  { id: 'e20', name: 'Miguel Navarro', email: 'miguel@techcorp.es', phone: '+34 612 345 697', departmentId: 'd8', shiftId: 's1', pin: '0246', status: 'active', createdAt: '2024-02-15' },
  { id: 'e21', name: 'Diego Torres', email: 'diego@techcorp.es', phone: '+34 612 345 698', departmentId: 'd9', shiftId: 's1', pin: '1358', status: 'active', createdAt: '2024-03-01' },
  { id: 'e22', name: 'Raquel Ruiz', email: 'raquel@techcorp.es', phone: '+34 612 345 699', departmentId: 'd9', shiftId: 's1', pin: '2469', status: 'active', createdAt: '2024-03-15' },
];

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
const fourDaysAgo = new Date(today);
fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
const fourDaysAgoStr = fourDaysAgo.toISOString().split('T')[0];

function makeRecord(id: string, empId: string, type: 'entry' | 'exit', dateStr: string, time: string, address: string, inZone: boolean, zoneId: string | null = 'z1', accuracy: number = 12): ClockRecord {
  return {
    id, employeeId: empId, type, timestamp: `${dateStr}T${time}:00`, lat: 40.4168, lng: -3.7038, address, accuracy, inZone, zoneId: inZone ? zoneId : null,
  };
}

const alcala = 'Calle de Alcalá 45, Madrid';
const serrano = 'Calle de Serrano 20, Madrid';
const castellana = 'Paseo de la Castellana 100, Madrid';
const goya = 'Calle de Goya 8, Madrid';

export const clockRecords: ClockRecord[] = [
  // Today
  makeRecord('cr1', 'e1', 'entry', todayStr, '08:01', alcala, true),
  makeRecord('cr2', 'e6', 'entry', todayStr, '08:03', alcala, true),
  makeRecord('cr3', 'e2', 'entry', todayStr, '08:05', alcala, true),
  makeRecord('cr4', 'e8', 'entry', todayStr, '08:12', serrano, false),
  makeRecord('cr5', 'e11', 'entry', todayStr, '08:18', alcala, true),
  makeRecord('cr6', 'e13', 'entry', todayStr, '08:31', alcala, true),
  makeRecord('cr7', 'e14', 'entry', todayStr, '08:42', castellana, false),
  makeRecord('cr8', 'e3', 'entry', todayStr, '08:58', alcala, true),
  makeRecord('cr9', 'e7', 'entry', todayStr, '09:47', alcala, true),
  makeRecord('cr10', 'e1', 'exit', todayStr, '12:30', alcala, true),
  makeRecord('cr11', 'e6', 'exit', todayStr, '12:32', alcala, true),
  makeRecord('cr12', 'e1', 'entry', todayStr, '13:30', alcala, true),
  makeRecord('cr13', 'e6', 'entry', todayStr, '13:33', alcala, true),
  makeRecord('cr14', 'e2', 'exit', todayStr, '14:02', alcala, true),
  makeRecord('cr15', 'e11', 'exit', todayStr, '16:05', goya, false),
  makeRecord('cr16', 'e5', 'entry', todayStr, '08:28', alcala, true),
  makeRecord('cr17', 'e9', 'entry', todayStr, '08:25', alcala, true),
  makeRecord('cr18', 'e15', 'entry', todayStr, '08:20', alcala, true),
  makeRecord('cr19', 'e16', 'entry', todayStr, '08:22', alcala, true),
  makeRecord('cr20', 'e17', 'entry', todayStr, '08:35', alcala, true),
  makeRecord('cr21', 'e19', 'entry', todayStr, '08:15', alcala, true),
  makeRecord('cr22', 'e20', 'entry', todayStr, '08:10', alcala, true),
  makeRecord('cr23', 'e21', 'entry', todayStr, '08:29', alcala, true),
  makeRecord('cr24', 'e22', 'entry', todayStr, '08:27', alcala, true),
  // Yesterday
  makeRecord('cr30', 'e1', 'entry', yesterdayStr, '08:02', alcala, true),
  makeRecord('cr31', 'e1', 'exit', yesterdayStr, '17:47', alcala, true),
  makeRecord('cr32', 'e2', 'entry', yesterdayStr, '08:10', alcala, true),
  makeRecord('cr33', 'e2', 'exit', yesterdayStr, '17:05', alcala, true),
  makeRecord('cr34', 'e3', 'entry', yesterdayStr, '08:00', alcala, true),
  makeRecord('cr35', 'e3', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr36', 'e4', 'entry', yesterdayStr, '08:52', alcala, true),
  makeRecord('cr37', 'e4', 'exit', yesterdayStr, '17:02', alcala, true),
  makeRecord('cr38', 'e5', 'entry', yesterdayStr, '08:25', alcala, true),
  makeRecord('cr39', 'e5', 'exit', yesterdayStr, '17:10', alcala, true),
  makeRecord('cr40', 'e6', 'entry', yesterdayStr, '08:05', alcala, true),
  makeRecord('cr41', 'e6', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr42', 'e7', 'entry', yesterdayStr, '08:30', alcala, true),
  makeRecord('cr43', 'e7', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr44', 'e8', 'entry', yesterdayStr, '08:15', alcala, true),
  makeRecord('cr45', 'e8', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr46', 'e9', 'entry', yesterdayStr, '08:20', 'Centro Comercial La Vaguada, Madrid', false),
  makeRecord('cr47', 'e9', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr48', 'e10', 'entry', yesterdayStr, '08:28', alcala, true),
  makeRecord('cr49', 'e10', 'exit', yesterdayStr, '17:00', 'Estación de Atocha, Madrid', false),
  makeRecord('cr50', 'e11', 'entry', yesterdayStr, '08:10', alcala, true),
  makeRecord('cr51', 'e11', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr52', 'e12', 'entry', yesterdayStr, '08:30', alcala, true),
  makeRecord('cr53', 'e12', 'exit', yesterdayStr, '17:05', alcala, true),
  makeRecord('cr54', 'e13', 'entry', yesterdayStr, '08:25', alcala, true),
  makeRecord('cr55', 'e13', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr56', 'e14', 'entry', yesterdayStr, '09:00', castellana, false),
  makeRecord('cr57', 'e14', 'exit', yesterdayStr, '18:00', castellana, false),
  makeRecord('cr58', 'e15', 'entry', yesterdayStr, '08:45', alcala, true),
  makeRecord('cr59', 'e15', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr60', 'e16', 'entry', yesterdayStr, '08:20', alcala, true),
  makeRecord('cr61', 'e16', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr62', 'e17', 'entry', yesterdayStr, '08:30', alcala, true),
  makeRecord('cr63', 'e17', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr64', 'e19', 'entry', yesterdayStr, '08:15', alcala, true),
  makeRecord('cr65', 'e19', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr66', 'e20', 'entry', yesterdayStr, '08:10', alcala, true),
  makeRecord('cr67', 'e20', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr68', 'e21', 'entry', yesterdayStr, '08:28', alcala, true),
  makeRecord('cr69', 'e21', 'exit', yesterdayStr, '17:00', alcala, true),
  makeRecord('cr70', 'e22', 'entry', yesterdayStr, '08:25', alcala, true),
  makeRecord('cr71', 'e22', 'exit', yesterdayStr, '17:00', alcala, true),
  // Two days ago
  makeRecord('cr80', 'e1', 'entry', twoDaysAgoStr, '08:05', alcala, true),
  makeRecord('cr81', 'e1', 'exit', twoDaysAgoStr, '17:00', alcala, true),
  makeRecord('cr82', 'e2', 'entry', twoDaysAgoStr, '08:15', alcala, true),
  makeRecord('cr83', 'e2', 'exit', twoDaysAgoStr, '17:10', alcala, true),
  makeRecord('cr84', 'e3', 'entry', twoDaysAgoStr, '08:00', alcala, true),
  makeRecord('cr85', 'e3', 'exit', twoDaysAgoStr, '18:12', alcala, true),
  makeRecord('cr86', 'e6', 'entry', twoDaysAgoStr, '08:10', alcala, true),
  makeRecord('cr87', 'e6', 'exit', twoDaysAgoStr, '17:00', alcala, true),
  makeRecord('cr88', 'e11', 'entry', twoDaysAgoStr, '08:20', alcala, true),
  makeRecord('cr89', 'e11', 'exit', twoDaysAgoStr, '17:00', alcala, true),
  // Three days ago
  makeRecord('cr90', 'e1', 'entry', threeDaysAgoStr, '08:00', alcala, true),
  makeRecord('cr91', 'e1', 'exit', threeDaysAgoStr, '17:00', alcala, true),
  makeRecord('cr92', 'e15', 'entry', threeDaysAgoStr, '08:45', alcala, true),
  makeRecord('cr93', 'e15', 'exit', threeDaysAgoStr, '17:00', alcala, true),
  // Four days ago
  makeRecord('cr100', 'e1', 'entry', fourDaysAgoStr, '08:10', alcala, true),
  makeRecord('cr101', 'e1', 'exit', fourDaysAgoStr, '17:00', alcala, true),
];

export const zones: Zone[] = [
  { id: 'z1', name: 'Oficina Central', address: 'Calle de Alcalá 45, Madrid', lat: 40.4189, lng: -3.6989, radiusMeters: 150, assignedTo: ['all'], active: true },
  { id: 'z2', name: 'Oficina Satélite', address: 'Calle de Velázquez 20, Madrid', lat: 40.4230, lng: -3.6860, radiusMeters: 100, assignedTo: ['d3', 'd4'], active: true },
  { id: 'z3', name: 'Almacén Norte', address: 'Polígono Industrial San Fernando', lat: 40.4530, lng: -3.6430, radiusMeters: 200, assignedTo: ['d7'], active: true },
  { id: 'z4', name: 'Coworking WeWork', address: 'Paseo de la Castellana 77', lat: 40.4400, lng: -3.6910, radiusMeters: 80, assignedTo: ['all'], active: false },
];

export const alerts: Alert[] = [
  // Out of zone
  { id: 'a1', employeeId: 'e8', type: 'out_of_zone', description: 'Lucía Fernández fichó entrada fuera de zona — Calle de Serrano 20 (a 1.2km de Oficina Central)', status: 'unread', createdAt: `${todayStr}T08:12:00` },
  { id: 'a2', employeeId: 'e14', type: 'out_of_zone', description: 'David Rodríguez fichó entrada fuera de zona — Paseo de la Castellana 100 (a 800m)', status: 'unread', createdAt: `${todayStr}T08:42:00` },
  { id: 'a3', employeeId: 'e11', type: 'out_of_zone', description: 'Jorge Pérez fichó salida fuera de zona — Calle de Goya 8 (a 650m)', status: 'unread', createdAt: `${todayStr}T16:05:00` },
  { id: 'a4', employeeId: 'e9', type: 'out_of_zone', description: 'Isabel Moreno fichó entrada fuera de zona — Centro Comercial La Vaguada (a 4.5km)', status: 'read', createdAt: `${yesterdayStr}T08:20:00` },
  { id: 'a5', employeeId: 'e10', type: 'out_of_zone', description: 'Carmen Díaz fichó salida fuera de zona — Estación de Atocha (a 2.1km)', status: 'resolved', resolvedNote: 'Reunión con cliente en Atocha, justificado', createdAt: `${twoDaysAgoStr}T17:00:00` },
  // Late
  { id: 'a6', employeeId: 'e7', type: 'late', description: 'Laura Medina fichó 47 minutos tarde — 09:47, turno 09:00', status: 'unread', createdAt: `${todayStr}T09:47:00` },
  { id: 'a7', employeeId: 'e13', type: 'late', description: 'Elena Sánchez fichó 1 minuto tarde — 08:31, turno 08:30', status: 'read', createdAt: `${todayStr}T08:31:00` },
  { id: 'a8', employeeId: 'e4', type: 'late', description: 'Pablo Navarro fichó 22 minutos tarde — 08:52, turno 08:30', status: 'read', createdAt: `${yesterdayStr}T08:52:00` },
  { id: 'a9', employeeId: 'e15', type: 'late', description: 'Óscar Méndez fichó 15 minutos tarde — 08:45, turno 08:30', status: 'resolved', resolvedNote: 'Retraso de metro', createdAt: `${threeDaysAgoStr}T08:45:00` },
  // Absent
  { id: 'a10', employeeId: 'e4', type: 'absent', description: 'Pablo Navarro no ha fichado hoy — Último: ayer 17:02', status: 'unread', createdAt: `${todayStr}T10:00:00` },
  { id: 'a11', employeeId: 'e12', type: 'absent', description: 'Elena López no fichó el viernes 21', status: 'read', createdAt: `${twoDaysAgoStr}T10:00:00` },
  { id: 'a12', employeeId: 'e18', type: 'absent', description: 'Javier López ausente 2 días (20-21 marzo)', status: 'resolved', resolvedNote: 'Baja médica', createdAt: `${threeDaysAgoStr}T10:00:00` },
  // Overtime
  { id: 'a13', employeeId: 'e1', type: 'overtime', description: 'Carlos Martínez trabajó 9h 45min (turno 8h) — Ayer', status: 'read', createdAt: `${yesterdayStr}T18:00:00` },
  { id: 'a14', employeeId: 'e3', type: 'overtime', description: 'Roberto Hernández trabajó 10h 12min — Hace 2 días', status: 'read', createdAt: `${twoDaysAgoStr}T18:12:00` },
  { id: 'a15', employeeId: 'e2', type: 'overtime', description: 'Marcos García acumula 6h extra esta semana', status: 'unread', createdAt: `${todayStr}T12:00:00` },
];

// ==================== HELPERS ====================

export function getEmployee(id: string) {
  return employees.find(e => e.id === id);
}

export function getDepartment(id: string) {
  return departments.find(d => d.id === id);
}

export function getShift(id: string) {
  return shifts.find(s => s.id === id);
}

export function getEmployeesByDepartment(deptId: string) {
  return employees.filter(e => e.departmentId === deptId);
}

export function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function getTodayRecords() {
  return clockRecords.filter(r => r.timestamp.startsWith(todayStr));
}

export function getEmployeeTodayStatus(empId: string): 'present' | 'absent' | 'left' {
  const todayRecs = getTodayRecords().filter(r => r.employeeId === empId);
  if (todayRecs.length === 0) return 'absent';
  const last = todayRecs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];
  return last.type === 'entry' ? 'present' : 'left';
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
