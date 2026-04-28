import { useState, useRef } from 'react';
import { useDataStore } from '@/store/dataStore';
import { useAuth } from '@/store/AuthContext';
import { PLAN_LIMITS, getInitials, formatTime, type Employee } from '@/types';
import { computeWorkedMinutes, formatHm } from '@/lib/alerts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid3X3, List, Eye, EyeOff, Trash2, Pencil, Users } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export default function EmployeesPage() {
  const { user } = useAuth();
  const {
    employees, departments, shifts, clockRecords,
    addEmployee, updateEmployee, deleteEmployee,
    getEmployeeTodayStatus, getDepartment, getShift, getTodayRecords,
  } = useDataStore();

  const limit = PLAN_LIMITS[user?.plan || 'starter'].employees;
  const atLimit = employees.length >= limit;

  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showPin, setShowPin] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const addNameRef = useRef<HTMLInputElement>(null);
  const addEmailRef = useRef<HTMLInputElement>(null);
  const addPhoneRef = useRef<HTMLInputElement>(null);
  const [addDept, setAddDept] = useState('');
  const [addShift, setAddShift] = useState('');
  const [addPin, setAddPin] = useState(String(Math.floor(1000 + Math.random() * 9000)));

  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editShift, setEditShift] = useState('');

  const emp = selectedEmp ? employees.find(e => e.id === selectedEmp) : null;

  const empStats = (id: string) => {
    const recs = clockRecords.filter(r => r.employeeId === id);
    const byDay: Record<string, typeof recs> = {};
    recs.forEach(r => {
      const day = r.timestamp.slice(0, 10);
      (byDay[day] = byDay[day] || []).push(r);
    });
    const days = Object.keys(byDay);
    const totalMins = days.reduce((sum, d) => sum + computeWorkedMinutes(byDay[d]), 0);
    const outZone = recs.filter(r => !r.inZone).length;
    const avg = days.length ? Math.round(totalMins / days.length) : 0;
    const last20 = days.sort().slice(-20).map(d => ({
      day: d.slice(5),
      hours: computeWorkedMinutes(byDay[d]) / 60,
    }));
    return { totalMins, outZone, avg, daysWorked: days.length, last20 };
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (atLimit) {
      toast.error(`Tu plan permite hasta ${limit} empleados. Mejora tu plan para añadir más.`);
      return;
    }
    if (employees.some(e => e.pin === addPin)) {
      toast.error('Ya existe un empleado con ese PIN');
      return;
    }
    if (!addDept || !addShift) {
      toast.error('Selecciona departamento y turno');
      return;
    }
    const newEmp = addEmployee({
      name: addNameRef.current?.value || '',
      email: addEmailRef.current?.value || '',
      phone: addPhoneRef.current?.value || '',
      departmentId: addDept,
      shiftId: addShift,
      pin: addPin,
    });
    setShowAdd(false);
    setAddPin(String(Math.floor(1000 + Math.random() * 9000)));
    setAddDept('');
    setAddShift('');
    toast.success(`Empleado ${newEmp.name} creado con PIN ${newEmp.pin}`);
  };

  const handleDelete = (id: string) => {
    const name = employees.find(e => e.id === id)?.name;
    deleteEmployee(id);
    setSelectedEmp(null);
    toast.success(`${name} eliminado`);
  };

  const startEdit = () => {
    if (!emp) return;
    setEditName(emp.name); setEditEmail(emp.email); setEditPhone(emp.phone);
    setEditDept(emp.departmentId); setEditShift(emp.shiftId);
    setEditMode(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    updateEmployee(selectedEmp, { name: editName, email: editEmail, phone: editPhone, departmentId: editDept, shiftId: editShift });
    setEditMode(false);
    toast.success('Empleado actualizado');
  };

  if (departments.length === 0) {
    return (
      <div className="bg-background rounded-card border p-12 text-center">
        <Users className="w-10 h-10 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold mb-2">Crea primero un departamento</h3>
        <p className="text-muted-foreground text-sm mb-6">Necesitas al menos un departamento para asignar empleados.</p>
        <Link to="/dashboard/departments" className="inline-block px-4 h-10 leading-10 rounded-md bg-foreground text-primary-foreground text-sm font-medium">
          Crear departamento
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Empleados</h2>
          <p className="text-xs text-muted-foreground mt-1">{employees.length} de {limit === Infinity ? '∞' : limit} (plan {user?.plan})</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-md border overflow-hidden">
            <button onClick={() => setView('table')} className={`px-3 py-2 ${view === 'table' ? 'bg-foreground text-primary-foreground' : ''}`}><List className="w-4 h-4" strokeWidth={1.5} /></button>
            <button onClick={() => setView('grid')} className={`px-3 py-2 ${view === 'grid' ? 'bg-foreground text-primary-foreground' : ''}`}><Grid3X3 className="w-4 h-4" strokeWidth={1.5} /></button>
          </div>
          <Button className="gap-2" onClick={() => setShowAdd(true)} disabled={atLimit} title={atLimit ? `Límite del plan ${user?.plan}: ${limit}` : ''}>
            <Plus className="w-4 h-4" strokeWidth={1.5} />Añadir empleado
          </Button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="bg-background rounded-card border p-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">Aún no tienes empleados.</p>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" />Añadir el primero</Button>
        </div>
      ) : view === 'table' ? (
        <div className="bg-background rounded-card border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Empleado</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Departamento</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Turno</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">PIN</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Entrada hoy</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => {
                const dept = getDepartment(e.departmentId);
                const shift = getShift(e.shiftId);
                const status = getEmployeeTodayStatus(e.id);
                const todayEntry = getTodayRecords().find(r => r.employeeId === e.id && r.type === 'entry');
                return (
                  <tr key={e.id} className="border-b hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => { setSelectedEmp(e.id); setEditMode(false); }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">{getInitials(e.name)}</div>
                        <div><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{dept?.name || '—'}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{shift?.name || '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={(ev) => { ev.stopPropagation(); setShowPin(showPin === e.id ? null : e.id); }}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        {showPin === e.id ? <><EyeOff className="w-3 h-3" />{e.pin}</> : <><Eye className="w-3 h-3" />••••</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-success' : status === 'left' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                        <span className="text-sm">{status === 'present' ? 'Presente' : status === 'left' ? 'Salió' : 'Ausente'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{todayEntry ? formatTime(todayEntry.timestamp) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map(e => {
            const dept = getDepartment(e.departmentId);
            const shift = getShift(e.shiftId);
            const status = getEmployeeTodayStatus(e.id);
            return (
              <div key={e.id} className="bg-background rounded-card border p-5 cursor-pointer hover:border-border-strong transition-colors" onClick={() => { setSelectedEmp(e.id); setEditMode(false); }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">{getInitials(e.name)}</div>
                  <div>
                    <p className="font-medium text-sm">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{dept?.name || '—'}</Badge>
                  <span className="text-xs text-muted-foreground">{shift?.name || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-success' : status === 'left' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                  <span className="text-xs">{status === 'present' ? 'Presente' : status === 'left' ? 'Salió' : 'Ausente'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail / edit */}
      <Dialog open={!!selectedEmp} onOpenChange={() => { setSelectedEmp(null); setEditMode(false); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editMode ? 'Editar empleado' : 'Ficha del empleado'}</DialogTitle></DialogHeader>
          {emp && !editMode && (() => {
            const dept = getDepartment(emp.departmentId);
            const shift = getShift(emp.shiftId);
            const status = getEmployeeTodayStatus(emp.id);
            const stats = empStats(emp.id);
            const empRecords = clockRecords.filter(r => r.employeeId === emp.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            return (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-medium">{getInitials(emp.name)}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{emp.name}</h3>
                    <p className="text-muted-foreground text-sm">{emp.email} · {emp.phone}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{dept?.name}</Badge>
                      <span className="text-xs text-muted-foreground">{shift?.name}</span>
                      <div className={`flex items-center gap-1 text-xs ${status === 'present' ? 'text-success' : status === 'left' ? 'text-muted-foreground' : 'text-destructive'}`}>
                        <div className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-success' : status === 'left' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                        {status === 'present' ? 'Presente' : status === 'left' ? 'Salió' : 'Ausente'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={startEdit}><Pencil className="w-3 h-3" />Editar</Button>
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDelete(emp.id)}><Trash2 className="w-3 h-3" />Eliminar</Button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Días trabajados', value: stats.daysWorked },
                    { label: 'Horas totales', value: formatHm(stats.totalMins) },
                    { label: 'Media diaria', value: stats.avg ? formatHm(stats.avg) : '—' },
                    { label: 'Fichajes', value: empRecords.length },
                    { label: 'Fuera de zona', value: stats.outZone },
                    { label: 'PIN', value: emp.pin },
                  ].map(s => (
                    <div key={s.label} className="bg-secondary rounded-md p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="font-semibold">{s.value}</p>
                    </div>
                  ))}
                </div>

                {stats.last20.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-3">Horas por día (últimos 20)</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={stats.last20}>
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 12]} />
                        <Tooltip formatter={(v: number) => `${v.toFixed(1)}h`} />
                        <Bar dataKey="hours" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div>
                  <h4 className="font-medium text-sm mb-3">Últimos fichajes</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {empRecords.length === 0 && <p className="text-sm text-muted-foreground">Sin fichajes aún.</p>}
                    {empRecords.slice(0, 10).map(r => (
                      <div key={r.id} className="flex items-center justify-between text-sm py-1.5 border-b">
                        <span>{r.type === 'entry' ? '→' : '←'} {r.address}</span>
                        <span className="tabular-nums text-muted-foreground">{formatTime(r.timestamp)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {emp && editMode && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div><label className="text-sm font-medium">Nombre completo *</label><Input value={editName} onChange={e => setEditName(e.target.value)} required /></div>
              <div><label className="text-sm font-medium">Email *</label><Input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required /></div>
              <div><label className="text-sm font-medium">Teléfono</label><Input value={editPhone} onChange={e => setEditPhone(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Departamento</label>
                <Select value={editDept} onValueChange={setEditDept}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Turno</label>
                <Select value={editShift} onValueChange={setEditShift}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.startTime && `${s.startTime}-${s.endTime}`}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Guardar cambios</Button>
                <Button type="button" variant="outline" onClick={() => setEditMode(false)}>Cancelar</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Añadir empleado</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre completo *</label><Input ref={addNameRef} placeholder="Nombre completo" required /></div>
            <div><label className="text-sm font-medium">Email *</label><Input ref={addEmailRef} type="email" placeholder="email@empresa.com" required /></div>
            <div><label className="text-sm font-medium">Teléfono</label><Input ref={addPhoneRef} placeholder="+34 612 345 678" /></div>
            <div><label className="text-sm font-medium">Departamento *</label>
              <Select value={addDept} onValueChange={setAddDept}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Turno *</label>
              <Select value={addShift} onValueChange={setAddShift}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.startTime && `${s.startTime}-${s.endTime}`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">PIN (4 dígitos)</label>
              <div className="flex gap-2">
                <Input value={addPin} onChange={e => setAddPin(e.target.value)} maxLength={4} />
                <Button type="button" variant="outline" size="sm" onClick={() => setAddPin(String(Math.floor(1000 + Math.random() * 9000)))}>Regenerar</Button>
              </div>
            </div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
