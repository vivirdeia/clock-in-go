import { useState, useRef } from 'react';
import { useDataStore } from '@/store/dataStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

export default function DepartmentsPage() {
  const {
    departments, employees, shifts,
    addDepartment, updateDepartment, deleteDepartment,
    getEmployeesByDepartment, getEmployeeTodayStatus, getEmployee,
  } = useDataStore();

  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const addNameRef = useRef<HTMLInputElement>(null);
  const addDescRef = useRef<HTMLTextAreaElement>(null);
  const [addManager, setAddManager] = useState('');
  const [addShiftId, setAddShiftId] = useState(shifts[0]?.id || '');

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editManager, setEditManager] = useState('');
  const [editShiftId, setEditShiftId] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newDept = addDepartment({
      name: addNameRef.current?.value || '',
      managerId: addManager || '',
      description: addDescRef.current?.value || '',
      defaultShiftId: addShiftId || shifts[0]?.id || 's1',
    });
    setShowAdd(false);
    setAddManager('');
    toast.success(`Departamento "${newDept.name}" creado`);
  };

  const handleDelete = (id: string) => {
    if (getEmployeesByDepartment(id).length > 0) {
      toast.error('No puedes eliminar un departamento con empleados asignados');
      return;
    }
    const name = departments.find(d => d.id === id)?.name;
    deleteDepartment(id);
    setSelectedDept(null);
    toast.success(`Departamento "${name}" eliminado`);
  };

  const startEdit = () => {
    const dept = departments.find(d => d.id === selectedDept);
    if (!dept) return;
    setEditName(dept.name); setEditDesc(dept.description); setEditManager(dept.managerId); setEditShiftId(dept.defaultShiftId);
    setEditMode(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept) return;
    updateDepartment(selectedDept, { name: editName, description: editDesc, managerId: editManager, defaultShiftId: editShiftId });
    setEditMode(false);
    toast.success('Departamento actualizado');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Departamentos</h2>
        <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" strokeWidth={1.5} />Nuevo departamento</Button>
      </div>

      {departments.length === 0 ? (
        <div className="bg-background rounded-card border p-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">Aún no tienes departamentos.</p>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" />Crear el primero</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map(d => {
            const emps = getEmployeesByDepartment(d.id);
            const present = emps.filter(e => getEmployeeTodayStatus(e.id) === 'present').length;
            const manager = getEmployee(d.managerId);
            const pct = emps.length > 0 ? Math.round((present / emps.length) * 100) : 0;
            return (
              <div key={d.id} className="bg-background rounded-card border p-5 cursor-pointer hover:border-border-strong transition-colors" onClick={() => { setSelectedDept(d.id); setEditMode(false); }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{d.name}</h3>
                  <Badge variant="outline" className={`text-xs ${emps.length > 0 && present === emps.length ? 'text-success border-success' : ''}`}>
                    {present}/{emps.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">Responsable: {manager?.name || '—'}</p>
                <div className="w-full h-1.5 bg-secondary rounded-full mb-2">
                  <div className={`h-full rounded-full ${emps.length > 0 && present === emps.length ? 'bg-success' : present === 0 ? 'bg-destructive' : 'bg-warning'}`}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{emps.length} empleados</span>
                  <span>{pct}% presencia</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedDept} onOpenChange={() => { setSelectedDept(null); setEditMode(false); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editMode ? 'Editar departamento' : 'Departamento'}</DialogTitle></DialogHeader>
          {selectedDept && !editMode && (() => {
            const dept = departments.find(d => d.id === selectedDept)!;
            const emps = getEmployeesByDepartment(dept.id);
            const manager = getEmployee(dept.managerId);
            return (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{dept.name}</h3>
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
                  <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><label className="text-sm font-medium">Turno por defecto</label>
                <Select value={editShiftId} onValueChange={setEditShiftId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
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

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo departamento</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre *</label><Input ref={addNameRef} required /></div>
            <div><label className="text-sm font-medium">Responsable</label>
              <Select value={addManager} onValueChange={setAddManager}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>{employees.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Turno por defecto</label>
              <Select value={addShiftId} onValueChange={setAddShiftId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
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
