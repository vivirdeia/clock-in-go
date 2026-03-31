import { useState } from 'react';
import { zones, departments } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Plus, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function GpsZonesPage() {
  const [showAdd, setShowAdd] = useState(false);
  const [radius, setRadius] = useState([150]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Zonas de fichaje válidas</h2>
        <p className="text-muted-foreground text-sm mt-1">Los fichajes fuera de estas zonas generan alerta automática.</p>
      </div>
      <Button className="gap-2" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" />Nueva zona</Button>

      <div className="grid sm:grid-cols-2 gap-4">
        {zones.map(z => (
          <div key={z.id} className="bg-background rounded-card border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <h3 className="font-bold">{z.name}</h3>
              </div>
              <Badge variant={z.active ? 'outline' : 'secondary'} className={`text-xs ${z.active ? 'text-success border-success' : ''}`}>
                {z.active ? 'Activa' : 'Inactiva'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{z.address}</p>
            <p className="text-sm text-muted-foreground mb-3">Radio: {z.radiusMeters}m</p>
            <p className="text-xs text-muted-foreground mb-3">
              Asignada a: {z.assignedTo.includes('all') ? 'Todos' : z.assignedTo.map(id => departments.find(d => d.id === id)?.name).filter(Boolean).join(', ')}
            </p>
            <div className="bg-secondary rounded-lg h-28 flex items-center justify-center text-muted-foreground text-xs">
              🗺️ {z.lat.toFixed(4)}, {z.lng.toFixed(4)} — radio {z.radiusMeters}m
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva zona</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); toast.success('Zona creada'); setShowAdd(false); }} className="space-y-4">
            <div><label className="text-sm font-medium">Nombre *</label><Input required placeholder="Ej: Oficina Central" /></div>
            <div><label className="text-sm font-medium">Dirección</label><Input placeholder="Calle, ciudad" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium">Latitud</label><Input type="number" step="any" placeholder="40.4168" /></div>
              <div><label className="text-sm font-medium">Longitud</label><Input type="number" step="any" placeholder="-3.7038" /></div>
            </div>
            <div>
              <label className="text-sm font-medium">Radio: {radius[0]}m</label>
              <Slider value={radius} onValueChange={setRadius} min={50} max={500} step={10} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Activa</label>
              <Switch defaultChecked />
            </div>
            <div className="bg-secondary rounded-lg h-32 flex items-center justify-center text-muted-foreground text-xs">🗺️ Preview del mapa</div>
            <Button type="submit" className="w-full">Guardar</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
