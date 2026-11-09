import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PageHeader, Panel, DialogHead, DialogActions, Field, inputCls, textareaCls } from '@/components/admin/kit';
import { useDataStore } from '@/store/dataStore';
import { toast } from 'sonner';
import { useAuth, PlanType } from '@/store/AuthContext';
import { Clock, Plus, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, updatePlan } = useAuth();
  const { settings, updateSettings, shifts, addShift, deleteShift } = useDataStore();

  const [showAddShift, setShowAddShift] = useState(false);
  const [newShiftName, setNewShiftName] = useState('');
  const [newShiftStart, setNewShiftStart] = useState('');
  const [newShiftEnd, setNewShiftEnd] = useState('');
  const [newShiftBreak, setNewShiftBreak] = useState('30');
  const [newShiftTolerance, setNewShiftTolerance] = useState('5');

  const toMin = (v: string) => { const [h, mm] = v.split(':').map(Number); return h * 60 + mm; };
  const hasTimes = Boolean(newShiftStart && newShiftEnd);
  const sMin = hasTimes ? toMin(newShiftStart) : 0;
  const eMin = hasTimes ? toMin(newShiftEnd) : 0;
  const dur = hasTimes ? (eMin - sMin + 1440) % 1440 : 0;
  const eff = Math.max(0, dur - (Number(newShiftBreak) || 0));
  const lateM = (sMin + (Number(newShiftTolerance) || 0)) % 1440;
  const lateTime = `${String(Math.floor(lateM / 60)).padStart(2, '0')}:${String(lateM % 60).padStart(2, '0')}`;
  const hrs = (m: number) => (m / 60).toLocaleString('es-ES', { maximumFractionDigits: 2 });
  const segs = !hasTimes || dur === 0 ? [] : eMin > sMin ? [{ a: sMin, b: eMin }] : [{ a: sMin, b: 1440 }, { a: 0, b: eMin }];

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
      <PageHeader title="Configuración" subtitle="Los cambios se guardan solos" />
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-6 h-auto w-fit max-w-full flex-wrap justify-start gap-1 rounded-[24px] bg-secondary p-1 sm:rounded-full">
          <TabsTrigger className="h-9 rounded-full px-4 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none" value="general">General</TabsTrigger>
          <TabsTrigger className="h-9 rounded-full px-4 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none" value="shifts">Turnos</TabsTrigger>
          <TabsTrigger className="h-9 rounded-full px-4 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none" value="alerts">Avisos</TabsTrigger>
          <TabsTrigger className="h-9 rounded-full px-4 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none" value="security">Seguridad</TabsTrigger>
          <TabsTrigger className="h-9 rounded-full px-4 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none" value="billing">Plan</TabsTrigger>
          <TabsTrigger className="h-9 rounded-full px-4 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none" value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-0 max-w-[880px] rounded-[24px] border bg-background p-5 sm:p-7 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold mb-1.5">Nombre de la empresa</label><Input className={inputCls} value={settings.companyName} onChange={e => updateSettings({ companyName: e.target.value })} /></div>
            <div><label className="block text-sm font-semibold mb-1.5">CIF</label><Input className={inputCls} value={settings.cif} onChange={e => updateSettings({ cif: e.target.value })} /></div>
            <div><label className="block text-sm font-semibold mb-1.5">Zona horaria</label>
              <select className={inputCls} value={settings.timezone} onChange={e => updateSettings({ timezone: e.target.value })}>
                <option value="europe_madrid">Europe/Madrid</option><option value="atlantic_canary">Atlantic/Canary</option>
              </select>
            </div>
            <div><label className="block text-sm font-semibold mb-1.5">Formato hora</label>
              <select className={inputCls} value={settings.timeFormat} onChange={e => updateSettings({ timeFormat: e.target.value as '24h' | '12h' })}>
                <option value="24h">24 horas</option><option value="12h">12 horas</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Los cambios se guardan automáticamente.</p>
        </TabsContent>

        <TabsContent value="shifts" className="mt-0 max-w-[880px] rounded-[24px] border bg-background p-5 sm:p-7 space-y-5">
          <h3 className="text-lg font-semibold">Turnos configurados</h3>
          <div className="space-y-3">
            {shifts.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="text-[15px] font-semibold">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.startTime ? `${s.startTime} a ${s.endTime} · ${s.breakMinutes} min de pausa · ${s.lateToleranceMinutes} min de margen` : 'Sin hora fija'}
                  </p>
                </div>
                <Button variant="outline" size="icon" aria-label={`Eliminar turno ${s.name}`} className="h-10 w-10 shrink-0 rounded-full border-border text-muted-foreground hover:text-destructive" onClick={() => { deleteShift(s.id); toast.success(`Turno "${s.name}" eliminado`); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" className="h-11 gap-2" onClick={() => setShowAddShift(true)}><Plus className="w-4 h-4" strokeWidth={1.5} />Nuevo turno</Button>
        </TabsContent>

        <TabsContent value="alerts" className="mt-0 max-w-[880px] rounded-[24px] border bg-background p-5 sm:p-7 space-y-5">
          <h3 className="text-lg font-semibold">Configuración de alertas</h3>
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

        <TabsContent value="security" className="mt-0 max-w-[880px] rounded-[24px] border bg-background p-5 sm:p-7 space-y-5">
          <h3 className="text-lg font-semibold">Seguridad del fichaje</h3>
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

        <TabsContent value="billing" className="mt-0 max-w-[880px] rounded-[24px] border bg-background p-5 sm:p-7 space-y-5">
          <h3 className="text-lg font-semibold">Tu plan</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {([
              { key: 'starter' as PlanType, name: 'Starter', price: 0, desc: 'Hasta 5 empleados, 1 zona' },
              { key: 'business' as PlanType, name: 'Business', price: 29, desc: 'Hasta 25 empleados, 10 zonas' },
              { key: 'enterprise' as PlanType, name: 'Enterprise', price: 59, desc: 'Hasta 100 empleados, ilimitado' },
            ]).map(plan => {
              const current = (user?.plan || 'starter') === plan.key;
              return (
                <div key={plan.key} className={`flex flex-col rounded-[20px] border p-5 ${current ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}`}>
                  <div className="flex min-h-7 flex-wrap items-center justify-between gap-2">
                    <h4 className="text-base font-semibold">{plan.name}</h4>
                    {current && <span className="rounded-full bg-brand-tint px-2.5 py-1 text-[10px] font-bold text-brand-ink">TU PLAN</span>}
                  </div>
                  <p className="mt-4 font-display font-extrabold text-[32px] tabular-nums">{plan.price} €<span className="text-sm font-normal opacity-70"> /mes</span></p>
                  <p className={`mt-1 flex-1 text-[13px] ${current ? 'text-subtle' : 'text-muted-foreground'}`}>{plan.desc}</p>
                  {!current && (
                    <Button variant="outline" className="mt-5 h-11 w-full" onClick={() => { updatePlan(plan.key); toast.success(`Plan cambiado a ${plan.name}`); }}>Cambiar a {plan.name}</Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="legal" className="mt-0 max-w-[880px] rounded-[24px] border bg-background p-5 sm:p-7 space-y-5">
          <h3 className="text-lg font-semibold">Texto de consentimiento RGPD</h3>
          <Textarea className={textareaCls} rows={5} value={settings.consentText} onChange={e => updateSettings({ consentText: e.target.value })} />
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-medium">Requerir aceptación en primer fichaje</p>
            <Switch checked={settings.requireConsent} onCheckedChange={v => updateSettings({ requireConsent: v })} />
          </div>
          <Button variant="outline" className="h-11" onClick={downloadConsentPDF}>Descargar plantilla PDF</Button>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddShift} onOpenChange={setShowAddShift}>
        <DialogContent>
          <DialogHead icon={Clock} tint="blue" title="Nuevo turno" />
          <form onSubmit={handleAddShift} className="min-w-0 space-y-5">
            <Field label="Nombre"><input className={inputCls} value={newShiftName} onChange={e => setNewShiftName(e.target.value)} required placeholder="Ej.: Noche" /></Field>
            <div className="grid min-w-0 grid-cols-2 gap-4">
              <Field label="Hora inicio"><input className={`${inputCls} min-w-0`} type="time" value={newShiftStart} onChange={e => setNewShiftStart(e.target.value)} /></Field>
              <Field label="Hora fin"><input className={`${inputCls} min-w-0`} type="time" value={newShiftEnd} onChange={e => setNewShiftEnd(e.target.value)} /></Field>
              <Field label="Pausa (min)"><input className={inputCls} type="number" min={0} value={newShiftBreak} onChange={e => setNewShiftBreak(e.target.value)} /></Field>
              <Field label="Margen de llegada (min)"><input className={inputCls} type="number" min={0} value={newShiftTolerance} onChange={e => setNewShiftTolerance(e.target.value)} /></Field>
            </div>
            <div className="space-y-2">
              <div className="relative h-3 overflow-hidden rounded-full bg-secondary" role="img" aria-label="Tramo del turno en 24 horas">
                {segs.map(g => <span key={g.a} className="absolute inset-y-0 bg-brand" style={{ left: `${(g.a / 1440) * 100}%`, width: `${((g.b - g.a) / 1440) * 100}%` }} />)}
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
                {['00:00', '06:00', '12:00', '18:00', '24:00'].map(t => <span key={t}>{t}</span>)}
              </div>
              <p className="text-[13px] text-muted-foreground" aria-live="polite">
                {hasTimes ? `${hrs(dur)} h de jornada, ${hrs(eff)} efectivas. Retraso a partir de las ${lateTime}.` : 'Elige la hora de inicio y de fin para ver la jornada.'}
              </p>
            </div>
            <DialogActions>
              <Button type="button" variant="outline" className="h-11 border-border" onClick={() => setShowAddShift(false)}>Cancelar</Button>
              <Button type="submit" className="h-11">Guardar turno</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
