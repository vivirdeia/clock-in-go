import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, LayoutGrid, List, Pencil, Plus, Search, Trash2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useDataStore } from '@/store/dataStore';
import { useAuth } from '@/store/AuthContext';
import { PLAN_LIMITS, formatTime, type Employee } from '@/types';
import { computeWorkedMinutes, formatHm } from '@/lib/alerts';
import Avatar, { initials } from '@/components/brand/Avatar';
import StatusPill from '@/components/brand/StatusPill';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PageHeader, Panel, Segmented, DialogHead, DialogActions, Field, inputCls, EmptyState, PlanLimitDialog } from '@/components/admin/kit';
import { cn } from '@/lib/utils';

const dateKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

function generatePin(employees: Employee[]) {
  const used = new Set(employees.map(e => e.pin));
  const available = Array.from({ length: 9000 }, (_, i) => String(i + 1000)).filter(p => !used.has(p));
  return available[Math.floor(Math.random() * available.length)] || '';
}

const statusText = { in: 'Trabajando', out: 'Ha salido', absent: 'Sin fichar' };

export default function EmployeesPage() {
  const { user } = useAuth();
  const { employees, departments, shifts, clockRecords, addEmployee, updateEmployee, deleteEmployee, getEmployeeTodayStatus, getDepartment, getShift, getTodayRecords } = useDataStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const plan = user?.plan || 'starter';
  const limit = PLAN_LIMITS[plan].employees;
  const atLimit = employees.length >= limit;
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [query, setQuery] = useState('');
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [showPin, setShowPin] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const addNameRef = useRef<HTMLInputElement>(null);
  const addEmailRef = useRef<HTMLInputElement>(null);
  const addPhoneRef = useRef<HTMLInputElement>(null);
  const [addDept, setAddDept] = useState('');
  const [addShift, setAddShift] = useState('');
  const [addPin, setAddPin] = useState(() => generatePin(employees));

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editShift, setEditShift] = useState('');

  const emp = employees.find(e => e.id === selectedEmp);
  const q = query.trim().toLocaleLowerCase('es');
  const filteredEmployees = employees.filter(e => `${e.name} ${e.email}`.toLocaleLowerCase('es').includes(q));

  const openAdd = () => {
    if (atLimit) { setShowLimit(true); return; }
    setAddPin(generatePin(employees));
    setShowAdd(true);
  };

  useEffect(() => {
    if (searchParams.get('new') !== '1') return;
    if (atLimit) setShowLimit(true); else { setAddPin(generatePin(employees)); setShowAdd(true); }
    const next = new URLSearchParams(searchParams); next.delete('new');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const todayRecs = getTodayRecords();
  const firstEntry = (id: string) => todayRecs.filter(r => r.employeeId === id && r.type === 'entry').sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0];
  const statusFor = (id: string): 'in' | 'out' | 'absent' => {
    const s = getEmployeeTodayStatus(id);
    return s === 'present' ? 'in' : s === 'left' ? 'out' : 'absent';
  };
  const cardStatusFor = (e: Employee): 'in' | 'out' | 'absent' | 'late' => {
    const entry = firstEntry(e.id);
    const shift = getShift(e.shiftId);
    if (entry && shift?.startTime) {
      const actual = new Date(entry.timestamp);
      const sched = new Date(actual);
      const [h, m] = shift.startTime.split(':').map(Number);
      sched.setHours(h, m, 0, 0);
      if ((actual.getTime() - sched.getTime()) / 60000 > shift.lateToleranceMinutes) return 'late';
    }
    return statusFor(e.id);
  };
  const dotClass = (id: string) => {
    const s = statusFor(id);
    return s === 'in' ? 'bg-success' : s === 'out' ? 'bg-subtle' : 'bg-background border-2 border-danger';
  };

  const selectEmployee = (id: string) => { setSelectedEmp(id); setEditMode(false); };
  const startEdit = () => {
    if (!emp) return;
    setEditName(emp.name); setEditEmail(emp.email); setEditPhone(emp.phone); setEditDept(emp.departmentId); setEditShift(emp.shiftId);
    setEditMode(true);
  };

  const handleAdd = (ev: FormEvent) => {
    ev.preventDefault();
    if (atLimit) { setShowAdd(false); setShowLimit(true); return; }
    if (!/^\d{4}$/.test(addPin)) { toast.error('No hay un PIN disponible'); return; }
    if (employees.some(e => e.pin === addPin)) { toast.error('Ya existe un empleado con ese PIN'); return; }
    if (!addDept || !addShift) { toast.error('Selecciona departamento y turno'); return; }
    const n = addEmployee({ name: addNameRef.current?.value || '', email: addEmailRef.current?.value || '', phone: addPhoneRef.current?.value || '', departmentId: addDept, shiftId: addShift, pin: addPin });
    setShowAdd(false); setAddDept(''); setAddShift('');
    toast.success(`Empleado ${n.name} creado con PIN ${n.pin}`);
  };

  const handleEdit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!emp) return;
    if (!editDept || !editShift) { toast.error('Selecciona departamento y turno'); return; }
    updateEmployee(emp.id, { name: editName, email: editEmail, phone: editPhone, departmentId: editDept, shiftId: editShift });
    setEditMode(false);
    toast.success('Empleado actualizado');
  };

  const handleDelete = () => {
    if (!emp) return;
    const name = emp.name;
    deleteEmployee(emp.id);
    setConfirmDelete(false); setEditMode(false); setSelectedEmp(null);
    toast.success(`${name} eliminado`);
  };

  const employeeStats = (id: string) => {
    const now = new Date();
    const begin = new Date(now); begin.setDate(begin.getDate() - 6); begin.setHours(0, 0, 0, 0);
    const recs = clockRecords.filter(r => r.employeeId === id);
    const byDay: Record<string, typeof recs> = {};
    recs.forEach(r => { (byDay[dateKey(new Date(r.timestamp))] ||= []).push(r); });
    const recent = Object.entries(byDay).filter(([d]) => d >= dateKey(begin) && d <= dateKey(now));
    const daysWorked = recent.filter(([, d]) => d.some(r => r.type === 'entry')).length;
    const totalMins = recent.reduce((t, [, d]) => t + computeWorkedMinutes(d), 0);
    const monday = new Date(now); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
    const week = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((label, i) => {
      const d = new Date(monday); d.setDate(d.getDate() + i);
      return { label, minutes: computeWorkedMinutes(byDay[dateKey(d)] || []) };
    });
    return { daysWorked, totalMins, average: daysWorked ? Math.round(totalMins / daysWorked) : 0, week };
  };
  const stats = emp ? employeeStats(emp.id) : null;
  const maxWeek = stats ? Math.max(600, ...stats.week.map(w => w.minutes)) : 600;

  const assignmentFields = (dept: string, setDept: (v: string) => void, shift: string, setShift: (v: string) => void) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Departamento">
        <select className={inputCls} value={dept} onChange={e => setDept(e.target.value)} required>
          <option value="">Seleccionar</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </Field>
      <Field label="Turno">
        <select className={inputCls} value={shift} onChange={e => setShift(e.target.value)} required>
          <option value="">Seleccionar</option>
          {shifts.map(s => <option key={s.id} value={s.id}>{s.name}{s.startTime ? ` ${s.startTime}–${s.endTime}` : ''}</option>)}
        </select>
      </Field>
    </div>
  );

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader title="Empleados"
        subtitle={`${employees.length} de ${limit === Infinity ? '∞' : limit} en tu plan ${plan.charAt(0).toUpperCase() + plan.slice(1)}`}
        actions={<Button className="h-11 gap-2" onClick={openAdd}><Plus className="h-4 w-4" />Añadir empleado</Button>} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" aria-label="Buscar empleados por nombre o email" placeholder="Buscar por nombre o email" value={query} onChange={e => setQuery(e.target.value)}
            className="h-11 w-full rounded-full border bg-background pl-11 pr-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        </div>
        <Segmented value={view} onChange={setView} options={[
          { value: 'table', label: <span className="flex items-center" aria-label="Vista de tabla"><List className="h-4 w-4" /></span> },
          { value: 'grid', label: <span className="flex items-center" aria-label="Vista de cuadrícula"><LayoutGrid className="h-4 w-4" /></span> },
        ]} />
      </div>

      {departments.length === 0 && employees.length > 0 && (
        <Panel className="p-4 text-sm">
          <p className="font-semibold">Crea primero un departamento</p>
          <p className="mt-1 text-muted-foreground">Necesitas al menos un departamento para asignar empleados.</p>
          <Button asChild variant="outline" className="mt-3 h-10"><Link to="/dashboard/departments">Crear departamento</Link></Button>
        </Panel>
      )}

      {employees.length === 0 ? (
        <EmptyState icon={Users} tint="blue" title="Aún no hay empleados" text="Añade al primero y recibirá su PIN por email."
          action={<Button onClick={openAdd} className="h-11 gap-2"><Plus className="h-4 w-4" />Añadir empleado</Button>} />
      ) : (
        <div className={cn('grid min-w-0 items-start gap-6', emp && 'lg:grid-cols-[1fr_320px]')}>
          <div className="min-w-0">
            {filteredEmployees.length === 0 ? (
              <EmptyState icon={Search} tint="gray" title="No hay resultados" text="Prueba con otro nombre o email." />
            ) : view === 'table' ? (
              <Panel className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-muted-foreground">
                    <tr className="border-b">
                      {['Empleado', 'Departamento', 'Turno', 'PIN', 'Hoy', 'Entrada'].map(l => <th key={l} className="px-4 py-3.5 font-medium">{l}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map(e => {
                      const entry = firstEntry(e.id);
                      return (
                        <tr key={e.id} onClick={() => selectEmployee(e.id)}
                          className={cn('cursor-pointer border-b last:border-0 transition-colors motion-reduce:transition-none', selectedEmp === e.id ? 'bg-secondary' : 'hover:bg-secondary/50')}>
                          <td className="px-4 py-3">
                            <button type="button" onClick={() => selectEmployee(e.id)} aria-label={`Ver ficha de ${e.name}`} className="flex items-center gap-3 rounded-lg text-left">
                              <Avatar name={e.name} size={36} />
                              <span><span className="block font-semibold">{e.name}</span><span className="block text-xs text-muted-foreground">{e.email}</span></span>
                            </button>
                          </td>
                          <td className="px-4 py-3"><span className="inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs">{getDepartment(e.departmentId)?.name || '—'}</span></td>
                          <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{getShift(e.shiftId)?.name || '—'}</td>
                          <td className="px-4 py-3">
                            <button type="button" aria-label={`${showPin === e.id ? 'Ocultar' : 'Mostrar'} PIN de ${e.name}`}
                              onClick={ev => { ev.stopPropagation(); setShowPin(showPin === e.id ? null : e.id); }}
                              className="flex min-h-11 items-center gap-2 rounded-lg px-1 tabular-nums">
                              {showPin === e.id ? e.pin : '••••'}
                              {showPin === e.id ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-2 whitespace-nowrap"><span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', dotClass(e.id))} />{statusText[statusFor(e.id)]}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold tabular-nums">{entry ? formatTime(entry.timestamp) : '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Panel>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
                {filteredEmployees.map(e => (
                  <button key={e.id} type="button" onClick={() => selectEmployee(e.id)} aria-label={`Ver ficha de ${e.name}`}
                    className={cn('flex min-w-0 flex-col items-center rounded-[20px] border bg-background p-6 text-center', selectedEmp === e.id && 'border-foreground')}>
                    <span className="relative mb-4">
                      <Avatar name={e.name} size={64} />
                      <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-background">
                        <span className={cn('h-2.5 w-2.5 rounded-full', dotClass(e.id))} />
                      </span>
                    </span>
                    <span className="max-w-full font-semibold">{e.name}</span>
                    <span className="mb-3 mt-0.5 text-sm text-muted-foreground">{getDepartment(e.departmentId)?.name || '—'}</span>
                    <StatusPill variant={cardStatusFor(e)} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {emp && stats && (
            <Panel className="min-w-0 space-y-6 p-6">
              <p className="text-sm font-semibold text-muted-foreground">Ficha</p>
              <div>
                <span className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-xl font-semibold text-brand-ink" aria-hidden="true">{initials(emp.name)}</span>
                <h3 className="text-xl font-semibold">{emp.name}</h3>
                <p className="mt-0.5 break-all text-sm text-muted-foreground">{emp.email}</p>
                <p className="mt-1 text-sm text-muted-foreground">{getDepartment(emp.departmentId)?.name || '—'} · {getShift(emp.shiftId)?.name || '—'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[{ l: 'Días', v: stats.daysWorked }, { l: 'Horas', v: formatHm(stats.totalMins) }, { l: 'Media', v: formatHm(stats.average) }].map(i => (
                  <div key={i.l} className="min-w-0 rounded-xl bg-secondary p-3">
                    <p className="text-xs text-muted-foreground">{i.l}</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums">{i.v}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-semibold">Horas por día</h4>
                <div className="mt-4 flex h-36 items-end gap-3">
                  {stats.week.map(d => (
                    <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                      <div className="flex w-full flex-1 items-end">
                        <div role="img" aria-label={`${d.label}: ${formatHm(d.minutes)}`}
                          className={cn('w-full rounded-md', d.minutes > 540 ? 'bg-brand' : 'bg-primary')}
                          style={{ height: `${Math.max(2, (d.minutes / maxWeek) * 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={startEdit} className="h-11 gap-2"><Pencil className="h-4 w-4" />Editar</Button>
                <Button variant="secondary" className="h-11 gap-2" onClick={() => setShowPin(showPin === emp.id ? null : emp.id)}>
                  {showPin === emp.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{showPin === emp.id ? 'Ocultar PIN' : 'Ver PIN'}
                </Button>
              </div>
              {showPin === emp.id && <p className="rounded-xl bg-secondary p-3 text-center text-2xl font-semibold tracking-[.3em] tabular-nums">{emp.pin}</p>}
            </Panel>
          )}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHead icon={UserPlus} tint="blue" title="Añadir empleado" />
          <form onSubmit={handleAdd} className="space-y-4">
            <Field label="Nombre completo"><input className={inputCls} ref={addNameRef} autoComplete="name" required /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email"><input className={inputCls} ref={addEmailRef} type="email" required /></Field>
              <Field label="Teléfono"><input className={inputCls} ref={addPhoneRef} type="tel" /></Field>
            </div>
            {assignmentFields(addDept, setAddDept, addShift, setAddShift)}
            <div className="rounded-2xl bg-secondary p-4">
              <p className="text-sm font-semibold">PIN para fichar</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <output className="text-[30px] font-semibold tracking-[.3em] tabular-nums">{addPin || '—'}</output>
                <Button type="button" variant="outline" className="h-10 border-border bg-background" onClick={() => setAddPin(generatePin(employees))}>Generar otro</Button>
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground">Le enviaremos un email con el enlace a la app y su PIN.</p>
            <DialogActions>
              <Button type="button" variant="outline" className="h-11 border-border" onClick={() => setShowAdd(false)}>Cancelar</Button>
              <Button type="submit" className="h-11">Guardar empleado</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editMode && !!emp} onOpenChange={setEditMode}>
        <DialogContent>
          {emp && (
            <>
              <DialogHead lead={<Avatar name={emp.name} size={48} />} title="Editar empleado"
                subtitle={`En la empresa desde ${new Date(emp.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`} />
              <form onSubmit={handleEdit} className="space-y-4">
                <Field label="Nombre completo"><input className={inputCls} value={editName} onChange={e => setEditName(e.target.value)} required /></Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email"><input className={inputCls} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required /></Field>
                  <Field label="Teléfono"><input className={inputCls} type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} /></Field>
                </div>
                {assignmentFields(editDept, setEditDept, editShift, setEditShift)}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger-tint/50 p-4">
                  <div>
                    <p className="text-sm font-semibold text-danger-ink">Dar de baja</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">Sus fichajes se conservan 4 años.</p>
                  </div>
                  <Button type="button" variant="outline" className="h-10 border-danger/30 bg-background text-danger hover:bg-danger-tint/50 hover:text-danger" onClick={() => setConfirmDelete(true)}>Eliminar</Button>
                </div>
                <DialogActions>
                  <Button type="button" variant="outline" className="h-11 border-border" onClick={() => setEditMode(false)}>Cancelar</Button>
                  <Button type="submit" className="h-11">Guardar cambios</Button>
                </DialogActions>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDelete && !!emp} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHead icon={Trash2} tint="red" title="Eliminar empleado" subtitle={`¿Quieres dar de baja a ${emp?.name || 'este empleado'}? Sus fichajes se conservan 4 años.`} />
          <DialogActions>
            <Button variant="outline" className="h-11 border-border" onClick={() => setConfirmDelete(false)}>Cancelar</Button>
            <Button variant="destructive" className="h-11" onClick={handleDelete}>Eliminar</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <PlanLimitDialog open={showLimit} onOpenChange={setShowLimit} kind="employees" used={employees.length} />
    </div>
  );
}
