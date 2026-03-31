import { useState } from 'react';
import { departments, employees } from '@/data/mockData';
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

const quickReports = [
  { name: 'Fichajes de hoy', format: 'CSV' },
  { name: 'Resumen mensual', format: 'PDF' },
  { name: 'Empleados con incidencias', format: 'Lista' },
  { name: 'Horas extra del mes', format: 'Lista' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('records');
  const [period, setPeriod] = useState('month');
  const [format, setFormat] = useState('csv');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Exportar informes</h2>

      {/* Quick reports */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickReports.map(r => (
          <button key={r.name} onClick={() => toast.success(`${r.name} exportado`)}
            className="bg-background rounded-card border p-4 text-left hover:shadow-elevated transition-shadow">
            <Download className="w-4 h-4 text-muted-foreground mb-2" />
            <p className="font-medium text-sm">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.format}</p>
          </button>
        ))}
      </div>

      {/* Generator */}
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
            <Select><SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
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

        {/* Preview */}
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
              {employees.slice(0, 5).map(e => (
                <tr key={e.id} className="border-b">
                  <td className="px-4 py-2">{e.name}</td>
                  <td className="px-4 py-2">Entrada</td>
                  <td className="px-4 py-2">25/03</td>
                  <td className="px-4 py-2 tabular-nums">08:15</td>
                  <td className="px-4 py-2 text-muted-foreground">Calle de Alcalá 45, Madrid</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-muted-foreground">Este informe contiene 248 registros del periodo 1-25 marzo 2025</p>
        <Button className="gap-2" onClick={() => toast.success(`Informe exportado como ${format.toUpperCase()}`)}>
          <Download className="w-4 h-4" />Exportar {format.toUpperCase()}
        </Button>
      </div>

      {/* History */}
      <div className="bg-background rounded-card border p-6">
        <h3 className="font-bold mb-4">Historial de informes</h3>
        <div className="space-y-2">
          {['Fichajes marzo 2025 — CSV — 25/03', 'Resumen febrero — PDF — 01/03', 'Horas extra enero — CSV — 02/02'].map(r => (
            <div key={r} className="flex items-center justify-between py-2 border-b text-sm">
              <span>{r}</span>
              <Button variant="ghost" size="sm" onClick={() => toast.success('Descargando...')}>Descargar</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
