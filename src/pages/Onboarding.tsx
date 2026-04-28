import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoIcon from '@/components/LogoIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/store/AuthContext';
import { useDataStore } from '@/store/dataStore';
import { Crosshair, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const { addZone, addDepartment, addEmployee, shifts } = useDataStore();
  const [step, setStep] = useState(1);

  // Step 1 — zone
  const [zoneName, setZoneName] = useState('Oficina principal');
  const [zoneAddr, setZoneAddr] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Step 2 — department
  const [deptName, setDeptName] = useState('General');
  const [deptShift, setDeptShift] = useState(shifts[0]?.id || 's1');
  const [createdDeptId, setCreatedDeptId] = useState<string | null>(null);

  // Step 3 — employee
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPin, setEmpPin] = useState(String(Math.floor(1000 + Math.random() * 9000)));
  const [savedPin, setSavedPin] = useState<string | null>(null);

  const captureLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocalización no disponible'); return; }
    toast.info('Capturando ubicación…');
    navigator.geolocation.getCurrentPosition(
      pos => { setLat(pos.coords.latitude.toFixed(6)); setLng(pos.coords.longitude.toFixed(6)); toast.success('Ubicación capturada'); },
      () => toast.error('No se pudo obtener la ubicación'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submitZone = () => {
    if (!lat || !lng) { toast.error('Captura tu ubicación primero'); return; }
    addZone({ name: zoneName, address: zoneAddr, lat: parseFloat(lat), lng: parseFloat(lng), radiusMeters: 150, assignedTo: ['all'], active: true });
    setStep(2);
  };
  const submitDept = () => {
    const d = addDepartment({ name: deptName, managerId: '', description: '', defaultShiftId: deptShift });
    setCreatedDeptId(d.id);
    setStep(3);
  };
  const submitEmp = () => {
    if (!empName || !empEmail) { toast.error('Faltan datos'); return; }
    addEmployee({ name: empName, email: empEmail, phone: '', departmentId: createdDeptId || '', shiftId: deptShift, pin: empPin });
    setSavedPin(empPin);
    setStep(4);
  };
  const finish = () => { completeOnboarding(); navigate('/dashboard'); };

  if (!user) { navigate('/login'); return null; }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6">
      <div className="flex items-center gap-2 font-semibold text-lg mt-8 mb-4">
        <LogoIcon className="w-5 h-5" />CLOCKIN
      </div>
      <p className="text-sm text-muted-foreground mb-8">Configura tu cuenta en 30 segundos</p>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`w-8 h-1 rounded-full ${s <= step ? 'bg-foreground' : 'bg-border'}`} />
        ))}
      </div>

      <div className="w-full max-w-md bg-background border rounded-lg p-6 space-y-4">
        {step === 1 && (
          <>
            <h2 className="text-xl font-semibold">1. Tu primera zona de fichaje</h2>
            <p className="text-sm text-muted-foreground">Define dónde tus empleados pueden fichar válidamente.</p>
            <div><label className="text-sm font-medium">Nombre</label><Input value={zoneName} onChange={e => setZoneName(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Dirección</label><Input value={zoneAddr} onChange={e => setZoneAddr(e.target.value)} placeholder="Calle, ciudad" /></div>
            <Button type="button" variant="outline" className="gap-2 w-full" onClick={captureLocation}>
              <Crosshair className="w-4 h-4" strokeWidth={1.5} />Usar mi ubicación actual
            </Button>
            {lat && lng && <p className="text-xs text-muted-foreground">Lat: {lat} · Lng: {lng}</p>}
            <Button onClick={submitZone} className="w-full">Siguiente</Button>
          </>
        )}
        {step === 2 && (
          <>
            <h2 className="text-xl font-semibold">2. Tu primer departamento</h2>
            <div><label className="text-sm font-medium">Nombre</label><Input value={deptName} onChange={e => setDeptName(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Turno por defecto</label>
              <Select value={deptShift} onValueChange={setDeptShift}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.startTime && `${s.startTime}-${s.endTime}`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={submitDept} className="w-full">Siguiente</Button>
          </>
        )}
        {step === 3 && (
          <>
            <h2 className="text-xl font-semibold">3. Tu primer empleado</h2>
            <div><label className="text-sm font-medium">Nombre completo</label><Input value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Juan García" /></div>
            <div><label className="text-sm font-medium">Email</label><Input type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} placeholder="juan@empresa.es" /></div>
            <div><label className="text-sm font-medium">PIN (4 dígitos)</label>
              <div className="flex gap-2"><Input value={empPin} onChange={e => setEmpPin(e.target.value)} maxLength={4} />
                <Button type="button" variant="outline" size="sm" onClick={() => setEmpPin(String(Math.floor(1000 + Math.random() * 9000)))}>Regenerar</Button>
              </div>
            </div>
            <Button onClick={submitEmp} className="w-full">Crear empleado</Button>
          </>
        )}
        {step === 4 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-success/10 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6 text-success" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold">¡Todo listo!</h2>
            <p className="text-sm text-muted-foreground">Entrega este PIN a tu empleado para que pueda fichar:</p>
            <div className="text-4xl font-semibold tabular-nums tracking-widest bg-secondary rounded-md py-4">{savedPin}</div>
            <p className="text-xs text-muted-foreground">El empleado lo introduce al abrir la app en /clock</p>
            <Button onClick={finish} className="w-full">Ir al dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
