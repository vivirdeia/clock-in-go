import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { shifts as initialShifts, type Shift } from '@/data/mockData';
import { toast } from 'sonner';
import { useAuth, PlanType } from '@/store/AuthContext';
import { Check, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, updatePlan } = useAuth();
  const [pressTime, setPressTime] = useState([2]);

  // General settings state
  const [companyName, setCompanyName] = useState('TechCorp SL');
  const [cif, setCif] = useState('B12345678');
  const [timezone, setTimezone] = useState('europe_madrid');
  const [timeFormat, setTimeFormat] = useState('24h');

  // Shifts state
  const [shiftsList, setShiftsList] = useState<Shift[]>([...initialShifts]);
  const [showAddShift, setShowAddShift] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('');
  const [newShiftEnd, setNewShiftEnd] = useState('');
  const [newShiftBreak, setNewShiftBreak] = useState('30');
  const [newShiftTolerance, setNewShiftTolerance] = useState('5');

  // Alert toggles state
  const [alertOutZone, setAlertOutZone] = useState(true);
  const [alertLate, setAlertLate] = useState(true);
  const [alertAbsent, setAlertAbsent] = useState(true);
  const [alertOvertime, setAlertOvertime] = useState(true);
  const [alertEmail, setAlertEmail] = useState(true);
  const [alertDaily, setAlertDaily] = useState(false);

  // Security state
  const [requireGps, setRequireGps] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [sound, setSound] = useState(true);
  const [pinExpiry, setPinExpiry] = useState('never');

  // Legal
  const [consentText, setConsentText] = useState('Al utilizar ClockIn, consiento que se registre la hora y ubicación GPS de mis fichajes con el fin de control horario según el RD-ley 8/2019. La ubicación se captura exclusivamente en el momento del fichaje y no se realiza seguimiento continuo.');
  const [requireConsent, setRequireConsent] = useState(true);

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const newShift: Shift = {
      id: `s_${Date.now()}`,
      name: newShiftName,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      breakMinutes: parseInt(newShiftBreak) || 0,
      lateToleranceMinutes: parseInt(newShiftTolerance) || 0,
    };
    setShiftsList(prev => [...prev, newShift]);
    setShowAddShift(false);
    setNewShiftName('');
    setNewShiftStart('');
    setNewShiftEnd('');
    setNewShiftBreak('30');
    setNewShiftTolerance('5');
    toast.success(`Turno "${newShift.name}" creado`);
  };

  const deleteShift = (id: string) => {
    const name = shiftsList.find(s => s.id === id)?.name;
    setShiftsList(prev => prev.filter(s => s.id !== id));
    toast.success(`Turno "${name}" eliminado`);
  };

  const downloadConsentPDF = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) { toast.error('Permite ventanas emergentes'); return; }
    printWin.document.write(`<!DOCTYPE html><html><head><title>Consentimiento ClockIn</title><style>body{font-family:system-ui;padding:60px;max-width:600px;margin:auto}h1{font-size:18px}p{line-height:1.6;font-size:14px}.sig{margin-top:80px;border-top:1px solid #333;width:250px;padding-top:8px;font-size:12px;color:#666}</style></head><body><h1>📋 Consentimiento de Registro de Jornada</h1><p><strong>${companyName}</strong> — CIF: ${cif}</p><p>${consentText}</p><p style="margin-top:40px">Fecha: _______________</p><div class="sig">Firma del empleado</div><div class="sig" style="margin-top:40px">Firma de la empresa</div><script>window.print()</script></body></html>`);
    toast.success('PDF de consentimiento generado');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Configuración</h2>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shifts">Turnos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="bg-background rounded-card border p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Nombre de la empresa</label><Input value={companyName} onChange={e => setCompanyName(e.target.value)} /></div>
            <div><label className="text-sm font-medium">CIF</label><Input value={cif} onChange={e => setCif(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Zona horaria</label>
              <Select value={timezone} onValueChange={setTimezone}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="europe_madrid">Europe/Madrid</SelectItem><SelectItem value="atlantic_canary">Atlantic/Canary</SelectItem></SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Formato hora</label>
              <Select value={timeFormat} onValueChange={setTimeFormat}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="24h">24 horas</SelectItem><SelectItem value="12h">12 horas</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => toast.success('Configuración guardada')}>Guardar</Button>
        </TabsContent>

        <TabsContent value="shifts" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Turnos configurados</h3>
          <div className="space-y-3">
            {shiftsList.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.startTime ? `${s.startTime} - ${s.endTime} (${s.breakMinutes}min pausa, ${s.lateToleranceMinutes}min tolerancia)` : 'Sin hora fija'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => deleteShift(s.id)}>
                  <Trash2 className="w-3 h-3" />Eliminar
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowAddShift(true)}><Plus className="w-4 h-4" />Nuevo turno</Button>
        </TabsContent>

        <TabsContent value="alerts" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Configuración de alertas</h3>
          {[
            { label: 'Fichaje fuera de zona', checked: alertOutZone, onChange: setAlertOutZone },
            { label: 'Retardo', checked: alertLate, onChange: setAlertLate, sub: 'Tolerancia configurable por turno' },
            { label: 'Ausencia (no fichó en todo el día)', checked: alertAbsent, onChange: setAlertAbsent },
            { label: 'Horas extra (supera 9h)', checked: alertOvertime, onChange: setAlertOvertime },
          ].map(a => (
            <div key={a.label} className="flex items-center justify-between py-2 border-b">
              <div><p className="text-sm font-medium">{a.label}</p>{a.sub && <p className="text-xs text-muted-foreground">{a.sub}</p>}</div>
              <Switch checked={a.checked} onCheckedChange={a.onChange} />
            </div>
          ))}
          <div className="flex items-center justify-between py-2 border-b">
            <div><p className="text-sm font-medium">Email al admin por cada alerta</p></div>
            <Switch checked={alertEmail} onCheckedChange={setAlertEmail} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium">Resumen diario por email (18:00)</p></div>
            <Switch checked={alertDaily} onCheckedChange={setAlertDaily} />
          </div>
          <Button onClick={() => toast.success('Alertas configuradas')}>Guardar</Button>
        </TabsContent>

        <TabsContent value="security" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Seguridad del fichaje</h3>
          <div className="flex items-center justify-between py-2 border-b">
            <p className="text-sm font-medium">Requerir GPS para fichar</p>
            <Switch checked={requireGps} onCheckedChange={setRequireGps} />
          </div>
          <div className="py-2 border-b">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Tiempo de pulsación larga</p>
              <span className="text-sm font-bold tabular-nums">{pressTime[0]}s</span>
            </div>
            <Slider value={pressTime} onValueChange={setPressTime} min={1} max={3} step={0.5} />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <p className="text-sm font-medium">Vibración al fichar</p>
            <Switch checked={vibration} onCheckedChange={setVibration} />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <p className="text-sm font-medium">Sonido al fichar</p>
            <Switch checked={sound} onCheckedChange={setSound} />
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-medium">Expiración del PIN</p>
            <Select value={pinExpiry} onValueChange={setPinExpiry}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Nunca</SelectItem>
                <SelectItem value="30">30 días</SelectItem>
                <SelectItem value="90">90 días</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => toast.success('Configuración de seguridad guardada')}>Guardar</Button>
        </TabsContent>

        <TabsContent value="billing" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Facturación</h3>
          <div className="bg-secondary rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Badge>{(user?.plan || 'starter').toUpperCase()}</Badge>
              <span className="text-2xl font-bold">
                €{user?.plan === 'enterprise' ? 59 : user?.plan === 'business' ? 29 : 0}
                <span className="text-sm font-normal text-muted-foreground">/mes</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {user?.plan === 'enterprise' ? 'Hasta 100' : user?.plan === 'business' ? 'Hasta 25' : 'Hasta 5'} empleados · 22 en uso
            </p>
          </div>
          <h4 className="font-medium text-sm mt-2">Cambiar plan</h4>
          <div className="grid sm:grid-cols-3 gap-3">
            {([
              { key: 'starter' as PlanType, name: 'Starter', price: 0, desc: 'Hasta 5 empleados' },
              { key: 'business' as PlanType, name: 'Business', price: 29, desc: 'Hasta 25 empleados' },
              { key: 'enterprise' as PlanType, name: 'Enterprise', price: 59, desc: 'Hasta 100 empleados' },
            ]).map(plan => (
              <button
                key={plan.key}
                onClick={() => {
                  updatePlan(plan.key);
                  toast.success(`Plan cambiado a ${plan.name}`);
                }}
                className={`rounded-lg border p-4 text-left transition-colors ${user?.plan === plan.key ? 'border-foreground bg-secondary' : 'hover:bg-secondary/50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{plan.name}</span>
                  {user?.plan === plan.key && <Check className="w-4 h-4" />}
                </div>
                <p className="text-lg font-bold">€{plan.price}<span className="text-xs font-normal text-muted-foreground">/mes</span></p>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </button>
            ))}
          </div>
          <h4 className="font-medium text-sm mt-4">Historial de facturas</h4>
          {['Marzo 2025 — €29.00 — Pagada', 'Febrero 2025 — €29.00 — Pagada', 'Enero 2025 — €29.00 — Pagada'].map(f => (
            <div key={f} className="flex justify-between text-sm py-1.5 border-b">
              <span>{f}</span><Button variant="ghost" size="sm" onClick={() => {
                const printWin = window.open('', '_blank');
                if (!printWin) return;
                printWin.document.write(`<!DOCTYPE html><html><head><title>Factura</title><style>body{font-family:system-ui;padding:60px;max-width:500px;margin:auto}h1{font-size:16px}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}.total{font-weight:bold;font-size:15px;margin-top:12px}</style></head><body><h1>🧾 Factura — ClockIn</h1><p>${companyName} · ${cif}</p><div class="row"><span>${f.split(' — ')[0]}</span><span>${f.split(' — ')[1]}</span></div><p class="total">Total: ${f.split(' — ')[1]}</p><script>window.print()</script></body></html>`);
              }}>PDF</Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="legal" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Texto de consentimiento</h3>
          <Textarea rows={4} value={consentText} onChange={e => setConsentText(e.target.value)} />
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-medium">Requerir aceptación en primer acceso</p>
            <Switch checked={requireConsent} onCheckedChange={setRequireConsent} />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => toast.success('Texto guardado')}>Guardar</Button>
            <Button variant="outline" onClick={downloadConsentPDF}>Descargar plantilla PDF</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Shift Dialog */}
      <Dialog open={showAddShift} onOpenChange={setShowAddShift}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo turno</DialogTitle></DialogHeader>
          <form onSubmit={handleAddShift} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre *</label><Input value={newShiftName} onChange={e => setNewShiftName(e.target.value)} required placeholder="Ej: Noche" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Hora inicio</label><Input type="time" value={newShiftStart} onChange={e => setNewShiftStart(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Hora fin</label><Input type="time" value={newShiftEnd} onChange={e => setNewShiftEnd(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Pausa (min)</label><Input type="number" value={newShiftBreak} onChange={e => setNewShiftBreak(e.target.value)} /></div>
              <div><label className="text-sm font-medium">Tolerancia (min)</label><Input type="number" value={newShiftTolerance} onChange={e => setNewShiftTolerance(e.target.value)} /></div>
            </div>
            <Button type="submit" className="w-full">Guardar turno</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
