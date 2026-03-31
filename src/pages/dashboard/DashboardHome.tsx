import { employees, departments, clockRecords, alerts, getTodayRecords, getEmployeeTodayStatus, getEmployee, getDepartment, getEmployeesByDepartment, formatTime, getInitials } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, AlertTriangle, Clock as ClockIcon, Users, MapPin, Timer } from 'lucide-react';
import { Link } from 'react-router-dom';

function KpiCard({ title, value, sub, trend, icon: Icon, color }: { title: string; value: string | number; sub?: string; trend?: string; icon: any; color?: string }) {
  return (
    <div className="bg-background rounded-card border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center"><Icon className="w-4 h-4" /></div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      {trend && <p className="text-xs text-success mt-1 flex items-center gap-1"><ArrowUp className="w-3 h-3" />{trend}</p>}
    </div>
  );
}

export default function DashboardHome() {
  const todayRecords = getTodayRecords();
  const todayEntries = todayRecords.filter(r => r.type === 'entry');
  const uniqueEmployeesToday = new Set(todayEntries.map(r => r.employeeId));
  const clockedCount = uniqueEmployeesToday.size;
  const presentNow = employees.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
  const notClocked = employees.filter(e => getEmployeeTodayStatus(e.id) === 'absent');
  const todayAlerts = alerts.filter(a => {
    const d = new Date();
    return a.createdAt.startsWith(d.toISOString().split('T')[0]);
  });
  const unreadAlerts = todayAlerts.filter(a => a.status === 'unread');

  // Timeline
  const timeline = [...todayRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  // Department status
  const deptStatus = departments.map(d => {
    const emps = getEmployeesByDepartment(d.id);
    const present = emps.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
    const outOfZone = todayRecords.filter(r => !r.inZone && emps.some(e => e.id === r.employeeId)).length;
    return { ...d, total: emps.length, present, outOfZone };
  });

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard icon={Users} title="Empleados totales" value={employees.length} trend="+2 este mes" />
        <KpiCard icon={ClockIcon} title="Ficharon hoy" value={`${clockedCount} de ${employees.length}`} sub={`${Math.round(clockedCount / employees.length * 100)}%`} />
        <KpiCard icon={MapPin} title="En oficina ahora" value={presentNow} sub="Presentes" />
        <KpiCard icon={Users} title="No han fichado" value={notClocked.length} sub={notClocked.slice(0, 2).map(e => e.name.split(' ')[0]).join(', ')} />
        <KpiCard icon={Timer} title="Horas medias hoy" value="6h 42min" trend="+12min vs ayer" />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-3 bg-background rounded-card border p-5">
          <h3 className="font-bold mb-4">Timeline en tiempo real</h3>
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-2">
            {timeline.slice(0, 15).map(rec => {
              const emp = getEmployee(rec.employeeId);
              const dept = emp ? getDepartment(emp.departmentId) : null;
              const isLate = rec.type === 'entry' && rec.timestamp.includes('T08:3') || rec.timestamp.includes('T09:');
              return (
                <div key={rec.id} className="flex items-start gap-3 animate-fade-in-up">
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {emp ? getInitials(emp.name) : '??'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{emp?.name}</span>
                      <span className="text-muted-foreground text-sm">{rec.type === 'entry' ? '→ Entrada' : '← Salida'}</span>
                      {!rec.inZone && <span className="text-destructive text-xs flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />Fuera de zona</span>}
                      {isLate && rec.type === 'entry' && <Badge variant="outline" className="text-warning border-warning text-xs py-0">Tardío</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{rec.address}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-sm tabular-nums">{formatTime(rec.timestamp)}</span>
                    {dept && <p className="text-xs text-muted-foreground">{dept.name}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department status */}
          <div className="bg-background rounded-card border p-5">
            <h3 className="font-bold mb-4">Estado por departamento</h3>
            <div className="space-y-3">
              {deptStatus.map(d => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.present}/{d.total}</span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full">
                      <div className={`h-full rounded-full transition-all ${d.present === d.total ? 'bg-success' : d.present === 0 ? 'bg-destructive' : 'bg-warning'}`}
                        style={{ width: `${(d.present / d.total) * 100}%` }} />
                    </div>
                  </div>
                  {d.outOfZone > 0 && <span className="text-xs text-destructive flex-shrink-0">{d.outOfZone} fuera</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-background rounded-card border p-5">
            <h3 className="font-bold mb-4">Alertas del día</h3>
            <div className="space-y-3">
              {todayAlerts.slice(0, 5).map(a => {
                const icon = a.type === 'out_of_zone' ? '⚠️' : a.type === 'late' ? '⏰' : a.type === 'absent' ? '❌' : '⏱️';
                return (
                  <div key={a.id} className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{icon}</span>
                    <p className={`text-xs leading-relaxed ${a.status === 'unread' ? 'font-medium' : 'text-muted-foreground'}`}>{a.description}</p>
                  </div>
                );
              })}
            </div>
            <Link to="/dashboard/alerts" className="text-sm text-foreground font-medium mt-4 block hover:underline">Ver todas las alertas →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
