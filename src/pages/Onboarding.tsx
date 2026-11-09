import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Wordmark from "@/components/Wordmark";
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/store/AuthContext';
import { useDataStore } from '@/store/dataStore';
import { Crosshair, Check, MapPin, Building2, UserPlus } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AuthInput, authInputCls } from '@/components/auth/AuthKit';
import { IconTile } from '@/components/admin/kit';
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

  if (!user) return <Navigate to="/login" replace />;

  const genPin = () => setEmpPin(String(Math.floor(1000 + Math.random() * 9000)));
  const next = step === 1 ? submitZone : step === 2 ? submitDept : submitEmp;
  const shiftLabel = (s: typeof shifts[number]) => s.startTime ? `${s.name} · ${s.startTime} a ${s.endTime}` : s.name;
  const title = 'font-display text-[26px] font-extrabold leading-tight tracking-[-0.02em]';

  return (
    <div className="min-h-screen bg-panel px-6 py-8">
      <div className="mx-auto flex max-w-[520px] flex-col items-center">
        <Wordmark size="md" />
        <div className="mt-10 w-full">
          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
            <span className="font-semibold">Paso {step} de 4</span>
            <span className="text-muted-foreground">Configura tu cuenta en 1 minuto</span>
          </div>
          <div className="mb-6 grid grid-cols-4 gap-2" aria-hidden="true">
            {[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 rounded-full ${s <= step ? 'bg-foreground' : 'bg-border'}`} />)}
          </div>

          <div className="space-y-5 rounded-[28px] border border-border bg-background p-6 sm:p-8">
            {step === 1 && (
              <>
                <IconTile icon={MapPin} tint="blue" size={52} className="rounded-2xl" />
                <div><h1 className={title}>Tu primera zona de fichaje</h1><p className="mt-1.5 text-[15px] text-muted-foreground">El lugar desde donde tu equipo ficha. Puedes añadir más después.</p></div>
                <AuthInput label="Nombre" value={zoneName} onChange={e => setZoneName(e.target.value)} />
                <AuthInput label="Dirección" value={zoneAddr} onChange={e => setZoneAddr(e.target.value)} placeholder="Calle, ciudad" />
                <Button type="button" variant="outline" className="h-[52px] w-full gap-2" onClick={captureLocation}>
                  <Crosshair className="h-4 w-4" />Usar mi ubicación actual
                </Button>
                {lat && lng && <p className="text-[13px] text-muted-foreground tabular-nums">Ubicación capturada · {lat}, {lng}</p>}
              </>
            )}
            {step === 2 && (
              <>
                <IconTile icon={Building2} tint="violet" size={52} className="rounded-2xl" />
                <div><h1 className={title}>Tu primer departamento</h1><p className="mt-1.5 text-[15px] text-muted-foreground">Agrupa a tu equipo y asígnale un turno por defecto.</p></div>
                <AuthInput label="Nombre" value={deptName} onChange={e => setDeptName(e.target.value)} />
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Turno por defecto</label>
                  <Select value={deptShift} onValueChange={setDeptShift}>
                    <SelectTrigger className={authInputCls}><SelectValue /></SelectTrigger>
                    <SelectContent>{shifts.map(s => <SelectItem key={s.id} value={s.id}>{shiftLabel(s)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <IconTile icon={UserPlus} tint="green" size={52} className="rounded-2xl" />
                <div><h1 className={title}>Tu primer empleado</h1><p className="mt-1.5 text-[15px] text-muted-foreground">Con su nombre, su email y un PIN de 4 cifras ya puede fichar.</p></div>
                <AuthInput label="Nombre completo" value={empName} onChange={e => setEmpName(e.target.value)} placeholder="Juan García" />
                <AuthInput label="Email" type="email" value={empEmail} onChange={e => setEmpEmail(e.target.value)} placeholder="juan@empresa.es" />
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-secondary p-4">
                  <div>
                    <p className="text-[13px] font-semibold text-muted-foreground">PIN para fichar</p>
                    <p className="font-display text-[30px] font-extrabold tabular-nums tracking-[.3em]">{empPin}</p>
                  </div>
                  <Button type="button" variant="outline" className="h-11" onClick={genPin}>Generar otro</Button>
                </div>
              </>
            )}
            {step === 4 && (
              <div className="space-y-4 py-2 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success text-primary-foreground"><Check className="h-8 w-8" /></div>
                <h1 className={title}>¡Todo listo!</h1>
                <p className="text-[15px] text-muted-foreground">Entrega este PIN a tu empleado para que pueda fichar:</p>
                <div className="rounded-[20px] bg-secondary py-5 font-display text-[56px] font-extrabold tabular-nums tracking-[.2em]">{savedPin}</div>
                <p className="text-[13px] text-muted-foreground">Lo introduce al abrir la app de fichaje en su móvil.</p>
                <Button onClick={finish} className="h-[52px] w-full">Ir al panel</Button>
              </div>
            )}
            {step < 4 && (
              <div className="flex gap-3 pt-1">
                {step > 1 && <Button variant="outline" className="h-[52px] flex-1" onClick={() => setStep(step - 1)}>Atrás</Button>}
                <Button className="h-[52px] flex-1" onClick={next}>{step === 3 ? 'Crear empleado' : 'Siguiente'}</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
