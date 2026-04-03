import { useState } from 'react';
import { departments, employees, clockRecords, alerts, getEmployee, getDepartment, formatTime, formatShortDate } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Clock, AlertTriangle, Timer } from 'lucide-react';
import { toast } from 'sonner';

const reportTypes = [
  { id: 'records', name: 'Registro de fichajes', icon: Clock },
  { id: 'employee_summary', name: 'Resumen por empleado', icon: FileText },
  { id: 'dept_summary', name: 'Resumen por departamento', icon: FileText },
  { id: 'alerts', name: 'Informe de alertas', icon: AlertTriangle },
  { id: 'overtime', name: 'Informe de horas extra', icon: Timer },
];

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function generateCSV(type: string) {
  const date = new Date().toISOString().split('T')[0];
  if (type === 'records' || type === 'today') {
    const recs = type === 'today'
      ? clockRecords.filter(r => r.timestamp.startsWith(new Date().toISOString().split('T')[0]))
      : clockRecords;
    const header = 'Empleado,Departamento,Tipo,Fecha,Hora,Dirección,En zona\n';
    const rows = recs.map(r => {
      const emp = getEmployee(r.employeeId);
      const dept = emp ? getDepartment(emp.departmentId) : null;
      return `"${emp?.name}","${dept?.name}","${r.type === 'entry' ? 'Entrada' : 'Salida'}","${formatShortDate(r.timestamp)}","${formatTime(r.timestamp)}","${r.address}","${r.inZone ? 'Sí' : 'No'}"`;
    }).join('\n');
    downloadBlob(header + rows, `fichajes_${date}.csv`, 'text/csv;charset=utf-8;');
    toast.success(`CSV descargado: ${recs.length} registros`);
  } else if (type === 'employee_summary') {
    const header = 'Empleado,Departamento,Fichajes totales,Entradas,Salidas,Fuera de zona\n';
    const rows = employees.map(e => {
      const dept = getDepartment(e.departmentId);
      const recs = clockRecords.filter(r => r.employeeId === e.id);
      const entries = recs.filter(r => r.type === 'entry').length;
      const exits = recs.filter(r => r.type === 'exit').length;
      const outZone = recs.filter(r => !r.inZone).length;
      return `"${e.name}","${dept?.name}",${recs.length},${entries},${exits},${outZone}`;
    }).join('\n');
    downloadBlob(header + rows, `resumen_empleados_${date}.csv`, 'text/csv;charset=utf-8;');
    toast.success('Resumen por empleado descargado');
  } else if (type === 'dept_summary') {
    const header = 'Departamento,Empleados,Fichajes totales,Fuera de zona\n';
    const rows = departments.map(d => {
      const emps = employees.filter(e => e.departmentId === d.id);
      const recs = clockRecords.filter(r => emps.some(e => e.id === r.employeeId));
      const outZone = recs.filter(r => !r.inZone).length;
      return `"${d.name}",${emps.length},${recs.length},${outZone}`;
    }).join('\n');
    downloadBlob(header + rows, `resumen_departamentos_${date}.csv`, 'text/csv;charset=utf-8;');
    toast.success('Resumen por departamento descargado');
  } else if (type === 'alerts') {
    const header = 'Tipo,Empleado,Descripción,Estado,Fecha\n';
    const rows = alerts.map(a => {
      const emp = getEmployee(a.employeeId);
      return `"${a.type}","${emp?.name}","${a.description}","${a.status}","${formatShortDate(a.createdAt)}"`;
    }).join('\n');
    downloadBlob(header + rows, `alertas_${date}.csv`, 'text/csv;charset=utf-8;');
    toast.success('Informe de alertas descargado');
  } else if (type === 'overtime') {
    const header = 'Empleado,Descripción,Estado,Fecha\n';
    const rows = alerts.filter(a => a.type === 'overtime').map(a => {
      const emp = getEmployee(a.employeeId);
      return `"${emp?.name}","${a.description}","${a.status}","${formatShortDate(a.createdAt)}"`;
    }).join('\n');
    downloadBlob(header + rows, `horas_extra_${date}.csv`, 'text/csv;charset=utf-8;');
    toast.success('Informe de horas extra descargado');
  }
}

