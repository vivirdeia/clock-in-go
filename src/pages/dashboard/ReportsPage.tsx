import { useState } from 'react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Clock, AlertTriangle, Timer, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import { formatTime, formatShortDate } from '@/types';
import { computeWorkedMinutes, formatHm } from '@/lib/alerts';

const reportTypes = [
  { id: 'records', name: 'Registro de fichajes', icon: Clock },
  { id: 'official', name: 'Registro horario oficial (RD 8/2019)', icon: FileSpreadsheet },
  { id: 'employee_summary', name: 'Resumen por empleado', icon: FileText },
  { id: 'dept_summary', name: 'Resumen por departamento', icon: FileText },
  { id: 'alerts', name: 'Informe de alertas', icon: AlertTriangle },
];

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { clockRecords, employees, departments, alerts, getEmployee, getDepartment, settings } = useDataStore();
  const [reportType, setReportType] = useState('records');
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('csv');
  const [deptFilter, setDeptFilter] = useState('all');

  const periodFilter = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    if (period === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - 7);
      return d >= start;
    }
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'last_month') {
      const last = new Date(now); last.setMonth(now.getMonth() - 1);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    }
    if (period === 'quarter') {
      const start = new Date(now); start.setMonth(now.getMonth() - 3);
      return d >= start;
    }
    return true;
  };

  const filteredRecs = () => {
    let recs = clockRecords.filter(r => periodFilter(r.timestamp));
    if (deptFilter !== 'all') {
      recs = recs.filter(r => { const e = getEmployee(r.employeeId); return e?.departmentId === deptFilter; });
    }
    return recs;
  };

  const generateCSV = () => {
    const date = new Date().toISOString().split('T')[0];
    if (reportType === 'records') {
      const recs = filteredRecs();
      const header = 'Empleado,Departamento,Tipo,Fecha,Hora,Dirección,En zona\n';
      const rows = recs.map(r => {
        const emp = getEmployee(r.employeeId);
        const dept = emp ? getDepartment(emp.departmentId) : null;
        return `"${emp?.name || ''}","${dept?.name || ''}","${r.type === 'entry' ? 'Entrada' : 'Salida'}","${formatShortDate(r.timestamp)}","${formatTime(r.timestamp)}","${r.address}","${r.inZone ? 'Sí' : 'No'}"`;
      }).join('\n');
      downloadBlob(header + rows, `fichajes_${date}.csv`, 'text/csv;charset=utf-8;');
      toast.success(`CSV descargado: ${recs.length} registros`);
      return;
    }
    if (reportType === 'official') {
      // Per-employee per-day: entry, exit, total
      const recs = filteredRecs();
      const grouped: Record<string, Record<string, typeof recs>> = {};
      recs.forEach(r => {
        const day = r.timestamp.slice(0, 10);
        grouped[r.employeeId] = grouped[r.employeeId] || {};
        (grouped[r.employeeId][day] = grouped[r.employeeId][day] || []).push(r);
      });
      const header = 'Empleado,Email,Departamento,Fecha,Primera entrada,Última salida,Horas trabajadas\n';
      const rows: string[] = [];
      for (const [empId, days] of Object.entries(grouped)) {
        const emp = getEmployee(empId); if (!emp) continue;
        const dept = getDepartment(emp.departmentId);
        for (const [day, dayRecs] of Object.entries(days)) {
          const sorted = [...dayRecs].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
          const firstIn = sorted.find(r => r.type === 'entry');
          const lastOut = [...sorted].reverse().find(r => r.type === 'exit');
          const mins = computeWorkedMinutes(sorted);
          rows.push(`"${emp.name}","${emp.email}","${dept?.name || ''}","${day}","${firstIn ? formatTime(firstIn.timestamp) : ''}","${lastOut ? formatTime(lastOut.timestamp) : ''}","${formatHm(mins)}"`);
        }
      }
      downloadBlob(header + rows.join('\n'), `registro_oficial_${date}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Registro oficial descargado (compatible Inspección de Trabajo)');
      return;
    }
    if (reportType === 'employee_summary') {
      const header = 'Empleado,Departamento,Fichajes,Días trabajados,Horas totales,Fuera de zona\n';
      const rows = employees.map(e => {
        const dept = getDepartment(e.departmentId);
        const recs = filteredRecs().filter(r => r.employeeId === e.id);
        const days = new Set(recs.map(r => r.timestamp.slice(0, 10)));
        let totalMins = 0;
        days.forEach(d => { totalMins += computeWorkedMinutes(recs.filter(r => r.timestamp.startsWith(d))); });
        const outZone = recs.filter(r => !r.inZone).length;
        return `"${e.name}","${dept?.name || ''}",${recs.length},${days.size},"${formatHm(totalMins)}",${outZone}`;
      }).join('\n');
      downloadBlob(header + rows, `resumen_empleados_${date}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Resumen por empleado descargado');
      return;
    }
    if (reportType === 'dept_summary') {
      const header = 'Departamento,Empleados,Fichajes,Fuera de zona\n';
      const rows = departments.map(d => {
        const emps = employees.filter(e => e.departmentId === d.id);
        const recs = filteredRecs().filter(r => emps.some(e => e.id === r.employeeId));
        const outZone = recs.filter(r => !r.inZone).length;
        return `"${d.name}",${emps.length},${recs.length},${outZone}`;
      }).join('\n');
      downloadBlob(header + rows, `resumen_departamentos_${date}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Resumen por departamento descargado');
      return;
    }
    if (reportType === 'alerts') {
      const header = 'Tipo,Empleado,Descripción,Estado,Fecha\n';
      const rows = alerts.filter(a => periodFilter(a.createdAt)).map(a => {
        const emp = getEmployee(a.employeeId);
        return `"${a.type}","${emp?.name || ''}","${a.description}","${a.status}","${formatShortDate(a.createdAt)}"`;
      }).join('\n');
      downloadBlob(header + rows, `alertas_${date}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Informe de alertas descargado');
      return;
    }
  };

  const generatePDF = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) { toast.error('Permite ventanas emergentes para generar el PDF'); return; }
    const recs = filteredRecs();
    const rows = recs.slice(0, 100).map(r => {
      const emp = getEmployee(r.employeeId);
      return `<tr><td>${emp?.name || ''}</td><td>${r.type === 'entry' ? 'Entrada' : 'Salida'}</td><td>${formatShortDate(r.timestamp)}</td><td>${formatTime(r.timestamp)}</td><td>${r.address}</td><td>${r.inZone ? 'Sí' : 'No'}</td></tr>`;
    }).join('');
    printWin.document.write(`<!DOCTYPE html><html><head><title>Informe ClockIn — ${settings.companyName}</title><style>body{font-family:Inter,system-ui;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}h1{font-size:18px}p{color:#666;font-size:13px}</style></head><body><h1>Informe de Fichajes — ${settings.companyName}</h1><p>${settings.cif ? 'CIF: ' + settings.cif + ' · ' : ''}Generado: ${new Date().toLocaleDateString('es-ES')} · ${recs.length} registros</p><table><tr><th>Empleado</th><th>Tipo</th><th>Fecha</th><th>Hora</th><th>Dirección</th><th>En zona</th></tr>${rows}</table><script>window.print()</script></body></html>`);
    toast.success('PDF generado — usa Guardar como PDF en el diálogo de impresión');
  };

  const handleExport = () => format === 'csv' ? generateCSV() : generatePDF();

  const quickReports = [
    { name: 'Fichajes de hoy', format: 'CSV', action: () => { setReportType('records'); setPeriod('week'); setTimeout(generateCSV, 0); } },
    { name: 'Registro oficial mensual', format: 'CSV', action: () => { setReportType('official'); setPeriod('month'); setTimeout(generateCSV, 0); } },
    { name: 'Resumen mensual', format: 'PDF', action: () => { setPeriod('month'); setTimeout(generatePDF, 0); } },
    { name: 'Alertas del mes', format: 'CSV', action: () => { setReportType('alerts'); setPeriod('month'); setTimeout(generateCSV, 0); } },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Exportar informes</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickReports.map(r => (
          <button key={r.name} onClick={r.action}
            className="bg-background rounded-card border p-4 text-left hover:border-border-strong transition-colors">
            <Download className="w-4 h-4 text-muted-foreground mb-2" strokeWidth={1.5} />
            <p className="font-medium text-sm">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.format}</p>
          </button>
        ))}
      </div>

      <div className="bg-background rounded-card border p-6 space-y-4">
        <h3 className="font-semibold">Generar informe personalizado</h3>
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
                <SelectItem value="all">Todo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Departamento</label>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Formato</label>
            <div className="flex rounded-md border overflow-hidden h-10">
              <button onClick={() => setFormat('csv')} className={`px-4 text-sm flex-1 ${format === 'csv' ? 'bg-foreground text-primary-foreground' : ''}`}>CSV</button>
              <button onClick={() => setFormat('pdf')} className={`px-4 text-sm flex-1 ${format === 'pdf' ? 'bg-foreground text-primary-foreground' : ''}`}>PDF</button>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">El informe contiene {filteredRecs().length} registros con los filtros actuales.</p>
        <Button className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" strokeWidth={1.5} />Exportar {format.toUpperCase()}
        </Button>
      </div>
    </div>
  );
}
