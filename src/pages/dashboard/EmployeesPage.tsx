import { useState } from 'react';
import { employees, departments, shifts, getEmployeeTodayStatus, getDepartment, getShift, getInitials, getTodayRecords, formatTime, clockRecords } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Grid3X3, List, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EmployeesPage() {
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showPin, setShowPin] = useState<string | null>(null);

  const emp = selectedEmp ? employees.find(e => e.id === selectedEmp) : null;

  // Mock hours chart data
  const hoursData = Array.from({ length: 20 }, (_, i) => ({
    day: `D${i + 1}`,
    hours: 7 + Math.random() * 2.5,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Empleados</h2>
        <div className="flex gap-2">
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setView('table')} className={`px-3 py-2 ${view === 'table' ? 'bg-foreground text-primary-foreground' : ''}`}><List className="w-4 h-4" /></button>
            <button onClick={() => setView('grid')} className={`px-3 py-2 ${view === 'grid' ? 'bg-foreground text-primary-foreground' : ''}`}><Grid3X3 className="w-4 h-4" /></button>
          </div>
          <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" />Añadir empleado</Button>
        </div>
      </div>

      {view === 'table' ? (
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
                  <tr key={e.id} className="border-b hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => setSelectedEmp(e.id)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{getInitials(e.name)}</div>
                        <div><p className="font-medium">{e.name}</p><p className="text-xs text-muted-foreground">{e.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant="outline" className="text-xs">{dept?.name}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{shift?.name}</td>
                    <td className="px-4 py-3">
                      <button onClick={(ev) => { ev.stopPropagation(); setShowPin(showPin === e.id ? null : e.id); }}
                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                        {showPin === e.id ? <><EyeOff className="w-3 h-3" />{e.pin}</> : <><Eye className="w-3 h-3" />••••</>}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-success' : status === 'left' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                        <span className="text-sm capitalize">{status === 'present' ? 'Presente' : status === 'left' ? 'Salió' : 'Ausente'}</span>
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
              <div key={e.id} className="bg-background rounded-card border p-5 cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => setSelectedEmp(e.id)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">{getInitials(e.name)}</div>
                  <div>
                    <p className="font-medium text-sm">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{dept?.name}</Badge>
                  <span className="text-xs text-muted-foreground">{shift?.name}</span>
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

      {/* Employee detail */}
      <Dialog open={!!selectedEmp} onOpenChange={() => setSelectedEmp(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Ficha del empleado</DialogTitle></DialogHeader>
          {emp && (() => {
            const dept = getDepartment(emp.departmentId);
            const shift = getShift(emp.shiftId);
            const status = getEmployeeTodayStatus(emp.id);
            const empRecords = clockRecords.filter(r => r.employeeId === emp.id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
            return (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">{getInitials(emp.name)}</div>
                  <div>
                    <h3 className="text-xl font-bold">{emp.name}</h3>
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

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Días trabajados', value: '18 de 22' },
                    { label: 'Horas totales', value: '142h 30min' },
                    { label: 'Media diaria', value: '7h 55min' },
                    { label: 'Retardos', value: '2' },
                    { label: 'Fuera de zona', value: '1' },
                    { label: 'Ausencias', value: '2' },
                  ].map(s => (
                    <div key={s.label} className="bg-secondary rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="font-bold">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Horas por día (últimos 20 días)</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={hoursData}>
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                      <Tooltip formatter={(v: number) => `${v.toFixed(1)}h`} />
                      <Bar dataKey="hours" fill="hsl(var(--foreground))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h4 className="font-medium text-sm mb-3">Últimos fichajes</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
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
        </DialogContent>
      </Dialog>

      {/* Add employee */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Añadir empleado</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Empleado creado. Se le enviará el link de acceso por email.'); setShowAdd(false); }} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre completo *</label><Input placeholder="Nombre completo" required /></div>
            <div><label className="text-sm font-medium">Email *</label><Input type="email" placeholder="email@empresa.com" required /></div>
            <div><label className="text-sm font-medium">Teléfono</label><Input placeholder="+34 612 345 678" /></div>
            <div><label className="text-sm font-medium">Departamento</label>
              <Select><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Turno</label>
              <Select><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.startTime && `${s.startTime}-${s.endTime}`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">PIN (4 dígitos)</label>
              <div className="flex gap-2">
                <Input placeholder="1234" maxLength={4} defaultValue={String(Math.floor(1000 + Math.random() * 9000))} />
                <Button type="button" variant="outline" size="sm" onClick={() => {}}>Regenerar</Button>
              </div>
            </div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