function generatePDF() {
  const printWin = window.open('', '_blank');
  if (!printWin) { toast.error('Permite ventanas emergentes para generar el PDF'); return; }
  const rows = clockRecords.slice(0, 50).map(r => {
    const emp = getEmployee(r.employeeId);
    return `<tr><td>${emp?.name}</td><td>${r.type === 'entry' ? 'Entrada' : 'Salida'}</td><td>${formatShortDate(r.timestamp)}</td><td>${formatTime(r.timestamp)}</td><td>${r.address}</td><td>${r.inZone ? 'Sí' : 'No'}</td></tr>`;
  }).join('');
  printWin.document.write(`<!DOCTYPE html><html><head><title>Informe ClockIn</title><style>body{font-family:system-ui;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}h1{font-size:18px}p{color:#666;font-size:13px}</style></head><body><h1>📋 Informe de Fichajes — ClockIn</h1><p>Generado: ${new Date().toLocaleDateString('es-ES')}</p><table><tr><th>Empleado</th><th>Tipo</th><th>Fecha</th><th>Hora</th><th>Dirección</th><th>En zona</th></tr>${rows}</table><script>window.print()</script></body></html>`);
  toast.success('PDF generado — usa Guardar como PDF en el diálogo de impresión');
}

const quickReports = [
  { name: 'Fichajes de hoy', format: 'CSV', action: () => generateCSV('today') },
  { name: 'Resumen mensual', format: 'PDF', action: () => generatePDF() },
  { name: 'Empleados con incidencias', format: 'CSV', action: () => generateCSV('alerts') },
  { name: 'Horas extra del mes', format: 'CSV', action: () => generateCSV('overtime') },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('records');
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('csv');

  const handleExport = () => {
    if (format === 'csv') {
      generateCSV(reportType);
    } else {
      generatePDF();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Exportar informes</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickReports.map(r => (
          <button key={r.name} onClick={r.action}
            className="bg-background rounded-card border p-4 text-left hover:shadow-elevated transition-shadow">
            <Download className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="font-medium text-sm">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.format}</p>
          </button>
        ))}
      </div>

      <div className="bg-background rounded-card border p-6 space-y-4">
        <h3 className="font-bold">Generar informe personalizado</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Tipo de informe</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{reportTypes.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Período</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="last_month">Mes anterior</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Departamento</label>
            <Select defaultValue="all">
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Formato</label>
            <div className="flex rounded-lg border overflow-hidden h-10">
              <button onClick={() => setFormat('csv')} className={`px-4 text-sm flex-1 ${format === 'csv' ? 'bg-foreground text-primary-foreground' : ''}`}>CSV</button>
              <button onClick={() => setFormat('pdf')} className={`px-4 text-sm flex-1 ${format === 'pdf' ? 'bg-foreground text-primary-foreground' : ''}`}>PDF</button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-secondary">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Empleado</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Tipo</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Hora</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Dirección</th>
            </tr></thead>
            <tbody>
              {clockRecords.slice(0, 5).map(r => {
                const emp = getEmployee(r.employeeId);
                return (
                  <tr key={r.id} className="border-b">
                    <td className="px-4 py-2">{emp?.name}</td>
                    <td className="px-4 py-2">{r.type === 'entry' ? 'Entrada' : 'Salida'}</td>
                    <td className="px-4 py-2">{formatShortDate(r.timestamp)}</td>
                    <td className="px-4 py-2 tabular-nums">{formatTime(r.timestamp)}</td>
                    <td className="px-4 py-2 text-muted-foreground">{r.address}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">Este informe contiene {clockRecords.length} registros</p>
        <Button className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />Exportar {format.toUpperCase()}
        </Button>
      </div>

      <div className="bg-background rounded-card border p-6">
        <h3 className="font-bold mb-4">Historial de informes</h3>
        <div className="space-y-2">
          {['Fichajes marzo 2025 — CSV — 25/03', 'Resumen febrero — PDF — 01/03', 'Horas extra enero — CSV — 02/02'].map(r => (
            <div key={r} className="flex items-center justify-between py-2 border-b text-sm">
              <span>{r}</span>
              <Button variant="ghost" size="sm" onClick={() => generateCSV('records')}>Descargar</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
