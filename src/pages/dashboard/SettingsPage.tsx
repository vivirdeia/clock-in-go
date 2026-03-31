import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { shifts } from '@/data/mockData';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [pressTime, setPressTime] = useState([2]);

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
            <div><label className="text-sm font-medium">Nombre de la empresa</label><Input defaultValue="TechCorp SL" /></div>
            <div><label className="text-sm font-medium">CIF</label><Input defaultValue="B12345678" /></div>
            <div><label className="text-sm font-medium">Zona horaria</label>
              <Select defaultValue="europe_madrid"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="europe_madrid">Europe/Madrid</SelectItem></SelectContent>
              </Select>
            </div>
            <div><label className="text-sm font-medium">Formato hora</label>
              <Select defaultValue="24h"><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="24h">24 horas</SelectItem><SelectItem value="12h">12 horas</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={() => toast.success('Configuración guardada')}>Guardar</Button>
        </TabsContent>

        <TabsContent value="shifts" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Turnos configurados</h3>
          <div className="space-y-3">
            {shifts.map(s => (
              <div key={s.id} className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.startTime ? `${s.startTime} - ${s.endTime} (${s.breakMinutes}min pausa, ${s.lateToleranceMinutes}min tolerancia)` : 'Sin hora fija'}
                  </p>
                </div>
                <Button variant="ghost" size="sm">Editar</Button>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => toast.info('Funcionalidad disponible con Lovable Cloud')}>+ Nuevo turno</Button>
        </TabsContent>

        <TabsContent value="alerts" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Configuración de alertas</h3>
          {[
            { label: 'Fichaje fuera de zona', default: true },
            { label: 'Retardo', default: true, sub: 'Tolerancia configurable por turno' },
            { label: 'Ausencia (no fichó en todo el día)', default: true },
            { label: 'Horas extra (supera 9h)', default: true },
          ].map(a => (
            <div key={a.label} className="flex items-center justify-between py-2 border-b">
              <div><p className="text-sm font-medium">{a.label}</p>{a.sub && <p className="text-xs text-muted-foreground">{a.sub}</p>}</div>
              <Switch defaultChecked={a.default} />
            </div>
          ))}
          <div className="flex items-center justify-between py-2 border-b">
            <div><p className="text-sm font-medium">Email al admin por cada alerta</p></div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <div><p className="text-sm font-medium">Resumen diario por email (18:00)</p></div>
            <Switch />
          </div>
          <Button onClick={() => toast.success('Alertas configuradas')}>Guardar</Button>
        </TabsContent>

        <TabsContent value="security" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Seguridad del fichaje</h3>
          <div className="flex items-center justify-between py-2 border-b">
            <p className="text-sm font-medium">Requerir GPS para fichar</p>
            <Switch defaultChecked />
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
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <p className="text-sm font-medium">Sonido al fichar</p>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-medium">Expiración del PIN</p>
            <Select defaultValue="never"><SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
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
              <Badge>BUSINESS</Badge>
              <span className="text-2xl font-bold">€29<span className="text-sm font-normal text-muted-foreground">/mes</span></span>
            </div>
            <p className="text-sm text-muted-foreground">Hasta 25 empleados · 22 en uso</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Próxima factura</span><span>1 abril 2025 — €29.00</span></div>
            <div className="flex justify-between py-2 border-b"><span className="text-muted-foreground">Método de pago</span><span>Visa ****4242</span></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('Conecta Stripe para gestionar tu suscripción')}>Cambiar plan</Button>
            <Button variant="ghost" className="text-destructive" onClick={() => toast.info('Conecta Stripe para cancelar')}>Cancelar</Button>
          </div>
          <h4 className="font-medium text-sm mt-4">Historial de facturas</h4>
          {['Marzo 2025 — €29.00 — Pagada', 'Febrero 2025 — €29.00 — Pagada', 'Enero 2025 — €29.00 — Pagada'].map(f => (
            <div key={f} className="flex justify-between text-sm py-1.5 border-b">
              <span>{f}</span><Button variant="ghost" size="sm">PDF</Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="legal" className="bg-background rounded-card border p-6 space-y-4">
          <h3 className="font-bold">Texto de consentimiento</h3>
          <Textarea rows={4} defaultValue="Al utilizar ClockIn, consiento que se registre la hora y ubicación GPS de mis fichajes con el fin de control horario según el RD-ley 8/2019. La ubicación se captura exclusivamente en el momento del fichaje y no se realiza seguimiento continuo." />
          <div className="flex items-center justify-between py-2">
            <p className="text-sm font-medium">Requerir aceptación en primer acceso</p>
            <Switch defaultChecked />
          </div>
          <div className="flex gap-2">
            <Button onClick={() => toast.success('Texto guardado')}>Guardar</Button>
            <Button variant="outline" onClick={() => toast.success('Plantilla descargada')}>Descargar plantilla PDF</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
