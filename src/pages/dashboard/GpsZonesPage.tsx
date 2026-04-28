import { useState, useRef } from 'react';
import { useDataStore } from '@/store/dataStore';
import { useAuth } from '@/store/AuthContext';
import { PLAN_LIMITS } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus, MapPin, Trash2, Crosshair } from 'lucide-react';
import { toast } from 'sonner';

export default function GpsZonesPage() {
  const { user } = useAuth();
  const { zones, departments, addZone, updateZone, deleteZone } = useDataStore();
  const limit = PLAN_LIMITS[user?.plan || 'starter'].zones;
  const atLimit = zones.length >= limit;

  const [showAdd, setShowAdd] = useState(false);
  const [radius, setRadius] = useState([150]);
  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [newActive, setNewActive] = useState(true);

  const captureLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocalización no disponible'); return; }
    toast.info('Capturando ubicación…');
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); toast.success('Ubicación capturada'); },
      () => toast.error('No se pudo obtener la ubicación'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (atLimit) { toast.error(`Tu plan permite hasta ${limit} zonas. Mejora tu plan.`); return; }
    if (!lat || !lng) { toast.error('Falta lat/lng. Usa "Mi ubicación".'); return; }
    const newZone = addZone({
      name: nameRef.current?.value || '',
      address: addressRef.current?.value || '',
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radiusMeters: radius[0],
      assignedTo: ['all'],
      active: newActive,
    });
    setShowAdd(false); setRadius([150]); setNewActive(true); setLat(''); setLng('');
    toast.success(`Zona "${newZone.name}" creada`);
  };

  const toggleZone = (id: string) => {
    const z = zones.find(z => z.id === id);
    if (!z) return;
    updateZone(id, { active: !z.active });
    toast.success(`Zona "${z.name}" ${z.active ? 'desactivada' : 'activada'}`);
  };

  const handleDelete = (id: string) => {
    const name = zones.find(z => z.id === id)?.name;
    deleteZone(id);
    toast.success(`Zona "${name}" eliminada`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Zonas de fichaje válidas</h2>
        <p className="text-muted-foreground text-sm mt-1">Los fichajes fuera de estas zonas generan una alerta automática. {zones.length} de {limit === Infinity ? '∞' : limit}.</p>
      </div>
      <Button className="gap-2" onClick={() => setShowAdd(true)} disabled={atLimit}><Plus className="w-4 h-4" strokeWidth={1.5} />Nueva zona</Button>

      {zones.length === 0 ? (
        <div className="bg-background rounded-card border p-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">Aún no tienes zonas configuradas.</p>
          <Button onClick={() => setShowAdd(true)} className="gap-2"><Plus className="w-4 h-4" />Crear la primera</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {zones.map(z => (
            <div key={z.id} className="bg-background rounded-card border p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" strokeWidth={1.5} />
                  <h3 className="font-semibold">{z.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={z.active} onCheckedChange={() => toggleZone(z.id)} />
                  <Badge variant="outline" className={`text-xs ${z.active ? 'text-success border-success' : ''}`}>{z.active ? 'Activa' : 'Inactiva'}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{z.address}</p>
              <p className="text-sm text-muted-foreground mb-3">Radio: {z.radiusMeters}m</p>
              <p className="text-xs text-muted-foreground mb-3">
                Asignada a: {z.assignedTo.includes('all') ? 'Todos' : z.assignedTo.map(id => departments.find(d => d.id === id)?.name).filter(Boolean).join(', ')}
              </p>
              <div className="bg-secondary rounded-md h-28 flex items-center justify-center text-muted-foreground text-xs">
                {z.lat.toFixed(4)}, {z.lng.toFixed(4)} — radio {z.radiusMeters}m
              </div>
              <Button variant="ghost" size="sm" className="mt-2 text-destructive gap-1" onClick={() => handleDelete(z.id)}>
                <Trash2 className="w-3 h-3" />Eliminar
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva zona</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre *</label><Input ref={nameRef} required placeholder="Ej: Oficina Central" /></div>
            <div><label className="text-sm font-medium">Dirección</label><Input ref={addressRef} placeholder="Calle, ciudad" /></div>
            <Button type="button" variant="outline" className="gap-2 w-full" onClick={captureLocation}>
              <Crosshair className="w-4 h-4" strokeWidth={1.5} />Usar mi ubicación actual
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Latitud</label><Input value={lat} onChange={e => setLat(e.target.value)} placeholder="40.4168" /></div>
              <div><label className="text-sm font-medium">Longitud</label><Input value={lng} onChange={e => setLng(e.target.value)} placeholder="-3.7038" /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Radio: {radius[0]}m</label>
              <Slider value={radius} onValueChange={setRadius} min={50} max={500} step={10} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Activa</label>
              <Switch checked={newActive} onCheckedChange={setNewActive} />
            </div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
