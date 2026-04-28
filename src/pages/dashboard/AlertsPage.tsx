import { useState } from 'react';
import { useDataStore } from '@/store/dataStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clock, UserX, Timer } from 'lucide-react';
import { toast } from 'sonner';
import type { AlertType } from '@/types';

const typeIcons: Record<AlertType, any> = { out_of_zone: AlertTriangle, late: Clock, absent: UserX, overtime: Timer };
const typeLabels: Record<AlertType, string> = { out_of_zone: 'Fuera de zona', late: 'Retardo', absent: 'Ausencia', overtime: 'Horas extra' };

export default function AlertsPage() {
  const { alerts, getEmployee, getDepartment, markAlertRead, resolveAlert } = useDataStore();

  const [typeFilter, setTypeFilter] = useState<'all' | AlertType>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolveId, setResolveId] = useState<string | null>(null);

  let filtered = [...alerts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter);
  if (statusFilter !== 'all') filtered = filtered.filter(a => a.status === statusFilter);

  const unreadCount = alerts.filter(a => a.status === 'unread').length;
  const weekCount = alerts.length;
  const counts = alerts.reduce<Record<string, number>>((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {});
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] as [AlertType, number] | undefined;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Alertas</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">No leídas</p>
          <p className="text-2xl font-semibold text-destructive">{unreadCount}</p>
        </div>
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-2xl font-semibold">{weekCount}</p>
        </div>
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">Tipo más frecuente</p>
          <p className="text-lg font-semibold">{top ? `${typeLabels[top[0]]} (${top[1]})` : '—'}</p>
        </div>
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">Resueltas</p>
          <p className="text-2xl font-semibold">{alerts.filter(a => a.status === 'resolved').length}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-md border overflow-hidden">
          {[{ v: 'all', l: 'Todas' }, { v: 'out_of_zone', l: 'Fuera zona' }, { v: 'late', l: 'Retardo' }, { v: 'absent', l: 'Ausencia' }, { v: 'overtime', l: 'H. extra' }].map(t => (
            <button key={t.v} onClick={() => setTypeFilter(t.v as 'all' | AlertType)}
              className={`px-3 py-2 text-sm transition-colors ${typeFilter === t.v ? 'bg-foreground text-primary-foreground' : 'hover:bg-secondary'}`}>{t.l}</button>
          ))}
        </div>
        <div className="flex rounded-md border overflow-hidden">
          {[{ v: 'all', l: 'Todas' }, { v: 'unread', l: 'No leídas' }, { v: 'read', l: 'Leídas' }, { v: 'resolved', l: 'Resueltas' }].map(t => (
            <button key={t.v} onClick={() => setStatusFilter(t.v)}
              className={`px-3 py-2 text-sm transition-colors ${statusFilter === t.v ? 'bg-foreground text-primary-foreground' : 'hover:bg-secondary'}`}>{t.l}</button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">Sin alertas que mostrar.</p>}
        {filtered.map(a => {
          const emp = getEmployee(a.employeeId);
          const dept = emp ? getDepartment(emp.departmentId) : null;
          const Icon = typeIcons[a.type] || AlertTriangle;
          return (
            <div key={a.id} className={`bg-background rounded-card border p-4 ${a.status === 'unread' ? 'border-l-4 border-l-destructive' : ''}`}>
              <div className="flex items-start gap-3">
                <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" strokeWidth={1.5} />
                <div className="flex-1 min-w-0">
                  <span className={`text-sm ${a.status === 'unread' ? 'font-semibold' : ''}`}>{a.description}</span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{emp?.name}</span>
                    {dept && <Badge variant="outline" className="text-xs py-0">{dept.name}</Badge>}
                    <span>{new Date(a.createdAt).toLocaleString('es-ES')}</span>
                  </div>
                  {a.status === 'resolved' && a.resolvedNote && (
                    <p className="text-xs text-muted-foreground mt-2 bg-secondary rounded px-2 py-1">✓ {a.resolvedNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={a.status === 'unread' ? 'destructive' : 'outline'} className="text-xs">
                    {a.status === 'unread' ? 'No leída' : a.status === 'read' ? 'Leída' : 'Resuelta'}
                  </Badge>
                  {a.status === 'unread' && (
                    <Button variant="ghost" size="sm" onClick={() => markAlertRead(a.id)}>Marcar leída</Button>
                  )}
                  {a.status !== 'resolved' && (
                    <Button variant="ghost" size="sm" onClick={() => setResolveId(a.id)}>Resolver</Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!resolveId} onOpenChange={() => setResolveId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolver alerta</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const note = (form.elements.namedItem('note') as HTMLTextAreaElement)?.value || 'Revisado y resuelto';
            if (resolveId) resolveAlert(resolveId, note);
            setResolveId(null);
            toast.success('Alerta resuelta');
          }} className="space-y-4">
            <div><label className="text-sm font-medium">Nota de resolución</label><Textarea name="note" placeholder="Ej: Reunión justificada con cliente" /></div>
            <Button type="submit" className="w-full">Resolver</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
