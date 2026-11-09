import type { ReactNode } from 'react';
import { Bell, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDataStore } from '@/store/dataStore';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import Avatar from '@/components/brand/Avatar';
import StatusPill from '@/components/brand/StatusPill';
import { EmptyState, PageHeader, Panel, TryAppButton } from '@/components/admin/kit';
import { formatTime } from '@/types';
import { cn } from '@/lib/utils';

function KpiCard({ title, value, sub, tone = 'default' }: { title: string; value: ReactNode; sub: ReactNode; tone?: 'default' | 'blue' | 'black' }) {
  const inverted = tone !== 'default';
  return (
    <div className={cn('min-w-0 rounded-[20px] p-5',
      tone === 'blue' ? 'bg-brand text-primary-foreground' : tone === 'black' ? 'bg-primary text-primary-foreground' : 'border bg-background')}>
      <p className={cn('text-sm', !inverted && 'text-muted-foreground')}>{title}</p>
      <div className="mt-2 font-display text-[40px] font-extrabold leading-tight tracking-[-0.02em] tabular-nums">{value}</div>
      <div className={cn('mt-1 truncate text-[13px]', inverted ? 'opacity-90' : 'text-muted-foreground')}>{sub}</div>
    </div>
  );
}

const alertDots = { out_of_zone: 'bg-danger', late: 'bg-warning', absent: 'bg-violet-ink', overtime: 'bg-brand' };

