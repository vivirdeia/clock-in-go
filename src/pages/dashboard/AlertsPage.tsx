import { useState } from 'react';
import { alerts, getEmployee, getDepartment } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Clock, UserX, Timer, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Alert } from '@/data/mockData';

const typeIcons: Record<string, any> = { out_of_zone: AlertTriangle, late: Clock, absent: UserX, overtime: Timer };
const typeLabels: Record<string, string> = { out_of_zone: 'Fuera de zona', late: 'Retardo', absent: 'Ausencia', overtime: 'Horas extra' };
const typeColors: Record<string, string> = { out_of_zone: 'text-destructive', late: 'text-warning', absent: 'text-destructive', overtime: 'text-foreground' };

export default function AlertsPage() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [alertsState, setAlertsState] = useState(alerts);

  let filtered = [...alertsState].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter);
  if (statusFilter === 'unread') filtered = filtered.filter(a => a.status === 'unread');
  if (statusFilter === 'read') filtered = filtered.filter(a => a.status === 'read');
  if (statusFilter === 'resolved') filtered = filtered.filter(a => a.status === 'resolved');

  const unreadCount = alertsState.filter(a => a.status === 'unread').length;
  const weekCount = alertsState.length;
  const topType = Object.entries(alertsState.reduce((acc, a) => { acc[a.type] = (acc[a.type] || 0) + 1; return acc; }, {} as Record<string, number>))
    .sort((a, b) => b[1] - a[1])[0];

  const markRead = (id: string) => {
    setAlertsState(prev => prev.map(a => a.id === id ? { ...a, status: 'read' as const } : a));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Alertas</h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">No leídas</p>
          <p className="text-2xl font-bold text-destructive">{unreadCount}</p>
        </div>
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">Esta semana</p>
          <p className="text-2xl font-bold">{weekCount}</p>
        </div>
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">Tipo más frecuente</p>
          <p className="text-lg font-bold">{topType ? typeLabels[topType[0]] : '—'} ({topType?.[1]})</p>
        </div>
        <div className="bg-background rounded-card border p-4">
          <p className="text-sm text-muted-foreground">Depto con más alertas</p>
          <p className="text-lg font-bold">Marketing (4)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-lg border overflow-hidden">
          {[{ v: 'all', l: 'Todas' }, { v: 'out_of_zone', l: 'Fuera zona' }, { v: 'late', l: 'Retardo' }, { v: 'absent', l: 'Ausencia' }, { v: 'overtime', l: 'H. extra' }].map(t => (
            <button key={t.v} onClick={() => setTypeFilter(t.v)}
              className={`px-3 py-2 text-sm transition-colors ${typeFilter === t.v ? 'bg-foreground text-primary-foreground' : 'hover:bg-secondary'}`}>{t.l}</button>
          ))}
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {[{ v: 'all', l: 'Todas' }, { v: 'unread', l: 'No leídas' }, { v: 'read', l: 'Leídas' }, { v: 'resolved', l: 'Resueltas' }].map(t => (
            <button key={t.v} onClick={() => setStatusFilter(t.v)}
              className={`px-3 py-2 text-sm transition-colors ${statusFilter === t.v ? 'bg-foreground text-primary-foreground' : 'hover:bg-secondary'}`}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* Alert cards */}
      <div className="space-y-3">
        {filtered.map(a => {
          const emp = getEmployee(a.employeeId);
          const dept = emp ? getDepartment(emp.departmentId) : null;
          const Icon = typeIcons[a.type] || AlertTriangle;
          return (
            <div key={a.id} className={`bg-background rounded-card border p-4 ${a.status === 'unread' ? 'border-l-4 border-l-destructive' : ''}`}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${typeColors[a.type]}`}><Icon className="w-4 h-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm ${a.status === 'unread' ? 'font-bold' : ''}`}>{a.description}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{emp?.name}</span>
                    {dept && <Badge variant="outline" className="text-xs py-0">{dept.name}</Badge>}
                    <span>{new Date(a.createdAt).toLocaleDateString('es-ES')}</span>
                  </div>
                  {a.status === 'resolved' && a.resolvedNote && (
                    <p className="text-xs text-muted-foreground mt-2 bg-secondary rounded px-2 py-1">✓ {a.resolvedNote}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={a.status === 'unread' ? 'destructive' : a.status === 'resolved' ? 'secondary' : 'outline'} className="text-xs">
                    {a.status === 'unread' ? 'No leída' : a.status === 'read' ? 'Leída' : 'Resuelta'}
                  </Badge>
                  {a.status === 'unread' && (
                    <Button variant="ghost" size="sm" onClick={() => markRead(a.id)}>Marcar leída</Button>
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

      {/* Resolve dialog */}
      <Dialog open={!!resolveId} onOpenChange={() => setResolveId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Resolver alerta</DialogTitle></DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const note = (form.elements.namedItem('note') as HTMLTextAreaElement)?.value || 'Revisado y resuelto';
            setAlertsState(prev => prev.map(a => a.id === resolveId ? { ...a, status: 'resolved' as const, resolvedNote: note } : a));
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
