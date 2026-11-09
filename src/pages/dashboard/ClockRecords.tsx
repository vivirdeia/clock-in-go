import { useState } from 'react';
import { useDataStore } from '@/store/dataStore';
import type { ClockRecord } from '@/types';
import { formatTime, formatShortDate } from '@/types';
import Avatar from '@/components/brand/Avatar';
import StatusPill from '@/components/brand/StatusPill';
import StreetMap from '@/components/brand/StreetMap';
import { PageHeader, Panel, Segmented, DialogHead, DialogActions, Field, inputCls, textareaCls, EmptyState, TryAppButton } from '@/components/admin/kit';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Bell, Check, Download, Info, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

function ZoneStatus({ inZone }: { inZone: boolean }) {
  return (
    <StatusPill variant={inZone ? 'in' : 'outzone'}>
      <span className="inline-flex items-center gap-1">{inZone && <Check className="h-3.5 w-3.5" />}{inZone ? 'En zona' : 'Fuera de zona'}</span>
    </StatusPill>
  );
}

export default function ClockRecordsPage() {
  const { clockRecords, departments, getEmployee, getDepartment, addCorrectionRecord } = useDataStore();
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [correctingId, setCorrectingId] = useState<string | null>(null);
  const [correctTime, setCorrectTime] = useState('');
  const [correctType, setCorrectType] = useState<'entry' | 'exit'>('entry');
  const [reason, setReason] = useState('');

  let filtered = [...clockRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (deptFilter !== 'all') filtered = filtered.filter(r => getEmployee(r.employeeId)?.departmentId === deptFilter);
  if (typeFilter !== 'all') filtered = filtered.filter(r => r.type === typeFilter);
  if (statusFilter === 'in_zone') filtered = filtered.filter(r => r.inZone);
  if (statusFilter === 'out_of_zone') filtered = filtered.filter(r => !r.inZone);

  const visible = filtered.slice(0, 100);
  const sel = visible.find(r => r.id === selectedId) ?? visible[0] ?? null;
  const selEmp = sel ? getEmployee(sel.employeeId) : undefined;
  const selDept = selEmp ? getDepartment(selEmp.departmentId) : undefined;
  const corr = clockRecords.find(r => r.id === correctingId);
  const corrEmp = corr ? getEmployee(corr.employeeId) : undefined;

  const downloadCSV = () => {
    const header = 'Empleado,Departamento,Tipo,Fecha,Hora,Dirección,Lat,Lng,En zona,Precisión,Editado\n';
    const rows = filtered.map(r => {
      const emp = getEmployee(r.employeeId);
      const dept = emp ? getDepartment(emp.departmentId) : null;
      return `"${emp?.name || ''}","${dept?.name || ''}","${r.type === 'entry' ? 'Entrada' : 'Salida'}","${formatShortDate(r.timestamp)}","${formatTime(r.timestamp)}","${r.address}",${r.lat},${r.lng},${r.inZone ? 'Sí' : 'No'},${r.accuracy}m,${r.editedByAdmin ? 'Sí' : 'No'}`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `fichajes_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`CSV descargado con ${filtered.length} registros`);
  };

  const startCorrection = (rec: ClockRecord) => {
    setCorrectingId(rec.id);
    const d = new Date(rec.timestamp);
    setCorrectTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
    setCorrectType(rec.type);
    setReason('');
  };

  const submitCorrection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctingId) return;
    const date = new Date(correctTime);
    if (Number.isNaN(date.getTime())) { toast.error('Introduce una fecha y hora válidas'); return; }
    const c = addCorrectionRecord(correctingId, { timestamp: date.toISOString(), type: correctType, reason: reason.trim() || undefined });
    if (!c) { toast.error('No se ha encontrado el fichaje original'); return; }
    setCorrectingId(null); setSelectedId(c.id);
    toast.success('Corrección registrada (el original se conserva)');
  };

  const dirty = deptFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader title="Fichajes" subtitle="Registro inmutable con hora, ubicación GPS y verificación"
        actions={<Button variant="outline" className="h-11 gap-2" onClick={downloadCSV}><Download className="h-4 w-4" />Exportar CSV</Button>} />

      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Departamento" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="h-11 max-w-full rounded-xl border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">
          <option value="all">Todos los departamentos</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <Segmented value={typeFilter} onChange={setTypeFilter} options={[{ value: 'all', label: 'Todos' }, { value: 'entry', label: 'Entradas' }, { value: 'exit', label: 'Salidas' }]} />
        <Segmented value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'Todas' }, { value: 'in_zone', label: 'En zona' }, { value: 'out_of_zone', label: 'Fuera' }]} />
        {dirty && (
          <Button variant="ghost" className="h-9" onClick={() => { setDeptFilter('all'); setTypeFilter('all'); setStatusFilter('all'); }}>
            <X className="mr-1 h-3.5 w-3.5" />Limpiar
          </Button>
        )}
        <p className="ml-auto text-sm tabular-nums text-muted-foreground">{filtered.length} registros</p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState tint="amber" icon={Bell} title="Todo en orden" text="Aquí verás los fichajes y los avisos en cuanto tu equipo empiece." action={<TryAppButton />} />
      ) : (
        <div className="grid min-w-0 items-start gap-5 lg:grid-cols-[1fr_300px]">
          <Panel className="min-w-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[740px] text-left text-sm">
                <thead className="text-muted-foreground">
                  <tr className="border-b">
                    {['Empleado', 'Tipo', 'Fecha', 'Hora', 'Dirección', 'Estado'].map(l => <th key={l} className="px-4 py-3.5 font-medium">{l}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {visible.map(rec => {
                    const emp = getEmployee(rec.employeeId);
                    const dept = emp ? getDepartment(emp.departmentId) : undefined;
                    const active = sel?.id === rec.id;
                    return (
                      <tr key={rec.id} onClick={() => setSelectedId(rec.id)}
                        className={`cursor-pointer border-b last:border-b-0 ${active ? 'bg-secondary' : 'hover:bg-secondary/50'}`}>
                        <td className="px-4 py-3">
                          <button type="button" aria-pressed={active} onClick={() => setSelectedId(rec.id)} className="flex items-center gap-2.5 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            <Avatar name={emp?.name || '—'} size={34} />
                            <span>
                              <span className="block whitespace-nowrap font-semibold">{emp?.name || '—'}</span>
                              <span className="block text-xs text-muted-foreground">{dept?.name || '—'}</span>
                            </span>
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          {rec.type === 'entry' ? 'Entrada' : 'Salida'}
                          {rec.editedByAdmin && <span className="mt-1 block w-fit rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">Corregido</span>}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 tabular-nums">{formatShortDate(rec.timestamp)}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums">{formatTime(rec.timestamp)}</td>
                        <td className="max-w-48 truncate px-4 py-3 text-muted-foreground" title={rec.address}>{rec.address}</td>
                        <td className="whitespace-nowrap px-4 py-3"><ZoneStatus inZone={rec.inZone} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          {sel && (
            <Panel className="min-w-0 space-y-5 p-5">
              <h2 className="text-sm font-semibold text-muted-foreground">Detalle del fichaje</h2>
              <div>
                <p className="text-xl font-semibold">{selEmp?.name || '—'}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{selDept?.name || '—'} · {sel.type === 'entry' ? 'Entrada' : 'Salida'}</p>
              </div>
              <StreetMap focusX={330} focusY={290} className="h-[170px] rounded-2xl">
                <div className="absolute left-1/2 top-1/2 h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand bg-brand/15" />
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-background bg-brand shadow" />
              </StreetMap>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-xs text-muted-foreground">Hora</dt><dd className="mt-1 font-semibold tabular-nums">{formatTime(sel.timestamp)}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Fecha</dt><dd className="mt-1 tabular-nums">{formatShortDate(sel.timestamp)}</dd></div>
                <div className="col-span-2"><dt className="text-xs text-muted-foreground">Dirección</dt><dd className="mt-1 break-words">{sel.address}</dd></div>
                <div><dt className="text-xs text-muted-foreground">Precisión GPS</dt><dd className="mt-1 tabular-nums">{sel.accuracy} m</dd></div>
                <div><dt className="text-xs text-muted-foreground">Estado</dt><dd className="mt-1"><ZoneStatus inZone={sel.inZone} /></dd></div>
              </dl>
              {sel.employeeNote && (
                <div className="rounded-xl bg-secondary p-3 text-sm">
                  <p className="mb-1 font-semibold">Motivo del empleado</p>
                  <p className="italic text-muted-foreground">{sel.employeeNote}</p>
                </div>
              )}
              {sel.reason && (
                <div className="rounded-xl bg-secondary p-3 text-sm">
                  <p className="mb-1 font-semibold">Motivo de la corrección</p>
                  <p className="text-muted-foreground">{sel.reason}</p>
                </div>
              )}
              <Button variant="outline" className="h-11 w-full gap-2" onClick={() => startCorrection(sel)}><Pencil className="h-4 w-4" />Añadir corrección</Button>
              <p className="text-[13px] leading-relaxed text-muted-foreground">Los fichajes no se modifican: una corrección añade un registro nuevo y el original se conserva.</p>
            </Panel>
          )}
        </div>
      )}

      <Dialog open={!!correctingId} onOpenChange={o => { if (!o) setCorrectingId(null); }}>
        <DialogContent>
          <DialogHead icon={Pencil} tint="amber" title="Añadir corrección" />
          {corr && (
            <form onSubmit={submitCorrection} className="space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4">
                <Avatar name={corrEmp?.name || '—'} size={36} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{corrEmp?.name || '—'} · {corr.type === 'entry' ? 'Entrada' : 'Salida'}</p>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">Registro original: {formatShortDate(corr.timestamp)} a las {formatTime(corr.timestamp)} · {corr.address}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fecha y hora correctas">
                  <input type="datetime-local" required className={`${inputCls} min-w-0`} value={correctTime} onChange={e => setCorrectTime(e.target.value)} />
                </Field>
                <Field label="Tipo">
                  <select className={inputCls} value={correctType} onChange={e => setCorrectType(e.target.value as 'entry' | 'exit')}>
                    <option value="entry">Entrada</option>
                    <option value="exit">Salida</option>
                  </select>
                </Field>
              </div>
              <Field label="Motivo">
                <textarea className={textareaCls} rows={3} value={reason} onChange={e => setReason(e.target.value)} />
              </Field>
              <div className="flex gap-2 rounded-2xl bg-brand-tint/50 p-3 text-[13px] text-brand-ink">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>El fichaje original se conserva. La corrección se guarda como un registro nuevo, con tu nombre y la fecha.</p>
              </div>
              <DialogActions>
                <Button type="button" variant="outline" className="h-11 border-border" onClick={() => setCorrectingId(null)}>Cancelar</Button>
                <Button type="submit" className="h-11">Guardar corrección</Button>
              </DialogActions>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
