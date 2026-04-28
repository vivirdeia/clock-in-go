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
import { useDataStore } from '@/store/dataStore';
import { toast } from 'sonner';
import { useAuth, PlanType } from '@/store/AuthContext';
import { Check, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, updatePlan } = useAuth();
  const { settings, updateSettings, shifts, addShift, deleteShift } = useDataStore();

  const [showAddShift, setShowAddShift] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('');
  const [newShiftEnd, setNewShiftEnd] = useState('');
  const [newShiftBreak, setNewShiftBreak] = useState('30');
  const [newShiftTolerance, setNewShiftTolerance] = useState('5');

  const handleAddShift = (e: React.FormEvent) => {
    e.preventDefault();
    const sh = addShift({
      name: newShiftName,
      startTime: newShiftStart,
      endTime: newShiftEnd,
      breakMinutes: parseInt(newShiftBreak) || 0,
      lateToleranceMinutes: parseInt(newShiftTolerance) || 0,
    });
    setShowAddShift(false);
    setNewShiftName(''); setNewShiftStart(''); setNewShiftEnd(''); setNewShiftBreak('30'); setNewShiftTolerance('5');
    toast.success(`Turno "${sh.name}" creado`);
  };

  const downloadConsentPDF = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) { toast.error('Permite ventanas emergentes'); return; }
    printWin.document.write(`<!DOCTYPE html><html><head><title>Consentimiento ClockIn</title><style>body{font-family:Inter,system-ui;padding:60px;max-width:600px;margin:auto}h1{font-size:18px}p{line-height:1.6;font-size:14px}.sig{margin-top:80px;border-top:1px solid #333;width:250px;padding-top:8px;font-size:12px;color:#666}</style></head><body><h1>Consentimiento de Registro de Jornada</h1><p><strong>${settings.companyName}</strong>${settings.cif ? ' — CIF: ' + settings.cif : ''}</p><p>${settings.consentText}</p><p style="margin-top:40px">Fecha: _______________</p><div class="sig">Firma del empleado</div><div class="sig" style="margin-top:40px">Firma de la empresa</div><script>window.print()</script></body></html>`);
    toast.success('PDF de consentimiento generado');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Configuración</h2>
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shifts">Turnos</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
          <TabsTrigger value="billing">Plan</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="bg-background rounded-card border p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Nombre de la empresa</label><Input value={settings.companyName} onChange={e => updateSettings({ companyName: e.target.value })} /></div>
            <div><label className="text-sm font-medium">CIF</label><Input value={settings.cif} onChange={e => updateSettings({ cif: e.target.value })} /></div>
            <div><label className="text-sm font-medium">Zona horaria</label>
              <Select value={settings.timezone} onValueChange={v => updateSettings({ timezone: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="europe_madrid">Europe/Madrid</SelectItem><SelectItem value="atlantic_canary">Atlantic/Canary</SelectItem></SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Formato hora</label>
              <Select value={settings.timeFormat} onValueChange={v => updateSettings({ timeFormat: v as '24h' | '12h' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="24h">24 horas</SelectItem><SelectItem value="12h">12 horas</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Los cambios se guardan automáticamente.</p>
        </TabsContent>

        <TabsContent value="shifts" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-semibold">Turnos configurados</h3>
          <div className="space-y-3">
            {shifts.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.startTime ? `${s.startTime} - ${s.endTime} (${s.breakMinutes}min pausa, ${s.lateToleranceMinutes}min tolerancia)` : 'Sin hora fija'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-destructive gap-1" onClick={() => { deleteShift(s.id); toast.success(`Turno "${s.name}" eliminado`); }}>
                  <Trash2 className="w-3 h-3" />Eliminar
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowAddShift(true)}><Plus className="w-4 h-4" strokeWidth={1.5} />Nuevo turno</Button>
        </TabsContent>

        <TabsContent value="alerts" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-semibold">Configuración de alertas</h3>
          {[
            { label: 'Fichaje fuera de zona', key: 'alertOutZone' as const },
            { label: 'Retardo (según tolerancia del turno)', key: 'alertLate' as const },
            { label: 'Ausencia (no fichó hoy)', key: 'alertAbsent' as const },
            { label: 'Horas extra', key: 'alertOvertime' as const },
          ].map(a => (
            <div key={a.key} className="flex items-center justify-between py-2 border-b">
              <p className="text-sm font-medium">{a.label}</p>
              <Switch checked={settings[a.key]} onCheckedChange={v => updateSettings({ [a.key]: v } as never)} />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="security" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-semibold">Seguridad del fichaje</h3>
          <div className="flex items-center justify-between py-2 border-b">
            <p className="text-sm font-medium">Requerir GPS para fichar</p>
            <Switch checked={settings.requireGps} onCheckedChange={v => updateSettings({ requireGps: v })} />
          </div>
          <div className="py-2 border-b">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Tiempo de pulsación larga</p>
              <span className="text-sm font-medium tabular-nums">{settings.pressTimeSeconds}s</span>
            </div>
            <Slider value={[settings.pressTimeSeconds]} onValueChange={v => updateSettings({ pressTimeSeconds: v[0] })} min={1} max={3} step={0.5} />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <p className="text-sm font-medium">Vibración</p>
            <Switch checked={settings.vibration} onCheckedChange={v => updateSettings({ vibration: v })} />
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-medium">Sonido</p>
            <Switch checked={settings.sound} onCheckedChange={v => updateSettings({ sound: v })} />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-semibold">Tu plan</h3>
          <div className="bg-secondary rounded-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <Badge>{(user?.plan || 'starter').toUpperCase()}</Badge>
              <span className="text-2xl font-semibold">
                €{user?.plan === 'enterprise' ? 59 : user?.plan === 'business' ? 29 : 0}
                <span className="text-sm font-normal text-muted-foreground">/mes</span>
              </span>
            </div>
          </div>
          <h4 className="font-medium text-sm mt-2">Cambiar plan</h4>
          <div className="grid sm:grid-cols-3 gap-3">
            {([
              { key: 'starter' as PlanType, name: 'Starter', price: 0, desc: 'Hasta 5 empleados, 1 zona' },
              { key: 'business' as PlanType, name: 'Business', price: 29, desc: 'Hasta 25 empleados, 10 zonas' },
              { key: 'enterprise' as PlanType, name: 'Enterprise', price: 59, desc: 'Hasta 100 empleados, ilimitado' },
            ]).map(plan => (
              <button key={plan.key} onClick={() => { updatePlan(plan.key); toast.success(`Plan cambiado a ${plan.name}`); }}
                className={`rounded-md border p-4 text-left transition-colors ${user?.plan === plan.key ? 'border-foreground bg-secondary' : 'hover:bg-secondary/50'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{plan.name}</span>
                  {user?.plan === plan.key && <Check className="w-4 h-4" strokeWidth={1.5} />}
                </div>
                <p className="text-lg font-semibold">€{plan.price}<span className="text-xs font-normal text-muted-foreground">/mes</span></p>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="legal" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-semibold">Texto de consentimiento RGPD</h3>
          <Textarea rows={5} value={settings.consentText} onChange={e => updateSettings({ consentText: e.target.value })} />
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-medium">Requerir aceptación en primer fichaje</p>
            <Switch checked={settings.requireConsent} onCheckedChange={v => updateSettings({ requireConsent: v })} />
          </div>
          <Button variant="outline" onClick={downloadConsentPDF}>Descargar plantilla PDF</Button>
        </TabsContent>
      </Tabs>

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
