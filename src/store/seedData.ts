import type { DataState, Employee, Department, ClockRecord, Zone, Alert } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_SHIFTS } from '@/types';

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];
const twoDaysAgo = new Date(today); twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const twoDaysAgoStr = twoDaysAgo.toISOString().split('T')[0];
const threeDaysAgo = new Date(today); threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0];
const fourDaysAgo = new Date(today); fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
const fourDaysAgoStr = fourDaysAgo.toISOString().split('T')[0];

function rec(id: string, empId: string, type: 'entry' | 'exit', dateStr: string, time: string, address: string, inZone: boolean, zoneId: string | null = 'z1', accuracy: number = 12): ClockRecord {
  return { id, employeeId: empId, type, timestamp: `${dateStr}T${time}:00`, lat: 40.4168, lng: -3.7038, address, accuracy, inZone, zoneId: inZone ? zoneId : null };
}

const alcala = 'Calle de Alcalá 45, Madrid';
const serrano = 'Calle de Serrano 20, Madrid';
const castellana = 'Paseo de la Castellana 100, Madrid';
const goya = 'Calle de Goya 8, Madrid';

const departments: Department[] = [
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

const employees: Employee[] = [
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

const clockRecords: ClockRecord[] = [
  rec('cr1', 'e1', 'entry', todayStr, '08:01', alcala, true),
  rec('cr2', 'e6', 'entry', todayStr, '08:03', alcala, true),
  rec('cr3', 'e2', 'entry', todayStr, '08:05', alcala, true),
  rec('cr4', 'e8', 'entry', todayStr, '08:12', serrano, false),
  rec('cr5', 'e11', 'entry', todayStr, '08:18', alcala, true),
  rec('cr6', 'e13', 'entry', todayStr, '08:31', alcala, true),
  rec('cr7', 'e14', 'entry', todayStr, '08:42', castellana, false),
  rec('cr8', 'e3', 'entry', todayStr, '08:58', alcala, true),
  rec('cr9', 'e7', 'entry', todayStr, '09:47', alcala, true),
  rec('cr10', 'e1', 'exit', todayStr, '12:30', alcala, true),
  rec('cr11', 'e6', 'exit', todayStr, '12:32', alcala, true),
  rec('cr12', 'e1', 'entry', todayStr, '13:30', alcala, true),
  rec('cr13', 'e6', 'entry', todayStr, '13:33', alcala, true),
  rec('cr14', 'e2', 'exit', todayStr, '14:02', alcala, true),
  rec('cr15', 'e11', 'exit', todayStr, '16:05', goya, false),
  rec('cr16', 'e5', 'entry', todayStr, '08:28', alcala, true),
  rec('cr17', 'e9', 'entry', todayStr, '08:25', alcala, true),
  rec('cr18', 'e15', 'entry', todayStr, '08:20', alcala, true),
  rec('cr19', 'e16', 'entry', todayStr, '08:22', alcala, true),
  rec('cr20', 'e17', 'entry', todayStr, '08:35', alcala, true),
  rec('cr21', 'e19', 'entry', todayStr, '08:15', alcala, true),
  rec('cr22', 'e20', 'entry', todayStr, '08:10', alcala, true),
  rec('cr23', 'e21', 'entry', todayStr, '08:29', alcala, true),
  rec('cr24', 'e22', 'entry', todayStr, '08:27', alcala, true),
  rec('cr30', 'e1', 'entry', yesterdayStr, '08:02', alcala, true),
  rec('cr31', 'e1', 'exit', yesterdayStr, '17:47', alcala, true),
  rec('cr32', 'e2', 'entry', yesterdayStr, '08:10', alcala, true),
  rec('cr33', 'e2', 'exit', yesterdayStr, '17:05', alcala, true),
  rec('cr34', 'e3', 'entry', yesterdayStr, '08:00', alcala, true),
  rec('cr35', 'e3', 'exit', yesterdayStr, '17:00', alcala, true),
  rec('cr36', 'e4', 'entry', yesterdayStr, '08:52', alcala, true),
  rec('cr37', 'e4', 'exit', yesterdayStr, '17:02', alcala, true),
  rec('cr38', 'e5', 'entry', yesterdayStr, '08:25', alcala, true),
  rec('cr39', 'e5', 'exit', yesterdayStr, '17:10', alcala, true),
  rec('cr40', 'e6', 'entry', yesterdayStr, '08:05', alcala, true),
  rec('cr41', 'e6', 'exit', yesterdayStr, '17:00', alcala, true),
  rec('cr42', 'e7', 'entry', yesterdayStr, '08:30', alcala, true),
  rec('cr43', 'e7', 'exit', yesterdayStr, '17:00', alcala, true),
  rec('cr44', 'e8', 'entry', yesterdayStr, '08:15', alcala, true),
  rec('cr45', 'e8', 'exit', yesterdayStr, '17:00', alcala, true),
  rec('cr46', 'e9', 'entry', yesterdayStr, '08:20', 'Centro Comercial La Vaguada, Madrid', false),
  rec('cr47', 'e9', 'exit', yesterdayStr, '17:00', alcala, true),
  rec('cr48', 'e10', 'entry', yesterdayStr, '08:28', alcala, true),
  rec('cr49', 'e10', 'exit', yesterdayStr, '17:00', 'Estación de Atocha, Madrid', false),
  rec('cr50', 'e11', 'entry', yesterdayStr, '08:10', alcala, true),
  rec('cr51', 'e11', 'exit', yesterdayStr, '17:00', alcala, true),
  rec('cr80', 'e1', 'entry', twoDaysAgoStr, '08:05', alcala, true),
  rec('cr81', 'e1', 'exit', twoDaysAgoStr, '17:00', alcala, true),
  rec('cr82', 'e2', 'entry', twoDaysAgoStr, '08:15', alcala, true),
  rec('cr83', 'e2', 'exit', twoDaysAgoStr, '17:10', alcala, true),
  rec('cr84', 'e3', 'entry', twoDaysAgoStr, '08:00', alcala, true),
  rec('cr85', 'e3', 'exit', twoDaysAgoStr, '18:12', alcala, true),
  rec('cr90', 'e1', 'entry', threeDaysAgoStr, '08:00', alcala, true),
  rec('cr91', 'e1', 'exit', threeDaysAgoStr, '17:00', alcala, true),
  rec('cr100', 'e1', 'entry', fourDaysAgoStr, '08:10', alcala, true),
  rec('cr101', 'e1', 'exit', fourDaysAgoStr, '17:00', alcala, true),
];

const zones: Zone[] = [
  { id: 'z1', name: 'Oficina Central', address: 'Calle de Alcalá 45, Madrid', lat: 40.4189, lng: -3.6989, radiusMeters: 150, assignedTo: ['all'], active: true },
  { id: 'z2', name: 'Oficina Satélite', address: 'Calle de Velázquez 20, Madrid', lat: 40.4230, lng: -3.6860, radiusMeters: 100, assignedTo: ['d3', 'd4'], active: true },
  { id: 'z3', name: 'Almacén Norte', address: 'Polígono Industrial San Fernando', lat: 40.4530, lng: -3.6430, radiusMeters: 200, assignedTo: ['d7'], active: true },
];

const alertsSeed: Alert[] = [
  { id: 'a1', employeeId: 'e8', type: 'out_of_zone', description: 'Lucía Fernández fichó entrada fuera de zona — Calle de Serrano 20 (a 1.2km)', status: 'unread', createdAt: `${todayStr}T08:12:00` },
  { id: 'a2', employeeId: 'e14', type: 'out_of_zone', description: 'David Rodríguez fichó entrada fuera de zona — Castellana 100 (a 800m)', status: 'unread', createdAt: `${todayStr}T08:42:00` },
  { id: 'a3', employeeId: 'e11', type: 'out_of_zone', description: 'Jorge Pérez fichó salida fuera de zona — Calle de Goya 8 (a 650m)', status: 'unread', createdAt: `${todayStr}T16:05:00` },
  { id: 'a6', employeeId: 'e7', type: 'late', description: 'Laura Medina fichó 47 minutos tarde — 09:47, turno 09:00', status: 'unread', createdAt: `${todayStr}T09:47:00` },
  { id: 'a7', employeeId: 'e13', type: 'late', description: 'Elena Sánchez fichó 1 minuto tarde — 08:31, turno 08:30', status: 'read', createdAt: `${todayStr}T08:31:00` },
  { id: 'a10', employeeId: 'e4', type: 'absent', description: 'Pablo Navarro no ha fichado hoy — Último: ayer 17:02', status: 'unread', createdAt: `${todayStr}T10:00:00` },
  { id: 'a13', employeeId: 'e1', type: 'overtime', description: 'Carlos Martínez trabajó 9h 45min (turno 8h) — Ayer', status: 'read', createdAt: `${yesterdayStr}T18:00:00` },
  { id: 'a15', employeeId: 'e2', type: 'overtime', description: 'Marcos García acumula 6h extra esta semana', status: 'unread', createdAt: `${todayStr}T12:00:00` },
];

export function buildDemoSeed(): DataState {
  return {
    employees: structuredClone(employees),
    departments: structuredClone(departments),
    shifts: structuredClone(DEFAULT_SHIFTS),
    zones: structuredClone(zones),
    clockRecords: structuredClone(clockRecords),
    alerts: structuredClone(alertsSeed),
    settings: { ...DEFAULT_SETTINGS, companyName: 'TechCorp SL', cif: 'B12345678' },
  };
}

export function buildEmptyDataset(companyName: string, cif?: string): DataState {
  return {
    employees: [],
    departments: [],
    shifts: structuredClone(DEFAULT_SHIFTS),
    zones: [],
    clockRecords: [],
    alerts: [],
    settings: { ...DEFAULT_SETTINGS, companyName, cif: cif || '' },
  };
}
