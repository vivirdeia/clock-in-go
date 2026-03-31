import { useState } from 'react';
import { departments, employees, getEmployeesByDepartment, getEmployeeTodayStatus, getEmployee, getShift } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Departamentos</h2>
        <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" />Nuevo departamento</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(d => {
          const emps = getEmployeesByDepartment(d.id);
          const present = emps.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
          const manager = getEmployee(d.managerId);
          const pct = emps.length > 0 ? Math.round((present / emps.length) * 100) : 0;
          return (
            <div key={d.id} className="bg-background rounded-card border p-5 cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => setSelectedDept(d.id)}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold">{d.name}</h3>
                <Badge variant={present === emps.length ? 'outline' : 'secondary'}
                  className={present === emps.length ? 'text-success border-success text-xs' : 'text-xs'}>
                  {present}/{emps.length}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">Responsable: {manager?.name || '—'}</p>
              <div className="w-full h-1.5 bg-secondary rounded-full mb-2">
                <div className={`h-full rounded-full ${present === emps.length ? 'bg-success' : present === 0 ? 'bg-destructive' : 'bg-warning'}`}
                  style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{emps.length} empleados</span>
                <span>{pct}% puntualidad</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail */}
      <Dialog open={!!selectedDept} onOpenChange={() => setSelectedDept(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Departamento</DialogTitle></DialogHeader>
          {selectedDept && (() => {
            const dept = departments.find(d => d.id === selectedDept)!;
            const emps = getEmployeesByDepartment(dept.id);
            const manager = getEmployee(dept.managerId);
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                  <p className="text-sm mt-1">Responsable: <strong>{manager?.name}</strong></p>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-2">Empleados</h4>
                  <div className="space-y-2">
                    {emps.map(e => {
                      const status = getEmployeeTodayStatus(e.id);
                      return (
                        <div key={e.id} className="flex items-center justify-between py-1.5 border-b">
                          <span className="text-sm">{e.name}</span>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${status === 'present' ? 'bg-success' : status === 'left' ? 'bg-muted-foreground' : 'bg-destructive'}`} />
                            <span className="text-xs text-muted-foreground">{status === 'present' ? 'Presente' : status === 'left' ? 'Salió' : 'Ausente'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Add */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo departamento</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Departamento creado'); setShowAdd(false); }} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre *</label><Input required /></div>
            <div><label className="text-sm font-medium">Responsable</label>
              <Select><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Descripción</label><Textarea /></div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
