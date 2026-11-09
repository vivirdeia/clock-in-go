import { useState } from 'react';
import { useDataStore } from '@/store/dataStore';
import { Button } from '@/components/ui/button';
import { PageHeader, Panel, Field, Segmented, IconTile, inputCls } from '@/components/admin/kit';
import { Download, FileText, Clock, AlertTriangle, FileSpreadsheet, ShieldCheck, Bell } from 'lucide-react';
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

  const periodFilter = (date: string, selectedPeriod = period) => {
    const d = new Date(date);
    const now = new Date();
    if (selectedPeriod === 'week') {
      const start = new Date(now); start.setDate(now.getDate() - 7);
      return d >= start;
    }
    if (selectedPeriod === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (selectedPeriod === 'last_month') {
      const last = new Date(now); last.setMonth(now.getMonth() - 1);
      return d.getMonth() === last.getMonth() && d.getFullYear() === last.getFullYear();
    }
    if (selectedPeriod === 'quarter') {
      const start = new Date(now); start.setMonth(now.getMonth() - 3);
      return d >= start;
    }
    return true;
  };

  const filteredRecs = (selectedPeriod = period, selectedDept = deptFilter) => {
    let recs = clockRecords.filter(r => periodFilter(r.timestamp, selectedPeriod));
    if (selectedDept !== 'all') {
      recs = recs.filter(r => { const e = getEmployee(r.employeeId); return e?.departmentId === selectedDept; });
    }
    return recs;
  };

  const generateCSV = (selectedType = reportType, selectedPeriod = period, selectedDept = deptFilter) => {
    const date = new Date().toISOString().split('T')[0];
    if (selectedType === 'records') {
      const recs = filteredRecs(selectedPeriod, selectedDept);
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
    if (selectedType === 'official') {
      // Per-employee per-day: entry, exit, total
      const recs = filteredRecs(selectedPeriod, selectedDept);
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
    if (selectedType === 'employee_summary') {
      const header = 'Empleado,Departamento,Fichajes,Días trabajados,Horas totales,Fuera de zona\n';
      const rows = employees.map(e => {
        const dept = getDepartment(e.departmentId);
        const recs = filteredRecs(selectedPeriod, selectedDept).filter(r => r.employeeId === e.id);
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
    if (selectedType === 'dept_summary') {
      const header = 'Departamento,Empleados,Fichajes,Fuera de zona\n';
      const rows = departments.map(d => {
        const emps = employees.filter(e => e.departmentId === d.id);
        const recs = filteredRecs(selectedPeriod, selectedDept).filter(r => emps.some(e => e.id === r.employeeId));
        const outZone = recs.filter(r => !r.inZone).length;
        return `"${d.name}",${emps.length},${recs.length},${outZone}`;
      }).join('\n');
      downloadBlob(header + rows, `resumen_departamentos_${date}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Resumen por departamento descargado');
      return;
    }
    if (selectedType === 'alerts') {
      const header = 'Tipo,Empleado,Descripción,Estado,Fecha\n';
      const rows = alerts.filter(a => periodFilter(a.createdAt, selectedPeriod) && (selectedDept === 'all' || getEmployee(a.employeeId)?.departmentId === selectedDept)).map(a => {
        const emp = getEmployee(a.employeeId);
        return `"${a.type}","${emp?.name || ''}","${a.description}","${a.status}","${formatShortDate(a.createdAt)}"`;
      }).join('\n');
      downloadBlob(header + rows, `alertas_${date}.csv`, 'text/csv;charset=utf-8;');
      toast.success('Informe de alertas descargado');
      return;
    }
  };

  const generatePDF = (selectedPeriod = period, selectedDept = deptFilter) => {
    const printWin = window.open('', '_blank');
    if (!printWin) { toast.error('Permite ventanas emergentes para generar el PDF'); return; }
    const recs = filteredRecs(selectedPeriod, selectedDept);
    const rows = recs.slice(0, 100).map(r => {
      const emp = getEmployee(r.employeeId);
      return `<tr><td>${emp?.name || ''}</td><td>${r.type === 'entry' ? 'Entrada' : 'Salida'}</td><td>${formatShortDate(r.timestamp)}</td><td>${formatTime(r.timestamp)}</td><td>${r.address}</td><td>${r.inZone ? 'Sí' : 'No'}</td></tr>`;
    }).join('');
    printWin.document.write(`<!DOCTYPE html><html><head><title>Informe ClockIn — ${settings.companyName}</title><style>body{font-family:Inter,system-ui;padding:40px}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}h1{font-size:18px}p{color:#666;font-size:13px}</style></head><body><h1>Informe de Fichajes — ${settings.companyName}</h1><p>${settings.cif ? 'CIF: ' + settings.cif + ' · ' : ''}Generado: ${new Date().toLocaleDateString('es-ES')} · ${recs.length} registros</p><table><tr><th>Empleado</th><th>Tipo</th><th>Fecha</th><th>Hora</th><th>Dirección</th><th>En zona</th></tr>${rows}</table><script>window.print()</script></body></html>`);
    toast.success('PDF generado — usa Guardar como PDF en el diálogo de impresión');
  };

  const handleExport = () => format === 'csv' ? generateCSV() : generatePDF();

  const quickReports = [
    { name: 'Registro horario oficial', detail: `${new Date().toLocaleDateString('es-ES', { month: 'long' }).replace(/^./, c => c.toUpperCase())} · CSV · RD-ley 8/2019`, icon: ShieldCheck, featured: true, action: () => generateCSV('official', 'month', 'all') },
    { name: 'Fichajes de la semana', detail: 'CSV', icon: Clock, featured: false, action: () => generateCSV('records', 'week', 'all') },
    { name: 'Resumen mensual', detail: 'PDF', icon: FileText, featured: false, action: () => generatePDF('month', 'all') },
    { name: 'Alertas del mes', detail: 'CSV', icon: Bell, featured: false, action: () => generateCSV('alerts', 'month', 'all') },
  ];

  const recordCount = reportType === 'alerts'
    ? alerts.filter(a => periodFilter(a.createdAt) && (deptFilter === 'all' || getEmployee(a.employeeId)?.departmentId === deptFilter)).length
    : filteredRecs().length;

  return (
    <div className="space-y-8">
      <PageHeader title="Informes" subtitle="Listos para tu gestoría o para una inspección de trabajo" />
      <section aria-labelledby="quick-reports" className="space-y-4">
        <h2 id="quick-reports" className="text-lg font-semibold">Descarga rápida</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-4">
          {quickReports.map(r => (
            <button key={r.name} type="button" onClick={r.action}
              className={`rounded-[20px] border p-[22px] text-left transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${r.featured ? 'bg-brand-tint border-brand/20 hover:border-brand/40' : 'bg-background hover:bg-secondary'}`}>
              <IconTile icon={r.icon} tint={r.featured ? 'black' : 'gray'} size={44} />
              <p className="mt-5 text-base font-semibold">{r.name}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{r.detail}</p>
            </button>
          ))}
        </div>
      </section>
      <Panel className="rounded-[24px] p-6 space-y-6">
        <h2 className="text-lg font-semibold">Informe a medida</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto] items-end">
          <Field label="Tipo de informe">
            <select className={inputCls} value={reportType} onChange={e => setReportType(e.target.value)}>
              {reportTypes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="Periodo">
            <select className={inputCls} value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="week">Esta semana</option><option value="month">Este mes</option><option value="last_month">Mes anterior</option><option value="quarter">Trimestre</option><option value="all">Todo</option>
            </select>
          </Field>
          <Field label="Departamento">
            <select className={inputCls} value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="all">Todos</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <div>
            <span className="block text-sm font-semibold mb-1.5">Formato</span>
            <Segmented value={format} onChange={setFormat} options={[{ value: 'csv', label: 'CSV' }, { value: 'pdf', label: 'PDF' }]} />
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">Con estos filtros, el informe incluye {recordCount} registros.</p>
          <Button className="h-12 gap-2 shrink-0" onClick={handleExport}><Download className="h-4 w-4" />Descargar {format.toUpperCase()}</Button>
        </div>
      </Panel>
    </div>
  );
}