export default function DashboardHome() {
  const { user } = useAuth();
  const { employees, departments, zones, settings, alerts, getTodayRecords, getEmployeeTodayStatus, getEmployee, getDepartment, getEmployeesByDepartment } = useDataStore();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 14 ? 'Buenos días' : hour < 21 ? 'Buenas tardes' : 'Buenas noches';
  const company = settings.companyName || user?.company || '';
  const dateLabel = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const capitalizedDate = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);

  const todayRecords = getTodayRecords();
  const todayEntries = todayRecords.filter(r => r.type === 'entry');
  const clockedCount = new Set(todayEntries.map(r => r.employeeId)).size;
  const presentNow = employees.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
  const notClocked = employees.filter(e => getEmployeeTodayStatus(e.id) === 'absent');
  const alreadyLeft = employees.filter(e => getEmployeeTodayStatus(e.id) === 'left').length;
  const unreadAlerts = alerts.filter(a => a.status === 'unread').length;
  const todayAlerts = alerts.filter(a => new Date(a.createdAt).toDateString() === now.toDateString());
  const timeline = [...todayRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const deptStatus = departments.map(d => {
    const members = getEmployeesByDepartment(d.id);
    return { ...d, total: members.length, present: members.filter(e => getEmployeeTodayStatus(e.id) === 'present').length };
  });

  const steps = [
    { title: 'Crea tu primera zona de fichaje', text: 'La oficina, la tienda o la obra', action: 'Crear zona', to: '/dashboard/zones?new=1', done: zones.length > 0 },
    { title: 'Crea un departamento', text: 'Con su turno por defecto', action: 'Crear', to: '/dashboard/departments?new=1', done: departments.length > 0 },
    { title: 'Añade a tu equipo', text: 'Cada persona recibe su PIN por email', action: 'Añadir', to: '/dashboard/employees?new=1', done: employees.length > 0 },
  ];
  const completedSteps = steps.filter(s => s.done).length;

  if (employees.length === 0) {
    return (
      <div className="space-y-6 max-w-[880px]">
        <PageHeader eyebrow="Bienvenido a ClockIn" title="Tu equipo fichará en 10 minutos" />
        <Panel className="p-5 sm:p-7">
          <p className="text-sm font-semibold text-brand">{completedSteps} de 3 pasos completados</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-brand" style={{ width: `${(completedSteps / 3) * 100}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Completa estos pasos y tu equipo podrá empezar a fichar hoy mismo.</p>
          <div className="mt-4 divide-y">
            {steps.map(step => (
              <div key={step.to} className="flex flex-wrap items-center gap-4 py-5">
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                  step.done ? 'bg-success text-success-foreground' : 'border-2 border-border bg-background')}
                  aria-label={step.done ? 'Completado' : 'Pendiente'}>
                  {step.done && <Check className="h-4 w-4" />}
                </span>
                <div className="min-w-0 flex-1 basis-[180px]">
                  <h3 className="text-[15px] font-semibold">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.text}</p>
                </div>
                <Button asChild className="h-11"><Link to={step.to}>{step.action}</Link></Button>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow={capitalizedDate} title={`${greeting}${company ? `, ${company}` : ''}`}
        actions={<Button asChild className="h-11"><Link to="/dashboard/records">Ver todos los fichajes →</Link></Button>} />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <KpiCard tone="blue" title="Ficharon hoy" value={<>{clockedCount}<span className="ml-1 text-xl opacity-80">/ {employees.length}</span></>}
          sub={`${Math.round((clockedCount / employees.length) * 100)} % del equipo`} />
        <KpiCard title="Trabajando ahora" value={presentNow} sub={`${alreadyLeft} ya han salido`} />
        <KpiCard title="Sin fichar" value={notClocked.length}
          sub={notClocked.length ? notClocked.map(e => e.name.split(' ')[0]).join(', ') : 'Todo el equipo ha fichado'} />
        <KpiCard title="Empleados" value={employees.length} sub={`en ${departments.length} departamentos`} />
        <KpiCard tone="black" title="Alertas sin leer" value={unreadAlerts}
          sub={<Link to="/dashboard/alerts" className="text-[13px] font-semibold text-primary-foreground hover:underline">Revisar ahora</Link>} />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <Panel className="min-w-0 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Actividad de hoy</h2>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-primary ci-blink" />En directo
            </span>
          </div>
          {timeline.length === 0 ? (
            <EmptyState icon={Bell} tint="amber" title="Todo en orden" text="Aquí verás los fichajes y los avisos en cuanto tu equipo empiece." action={<TryAppButton />} />
          ) : (
            <div className="max-h-[560px] divide-y overflow-y-auto">
              {timeline.slice(0, 20).map(r => {
                const emp = getEmployee(r.employeeId);
                const dept = emp ? getDepartment(emp.departmentId) : null;
                return (
                  <div key={r.id} className="flex items-center gap-3 py-3.5">
                    <Avatar name={emp?.name || 'Empleado'} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[15px] font-semibold">{emp?.name || 'Empleado'}</span>
                        <span className="text-sm text-muted-foreground">{r.type === 'entry' ? 'Entrada' : 'Salida'}</span>
                        {!r.inZone && <StatusPill variant="outzone" />}
                      </div>
                      <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{r.address}</p>
                    </div>
                    <div className="max-w-[30%] shrink-0 text-right">
                      <p className="text-[15px] font-semibold tabular-nums">{formatTime(r.timestamp)}</p>
                      {dept && <p className="truncate text-xs text-muted-foreground">{dept.name}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <div className="min-w-0 space-y-6">
          <Panel className="p-5">
            <h2 className="mb-4 text-base font-semibold">Presencia por departamento</h2>
            <div className="space-y-4">
              {deptStatus.length === 0 && <p className="text-sm text-muted-foreground">Sin departamentos creados.</p>}
              {deptStatus.map(d => {
                const pct = d.total ? (d.present / d.total) * 100 : 0;
                const color = pct === 100 ? 'bg-success' : pct === 0 ? 'bg-danger' : 'bg-warning';
                return (
                  <div key={d.id}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-medium">{d.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{d.present}/{d.total}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div className={cn('h-full rounded-full', color)} style={{ width: `${pct === 0 ? 100 : pct}%`, opacity: pct === 0 ? 0.9 : 1 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="mb-4 text-base font-semibold">Alertas de hoy</h2>
            <div className="space-y-3">
              {todayAlerts.length === 0 && <p className="text-sm text-muted-foreground">Sin alertas hoy.</p>}
              {todayAlerts.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', alertDots[a.type])} />
                  <p className={cn('min-w-0 text-[13px] leading-relaxed', a.status === 'unread' ? 'font-medium' : 'text-muted-foreground')}>{a.description}</p>
                </div>
              ))}
            </div>
            <Link to="/dashboard/alerts" className="mt-4 inline-block text-[13px] font-semibold hover:underline">Ver todas las alertas →</Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}
