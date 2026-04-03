import { useState } from 'react';
import { clockRecords, employees, departments, getEmployee, getDepartment, formatTime, formatShortDate, getInitials } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, X } from 'lucide-react';
import { toast } from 'sonner';

function downloadCSV(records: typeof clockRecords) {
  const header = 'Empleado,Departamento,Tipo,Fecha,Hora,Dirección,Lat,Lng,En zona,Precisión\n';
  const rows = records.map(r => {
    const emp = getEmployee(r.employeeId);
    const dept = emp ? getDepartment(emp.departmentId) : null;
    return `"${emp?.name || ''}","${dept?.name || ''}","${r.type === 'entry' ? 'Entrada' : 'Salida'}","${formatShortDate(r.timestamp)}","${formatTime(r.timestamp)}","${r.address}",${r.lat},${r.lng},${r.inZone ? 'Sí' : 'No'},${r.accuracy}m`;
  }).join('\n');
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fichajes_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`CSV descargado con ${records.length} registros`);
}

export default function ClockRecordsPage() {
  const [deptFilter, setDeptFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<typeof clockRecords[0] | null>(null);

  let filtered = [...clockRecords].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (deptFilter !== 'all') filtered = filtered.filter(r => { const e = getEmployee(r.employeeId); return e?.departmentId === deptFilter; });
  if (typeFilter !== 'all') filtered = filtered.filter(r => r.type === typeFilter);
  if (statusFilter === 'in_zone') filtered = filtered.filter(r => r.inZone);
  if (statusFilter === 'out_of_zone') filtered = filtered.filter(r => !r.inZone);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Fichajes</h2>
        <Button variant="outline" className="gap-2" onClick={() => downloadCSV(filtered)}>
          <Download className="w-4 h-4" />Exportar CSV
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Departamento" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex rounded-lg border overflow-hidden">
          {[{ v: 'all', l: 'Todos' }, { v: 'entry', l: 'Entradas' }, { v: 'exit', l: 'Salidas' }].map(t => (
            <button key={t.v} onClick={() => setTypeFilter(t.v)}
              className={`px-3 py-2 text-sm transition-colors ${typeFilter === t.v ? 'bg-foreground text-primary-foreground' : 'hover:bg-secondary'}`}>{t.l}</button>
          ))}
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {[{ v: 'all', l: 'Todos' }, { v: 'in_zone', l: 'En zona' }, { v: 'out_of_zone', l: 'Fuera' }].map(t => (
            <button key={t.v} onClick={() => setStatusFilter(t.v)}
              className={`px-3 py-2 text-sm transition-colors ${statusFilter === t.v ? 'bg-foreground text-primary-foreground' : 'hover:bg-secondary'}`}>{t.l}</button>
          ))}
        </div>
        {(deptFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
          <Button variant="ghost" size="sm" onClick={() => { setDeptFilter('all'); setTypeFilter('all'); setStatusFilter('all'); }}>
            <X className="w-3 h-3 mr-1" />Limpiar
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">Mostrando {filtered.length} registros</p>

      <div className="bg-background rounded-card border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Empleado</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Depto</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tipo</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Hora</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Dirección</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 25).map(rec => {
              const emp = getEmployee(rec.employeeId);
              const dept = emp ? getDepartment(emp.departmentId) : null;
              return (
                <tr key={rec.id} className="border-b hover:bg-secondary/30 cursor-pointer transition-colors" onClick={() => setSelectedRecord(rec)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{emp ? getInitials(emp.name) : '?'}</div>
                      <span className="font-medium">{emp?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dept?.name}</td>
                  <td className="px-4 py-3">{rec.type === 'entry' ? '→ Entrada' : '← Salida'}</td>
                  <td className="px-4 py-3 tabular-nums">{formatShortDate(rec.timestamp)}</td>
                  <td className="px-4 py-3 tabular-nums">{formatTime(rec.timestamp)}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-48 truncate">{rec.address}</td>
                  <td className="px-4 py-3">
                    <Badge variant={rec.inZone ? 'outline' : 'destructive'} className={`text-xs ${rec.inZone ? 'text-success border-success' : ''}`}>
                      {rec.inZone ? 'En zona' : 'Fuera'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detalle del fichaje</DialogTitle></DialogHeader>
          {selectedRecord && (() => {
            const emp = getEmployee(selectedRecord.employeeId);
            const dept = emp ? getDepartment(emp.departmentId) : null;
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground">Empleado</p><p className="font-medium">{emp?.name}</p></div>
                  <div><p className="text-muted-foreground">Departamento</p><p className="font-medium">{dept?.name}</p></div>
                  <div><p className="text-muted-foreground">Tipo</p><p className="font-medium">{selectedRecord.type === 'entry' ? 'Entrada' : 'Salida'}</p></div>
                  <div><p className="text-muted-foreground">Hora</p><p className="font-medium tabular-nums">{formatTime(selectedRecord.timestamp)}</p></div>
                  <div className="col-span-2"><p className="text-muted-foreground">Dirección</p><p className="font-medium">{selectedRecord.address}</p></div>
                  <div><p className="text-muted-foreground">Precisión GPS</p><p className="font-medium">{selectedRecord.accuracy}m</p></div>
                  <div><p className="text-muted-foreground">Estado</p>
                    <Badge variant={selectedRecord.inZone ? 'outline' : 'destructive'} className={selectedRecord.inZone ? 'text-success border-success' : ''}>
                      {selectedRecord.inZone ? 'En zona' : 'Fuera de zona'}
                    </Badge>
                  </div>
                </div>
                <div className="bg-secondary rounded-lg h-40 flex items-center justify-center text-muted-foreground text-sm">
                  🗺️ Mapa — {selectedRecord.lat.toFixed(4)}, {selectedRecord.lng.toFixed(4)}
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
