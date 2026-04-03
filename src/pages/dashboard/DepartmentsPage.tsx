import { useState, useRef } from 'react';
import { departments as initialDepartments, employees as allEmployees, getEmployeesByDepartment, getEmployeeTodayStatus, getEmployee, type Department } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const [deptsList, setDeptsList] = useState<Department[]>([...initialDepartments]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Add form
  const addNameRef = useRef<HTMLInputElement>(null);
  const addDescRef = useRef<HTMLTextAreaElement>(null);
  const [addManager, setAddManager] = useState('');

  // Edit form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editManager, setEditManager] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newDept: Department = {
      id: `d_${Date.now()}`,
      name: addNameRef.current?.value || '',
      managerId: addManager || '',
      description: addDescRef.current?.value || '',
      defaultShiftId: 's1',
    };
    setDeptsList(prev => [...prev, newDept]);
    setShowAdd(false);
    setAddManager('');
    toast.success(`Departamento "${newDept.name}" creado`);
  };

  const handleDelete = (id: string) => {
    const name = deptsList.find(d => d.id === id)?.name;
    setDeptsList(prev => prev.filter(d => d.id !== id));
    setSelectedDept(null);
    toast.success(`Departamento "${name}" eliminado`);
  };

  const startEdit = () => {
    const dept = deptsList.find(d => d.id === selectedDept);
    if (!dept) return;
    setEditName(dept.name);
    setEditDesc(dept.description);
    setEditManager(dept.managerId);
    setEditMode(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    setDeptsList(prev => prev.map(d =>
      d.id === selectedDept ? { ...d, name: editName, description: editDesc, managerId: editManager } : d
    ));
    setEditMode(false);
    toast.success('Departamento actualizado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Departamentos</h2>
        <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" />Nuevo departamento</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {deptsList.map(d => {
          const emps = getEmployeesByDepartment(d.id);
          const present = emps.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
          const manager = getEmployee(d.managerId);
          const pct = emps.length > 0 ? Math.round((present / emps.length) * 100) : 0;
          return (
            <div key={d.id} className="bg-background rounded-card border p-5 cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => { setSelectedDept(d.id); setEditMode(false); }}>
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

      {/* Detail / Edit */}
      <Dialog open={!!selectedDept} onOpenChange={() => { setSelectedDept(null); setEditMode(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editMode ? 'Editar departamento' : 'Departamento'}</DialogTitle></DialogHeader>
          {selectedDept && !editMode && (() => {
            const dept = deptsList.find(d => d.id === selectedDept)!;
            const emps = getEmployeesByDepartment(dept.id);
            const manager = getEmployee(dept.managerId);
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{dept.name}</h3>
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                  <p className="text-sm mt-1">Responsable: <strong>{manager?.name || '—'}</strong></p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1" onClick={startEdit}><Pencil className="w-3 h-3" />Editar</Button>
                  <Button variant="destructive" size="sm" className="gap-1" onClick={() => handleDelete(dept.id)}><Trash2 className="w-3 h-3" />Eliminar</Button>
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
                    {emps.length === 0 && <p className="text-sm text-muted-foreground">Sin empleados asignados</p>}
                  </div>
                </div>
              </div>
            );
          })()}

          {selectedDept && editMode && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div><label className="text-sm font-medium">Nombre *</label><Input value={editName} onChange={e => setEditName(e.target.value)} required /></div>
              <div><label className="text-sm font-medium">Responsable</label>
                <Select value={editManager} onValueChange={setEditManager}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>{allEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Descripción</label><Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>
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
          <DialogHeader><DialogTitle>Nuevo departamento</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre *</label><Input ref={addNameRef} required /></div>
            <div><label className="text-sm font-medium">Responsable</label>
              <Select value={addManager} onValueChange={setAddManager}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{allEmployees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Descripción</label><Textarea ref={addDescRef} /></div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
