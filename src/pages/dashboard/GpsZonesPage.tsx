import { useEffect, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDataStore } from '@/store/dataStore';
import { useAuth } from '@/store/AuthContext';
import { PLAN_LIMITS, type Zone } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { PageHeader, DialogHead, DialogActions, Field, inputCls, EmptyState, PlanLimitDialog } from '@/components/admin/kit';
import StreetMap from '@/components/brand/StreetMap';
import StatusPill from '@/components/brand/StatusPill';
import { Plus, MapPin, Trash2, Crosshair, Pencil } from 'lucide-react';
import { toast } from 'sonner';

function MapMarker({ radius }: { radius: number }) {
  const diameter = Math.max(60, Math.min(180, radius * 0.6));
  return <><div aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand bg-brand/15" style={{ width: diameter, height: diameter }} /><div aria-hidden="true" className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-background bg-brand text-primary-foreground shadow-elevated"><MapPin className="h-5 w-5" /></div></>;
}

export default function GpsZonesPage() {
  const { user } = useAuth();
  const { zones, departments, addZone, updateZone, deleteZone } = useDataStore();
  const limit = PLAN_LIMITS[user?.plan || 'starter'].zones;
  const atLimit = zones.length >= limit;
  const [params, setParams] = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [radius, setRadius] = useState([150]);
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [active, setActive] = useState(true);
  const [assignedTo, setAssignedTo] = useState<string[]>(['all']);
  const [showDepartments, setShowDepartments] = useState(false);
  const captureLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocalización no disponible'); return; }
    toast.info('Capturando ubicación…');
    navigator.geolocation.getCurrentPosition(pos => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); toast.success('Ubicación capturada'); }, () => toast.error('No se pudo obtener la ubicación'), { enableHighAccuracy: true, timeout: 10000 });
  };
  const openNew = (locate = false) => {
    if (atLimit) { setShowLimit(true); return; }
    setEditingId(null); setName(''); setAddress(''); setRadius([150]); setLat(''); setLng(''); setActive(true); setAssignedTo(['all']); setShowDepartments(false); setShowForm(true);
    if (locate) captureLocation();
  };
  useEffect(() => {
    if (params.get('new') !== '1') return;
    openNew(); const next = new URLSearchParams(params); next.delete('new'); setParams(next, { replace: true });
  }, [params, setParams]);
  const edit = (zone: Zone) => {
    setEditingId(zone.id); setName(zone.name); setAddress(zone.address); setRadius([zone.radiusMeters]); setLat(String(zone.lat)); setLng(String(zone.lng)); setActive(zone.active); setAssignedTo(zone.assignedTo.length ? zone.assignedTo : ['all']); setShowDepartments(false); setShowForm(true);
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    if (!editingId && atLimit) { setShowForm(false); setShowLimit(true); return; }
    const latitude = Number(lat), longitude = Number(lng);
    if (!lat.trim() || !lng.trim()) { toast.error('Falta lat/lng. Usa "Mi ubicación".'); return; }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) { toast.error('Introduce unas coordenadas válidas'); return; }
    const values = { name, address, lat: latitude, lng: longitude, radiusMeters: radius[0], assignedTo, active };
    if (editingId) { updateZone(editingId, values); toast.success('Zona actualizada'); }
    else { const zone = addZone(values); toast.success(`Zona "${zone.name}" creada`); }
    setShowForm(false);
  };
  const toggleZone = (zone: Zone) => { updateZone(zone.id, { active: !zone.active }); toast.success(`Zona "${zone.name}" ${zone.active ? 'desactivada' : 'activada'}`); };
  const handleDelete = (zone: Zone) => { deleteZone(zone.id); toast.success(`Zona "${zone.name}" eliminada`); };
  const toggleDepartment = (id: string) => {
    setAssignedTo(previous => {
      const next = previous.filter(value => value !== 'all');
      const result = next.includes(id) ? next.filter(value => value !== id) : [...next, id];
      return result.length ? result : ['all'];
    });
  };
  const focuses = [[330, 290], [600, 210], [780, 450]];
  const chipCls = 'rounded-full border px-3 py-2 text-xs font-medium';
  return <div className="space-y-6">
    <PageHeader title="Zonas de fichaje" subtitle={`Si alguien ficha fuera de estas zonas, te llega un aviso al momento. Usas ${zones.length} de ${limit === Infinity ? 'ilimitadas' : limit}.`} actions={<Button className="h-11 gap-2" onClick={() => openNew()}><Plus className="h-4 w-4" />Nueva zona</Button>} />
    {!zones.length && <EmptyState icon={MapPin} tint="green" title="Sin zonas de fichaje" text="Marca en el mapa dónde puede fichar tu equipo." action={<Button onClick={() => openNew()}>Crear zona</Button>} />}
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(340px,100%),1fr))] gap-5">
      {zones.map((zone, index) => <div key={zone.id} className="min-w-0 overflow-hidden rounded-[24px] border bg-background">
        <StreetMap focusX={focuses[index % 3][0]} focusY={focuses[index % 3][1]} className="h-[200px]"><MapMarker radius={zone.radiusMeters} /><span className="absolute bottom-4 left-4 rounded-full bg-background px-3 py-1.5 text-xs font-medium shadow-sm">Radio {zone.radiusMeters} m</span></StreetMap>
        <div className="space-y-3 p-5"><div className="flex items-center justify-between gap-3"><h2 className="min-w-0 break-words text-[18px] font-semibold">{zone.name}</h2><Switch aria-label={`Activar ${zone.name}`} checked={zone.active} onCheckedChange={() => toggleZone(zone)} /></div><p className="text-sm text-muted-foreground">{zone.address}</p>
          <div className="flex flex-wrap items-center gap-2"><span className="max-w-full break-words rounded-full border px-3 py-1 text-xs">{zone.assignedTo.includes('all') ? 'Todo el equipo' : zone.assignedTo.map(id => departments.find(d => d.id === id)?.name).filter(Boolean).join(', ')}</span><StatusPill variant={zone.active ? 'in' : 'out'}>{zone.active ? 'Activa' : 'Pausada'}</StatusPill></div>
          <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => edit(zone)}><Pencil className="mr-1.5 h-3.5 w-3.5" />Editar</Button><Button variant="ghost" size="sm" className="text-danger" onClick={() => handleDelete(zone)}><Trash2 className="mr-1.5 h-3.5 w-3.5" />Eliminar</Button></div>
        </div>
      </div>)}
      <button type="button" onClick={() => openNew(true)} className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-subtle bg-background p-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Crosshair className="h-8 w-8 text-brand" /><span className="font-semibold">Crear zona con mi ubicación</span><span className="text-sm text-muted-foreground">Radio ajustable de 50 a 500 m</span></button>
    </div>
    <Dialog open={showForm} onOpenChange={setShowForm}><DialogContent className="max-h-[90dvh] overflow-y-auto">
      <DialogHead icon={MapPin} tint="blue" title={editingId ? 'Editar zona de fichaje' : 'Nueva zona de fichaje'} />
      <form onSubmit={save} className="space-y-4">
        <StreetMap className="h-[240px] rounded-2xl"><MapMarker radius={radius[0]} /><Button type="button" variant="secondary" className="absolute right-3 top-3 gap-2 bg-background text-xs shadow-sm" onClick={captureLocation}><Crosshair className="h-4 w-4" />Usar mi ubicación</Button></StreetMap>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Nombre"><input className={inputCls} required value={name} onChange={e => setName(e.target.value)} placeholder="Ej.: Oficina central" /></Field><Field label="Dirección"><input className={inputCls} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, ciudad" /></Field></div>
        <div><div className="mb-3 flex items-center justify-between text-sm font-medium"><span id="zone-radius-label">Radio de la zona</span><span className="tabular-nums text-brand">{radius[0]} m</span></div><Slider aria-labelledby="zone-radius-label" value={radius} onValueChange={setRadius} min={50} max={500} step={10} /></div>
        <Field label="Quién puede fichar aquí"><div className="flex flex-wrap gap-2"><button type="button" aria-pressed={assignedTo.includes('all')} className={`${chipCls} ${assignedTo.includes('all') ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'}`} onClick={() => setAssignedTo(['all'])}>Todo el equipo</button>{departments.filter(d => assignedTo.includes(d.id)).map(d => <button type="button" key={d.id} aria-pressed="true" className={`${chipCls} border-primary bg-primary text-primary-foreground`} onClick={() => toggleDepartment(d.id)}>{d.name}</button>)}<button type="button" aria-expanded={showDepartments} className={`${chipCls} border-dashed border-subtle`} onClick={() => setShowDepartments(!showDepartments)}>+ Añadir</button></div>
          {showDepartments && <div className="mt-2 flex flex-wrap gap-2 rounded-xl border bg-panel p-3">{departments.filter(d => !assignedTo.includes(d.id)).map(d => <button type="button" key={d.id} className={`${chipCls} bg-background`} onClick={() => toggleDepartment(d.id)}>{d.name}</button>)}{departments.every(d => assignedTo.includes(d.id)) && <p className="text-xs text-muted-foreground">No hay más departamentos disponibles.</p>}</div>}
        </Field>
        <details className="rounded-xl border p-3"><summary className="cursor-pointer text-sm font-medium">Coordenadas</summary><div className="mt-3 grid grid-cols-2 gap-3"><Field label="Latitud"><input className={inputCls} inputMode="decimal" value={lat} onChange={e => setLat(e.target.value)} placeholder="40.4168" /></Field><Field label="Longitud"><input className={inputCls} inputMode="decimal" value={lng} onChange={e => setLng(e.target.value)} placeholder="-3.7038" /></Field></div></details>
        <div className="flex items-center justify-between"><span className="text-sm font-medium">Activa</span><Switch aria-label="Zona activa" checked={active} onCheckedChange={setActive} /></div>
        <DialogActions><Button type="button" variant="outline" className="border-border" onClick={() => setShowForm(false)}>Cancelar</Button><Button type="submit">Guardar zona</Button></DialogActions>
      </form>
    </DialogContent></Dialog>
    <PlanLimitDialog open={showLimit} onOpenChange={setShowLimit} kind="zones" used={zones.length} />
  </div>;
}
