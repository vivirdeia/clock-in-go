import { useState } from 'react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import StatusPill from '@/components/brand/StatusPill';
import { PageHeader, Panel, Segmented, DialogActions, Field, textareaCls, EmptyState, TryAppButton, IconTile } from '@/components/admin/kit';
import { Bell, Check, Clock, MapPin, UserX, Timer } from 'lucide-react';
import { toast } from 'sonner';
import type { AlertType } from '@/types';
import { cn } from '@/lib/utils';

const typeIcons = { out_of_zone: MapPin, late: Clock, absent: UserX, overtime: Timer };
const typeLabels: Record<AlertType, string> = { out_of_zone: 'Fuera de zona', late: 'Retrasos', absent: 'Ausencias', overtime: 'Horas extra' };
const typeTints = { out_of_zone: 'red', late: 'amber', absent: 'violet', overtime: 'blue' } as const;
const typeBoxes: Record<AlertType, string> = {
  out_of_zone: 'bg-danger-tint/50 border-danger/30',
  late: 'bg-warning-tint/50 border-warning/30',
  absent: 'bg-violet-tint/50 border-violet-ink/20',
  overtime: 'bg-brand-tint/50 border-brand/30',
};
const quickResponses = ['Justificado por trabajo', 'Hablado con la persona', 'Error de ubicación del móvil'];
const when = (iso: string) => new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AlertsPage() {
  const { alerts, getEmployee, getDepartment, markAlertRead, resolveAlert } = useDataStore();
  const [typeFilter, setTypeFilter] = useState<'all' | AlertType>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  let filtered = [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter);
  if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter);

  const unread = alerts.filter(a => a.status === 'unread').length;
  const weekStart = new Date(); weekStart.setHours(0, 0, 0, 0); weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const weekCount = alerts.filter(a => new Date(a.createdAt) >= weekStart).length;
  const counts = alerts.reduce<Partial<Record<AlertType, number>>>((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {});
  const top = (Object.entries(counts) as [AlertType, number][]).sort((a, b) => b[1] - a[1])[0];
  const ra = alerts.find(a => a.id === resolveId);
  const raEmp = ra ? getEmployee(ra.employeeId) : undefined;
  const raDept = raEmp ? getDepartment(raEmp.departmentId) : undefined;

  const stat = 'mt-2 font-display font-extrabold text-[40px] leading-tight tabular-nums tracking-[-0.02em]';

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader title="Alertas" subtitle="Todo lo que necesita tu atención, en un solo sitio" />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <div className="rounded-[20px] bg-primary p-5 text-primary-foreground"><p className="text-sm">Sin leer</p><p className={stat}>{unread}</p></div>
        <Panel className="p-5"><p className="text-sm text-muted-foreground">Esta semana</p><p className={stat}>{weekCount}</p></Panel>
        <Panel className="p-5"><p className="text-sm text-muted-foreground">Más frecuente</p><p className="mt-4 text-xl font-semibold">{top ? `${typeLabels[top[0]]} (${top[1]})` : '—'}</p></Panel>
        <Panel className="p-5"><p className="text-sm text-muted-foreground">Resueltas</p><p className={stat}>{alerts.filter(a => a.status === 'resolved').length}</p></Panel>
      </div>

      <div className="flex flex-wrap items-start gap-3">
        <Segmented<'all' | AlertType> value={typeFilter} onChange={setTypeFilter} options={[
          { value: 'all', label: 'Todas' }, { value: 'out_of_zone', label: 'Fuera de zona' }, { value: 'late', label: 'Retrasos' }, { value: 'absent', label: 'Ausencias' }, { value: 'overtime', label: 'Horas extra' },
        ]} />
        <Segmented value={statusFilter} onChange={setStatusFilter} options={[
          { value: 'all', label: 'Todas' }, { value: 'unread', label: 'Sin leer' }, { value: 'read', label: 'Leídas' }, { value: 'resolved', label: 'Resueltas' },
        ]} />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <EmptyState tint="amber" icon={Bell} title="Todo en orden" text="Aquí verás los fichajes y los avisos en cuanto tu equipo empiece." action={<TryAppButton />} />}
        {filtered.map(a => {
          const emp = getEmployee(a.employeeId);
          const dept = emp ? getDepartment(emp.departmentId) : undefined;
          return (
            <Panel key={a.id} className="rounded-[18px] p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <IconTile icon={typeIcons[a.type]} tint={a.status === 'resolved' ? 'gray' : typeTints[a.type]} />
                <div className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-[15px]', a.status === 'unread' && 'font-semibold')}>{a.description}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">{emp?.name || '—'} · {dept?.name || '—'} · {when(a.createdAt)}</p>
                    {a.employeeNote && <p className="mt-1.5 text-[13px] italic text-muted-foreground">“{a.employeeNote}”</p>}
                    {a.status === 'resolved' && a.resolvedNote && (
                      <p className="mt-2 inline-flex items-start gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-[13px] text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />{a.resolvedNote}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusPill variant={a.status === 'unread' ? 'unread' : a.status === 'read' ? 'out' : 'resolved'}>
                      {a.status === 'unread' ? 'Sin leer' : a.status === 'read' ? 'Leída' : 'Resuelta'}
                    </StatusPill>
                    {a.status === 'unread' && <Button variant="outline" className="h-10 border-border px-4" onClick={() => markAlertRead(a.id)}>Marcar leída</Button>}
                    {a.status !== 'resolved' && <Button className="h-10 px-4" onClick={() => { setNote(''); setResolveId(a.id); }}>Resolver</Button>}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </div>

      <Dialog open={!!resolveId} onOpenChange={o => { if (!o) setResolveId(null); }}>
        <DialogContent>
          <DialogTitle className="pr-12">Resolver alerta</DialogTitle>
          {ra && (
            <form className="space-y-5" onSubmit={e => { e.preventDefault(); resolveAlert(ra.id, note.trim() || 'Revisado y resuelto'); setResolveId(null); toast.success('Alerta resuelta'); }}>
              <div className={cn('flex items-start gap-3 rounded-2xl border p-4', typeBoxes[ra.type])}>
                <IconTile icon={typeIcons[ra.type]} tint={typeTints[ra.type]} />
                <div className="min-w-0">
                  <p className="text-[15px] font-semibold">{ra.description}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{raEmp?.name || '—'} · {raDept?.name || '—'} · {when(ra.createdAt)}</p>
                  {ra.employeeNote && <p className="mt-1.5 text-[13px] italic text-muted-foreground">“{ra.employeeNote}”</p>}
                </div>
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold">Respuesta rápida</p>
                <div className="flex flex-wrap gap-2">
                  {quickResponses.map(r => (
                    <button key={r} type="button" aria-pressed={note === r} onClick={() => setNote(r)}
                      className={cn('h-10 rounded-full border px-4 text-[13px] font-medium', note === r ? 'border-brand bg-brand-tint text-brand-ink' : 'bg-background text-muted-foreground hover:bg-secondary')}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Nota de resolución">
                <textarea className={textareaCls} rows={3} value={note} onChange={e => setNote(e.target.value)} />
              </Field>
              <DialogActions>
                <Button type="button" variant="outline" className="h-11 border-border" onClick={() => setResolveId(null)}>Cancelar</Button>
                <Button type="submit" className="h-11 gap-2 bg-success text-success-foreground hover:bg-success/90"><Check className="h-4 w-4" />Marcar como resuelta</Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
