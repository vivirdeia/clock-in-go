import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { PageHeader, DialogHead, DialogActions, Field, inputCls, textareaCls, EmptyState } from '@/components/admin/kit';
import Avatar from '@/components/brand/Avatar';
import StatusPill from '@/components/brand/StatusPill';
import { Building2, Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const { departments, employees, shifts, addDepartment, updateDepartment, deleteDepartment, getEmployeesByDepartment, getEmployeeTodayStatus, getEmployee } = useDataStore();
  const [params, setParams] = useSearchParams();
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [shiftId, setShiftId] = useState(shifts[0]?.id || '');
  const openNew = () => {
    setEditingId(null); setName(''); setDescription(''); setManagerId(''); setShiftId(shifts[0]?.id || ''); setShowForm(true);
  };
  useEffect(() => {
    if (params.get('new') !== '1') return;
    openNew();
    const next = new URLSearchParams(params); next.delete('new'); setParams(next, { replace: true });
  }, [params, setParams]);
  const save = (event: FormEvent) => {
    event.preventDefault();
    const values = { name, description, managerId, defaultShiftId: shiftId || shifts[0]?.id || 's1' };
    if (editingId) { updateDepartment(editingId, values); toast.success('Departamento actualizado'); }
    else { const dept = addDepartment(values); toast.success(`Departamento "${dept.name}" creado`); }
    setShowForm(false);
  };
  const handleDelete = (id: string) => {
    if (getEmployeesByDepartment(id).length > 0) { toast.error('No puedes eliminar un departamento con empleados asignados'); return; }
    const dept = departments.find(d => d.id === id);
    deleteDepartment(id); setSelectedDept(null); toast.success(`Departamento "${dept?.name}" eliminado`);
  };
  const dept = departments.find(d => d.id === selectedDept);
  const members = dept ? getEmployeesByDepartment(dept.id) : [];
  const working = employees.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
  return (
    <div className="space-y-6">
      <PageHeader title="Departamentos" subtitle={`${departments.length} departamentos · ${working} personas trabajando ahora`} actions={<Button className="h-11 gap-2" onClick={openNew}><Plus className="h-4 w-4" />Nuevo departamento</Button>} />
      {departments.length === 0 ? <EmptyState icon={Building2} tint="violet" title="Crea tu primer departamento" text="Lo necesitas para asignar a cada persona su turno." action={<Button onClick={openNew}>Crear departamento</Button>} /> : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))] gap-4">
          {departments.map(d => {
            const people = getEmployeesByDepartment(d.id);
            const present = people.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
            const pct = people.length ? Math.round(present / people.length * 100) : 0;
            const full = people.length > 0 && present === people.length;
            const chip = full ? 'bg-success-tint text-success-ink' : present ? 'bg-warning-tint text-warning-ink' : 'bg-danger-tint text-danger-ink';
            const bar = full ? 'bg-success' : present ? 'bg-warning' : 'bg-danger';
            const manager = getEmployee(d.managerId)?.name || 'Sin responsable';
            return <button type="button" key={d.id} onClick={() => setSelectedDept(d.id)} className="min-w-0 rounded-[20px] border bg-background p-[22px] text-left transition-colors hover:border-primary/30 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <div className="flex items-start justify-between gap-3"><h2 className="break-words text-[18px] font-semibold">{d.name}</h2><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${chip}`}>{present}/{people.length}</span></div>
              <p className="mt-2 text-[13px] text-muted-foreground">{d.description || 'Sin descripción'}</p>
              <div className="my-5 h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} /></div>
              <div className="flex items-center justify-between gap-2 text-xs"><div className="flex min-w-0 items-center gap-2"><Avatar name={manager} size={26} /><span className="truncate text-muted-foreground">{manager}</span></div><span className="shrink-0 tabular-nums text-muted-foreground">{pct} % presencia</span></div>
            </button>;
          })}
        </div>
      )}
      <Dialog open={!!dept && !showForm} onOpenChange={open => { if (!open) setSelectedDept(null); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          {dept && <>
            <DialogTitle className="pr-10 font-display text-[26px] font-extrabold tracking-[-0.02em]">{dept.name}</DialogTitle>
            <p className="text-sm text-muted-foreground">{dept.description} · Responsable: {getEmployee(dept.managerId)?.name || '—'}</p>
            <div className="grid grid-cols-3 gap-2">
              {([{ label: 'Trabajando', status: 'present', tone: 'bg-success-tint text-success-ink' }, { label: 'Han salido', status: 'left', tone: 'bg-secondary text-muted-foreground' }, { label: 'Sin fichar', status: 'absent', tone: 'bg-danger-tint text-danger-ink' }]).map(item => <div key={item.status} className={`rounded-2xl p-3 ${item.tone}`}><p className="text-xs">{item.label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{members.filter(e => { const status = getEmployeeTodayStatus(e.id); return item.status === 'absent' ? status !== 'present' && status !== 'left' : status === item.status; }).length}</p></div>)}
            </div>
            <div className="divide-y">{members.map(e => { const status = getEmployeeTodayStatus(e.id); return <div key={e.id} className="flex items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-center gap-3"><Avatar name={e.name} size={36} /><span className="truncate text-sm font-medium">{e.name}</span></div><StatusPill variant={status === 'present' ? 'in' : status === 'left' ? 'out' : 'absent'} /></div>; })}{!members.length && <p className="py-4 text-sm text-muted-foreground">Sin empleados asignados</p>}</div>
            <DialogActions><Button variant="outline" className="border-border text-danger" onClick={() => handleDelete(dept.id)}><Trash2 className="mr-2 h-4 w-4" />Eliminar</Button><Button onClick={() => { setEditingId(dept.id); setName(dept.name); setDescription(dept.description); setManagerId(dept.managerId); setShiftId(dept.defaultShiftId); setShowForm(true); }}><Pencil className="mr-2 h-4 w-4" />Editar departamento</Button></DialogActions>
          </>}
        </DialogContent>
      </Dialog>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHead icon={Building2} tint="violet" title={editingId ? 'Editar departamento' : 'Nuevo departamento'} />
          <form onSubmit={save} className="space-y-4">
            <Field label="Nombre"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required placeholder="Ej.: Atención al cliente" /></Field>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Responsable"><select className={inputCls} value={managerId} onChange={e => setManagerId(e.target.value)}><option value="">Sin responsable</option>{employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></Field><Field label="Turno por defecto"><select className={inputCls} value={shiftId} onChange={e => setShiftId(e.target.value)}><option value="">Seleccionar turno</option>{shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field></div>
            <Field label="Descripción (opcional)"><textarea className={textareaCls} value={description} onChange={e => setDescription(e.target.value)} /></Field>
            <DialogActions><Button type="button" variant="outline" className="border-border" onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit">{editingId ? 'Guardar cambios' : 'Crear departamento'}</Button></DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
