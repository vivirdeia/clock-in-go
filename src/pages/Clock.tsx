import { useState, useRef, useCallback, useEffect } from 'react';
import { Fingerprint, Check, LogOut, History } from 'lucide-react';
import Wordmark from '@/components/Wordmark';
import { useAuth } from '@/store/AuthContext';
import { useDataStore } from '@/store/dataStore';
import { findEmployeeByPinAcrossAllAdmins, getDatasetReadOnly, patchDatasetReadOnly } from '@/store/dataStore';
import { formatTime, formatShortDate, type ClockRecord } from '@/types';
import { findMatchingZone } from '@/lib/geofencing';
import { evaluateRecordAlerts } from '@/lib/alerts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ==================== PIN SCREEN ====================
function PinScreen({ onSuccess }: { onSuccess: (empId: string) => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    if (newPin.length === 4) {
      const found = findEmployeeByPinAcrossAllAdmins(newPin);
      if (found) {
        localStorage.setItem('clockin_employee', found.employee.id);
        onSuccess(found.employee.id);
      } else {
        setError(true);
        setTimeout(() => { setError(false); setPin(''); }, 800);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-12">
        <Wordmark size="sm" />
      </div>
      <h2 className="text-xl font-semibold mb-8">Introduce tu PIN</h2>
      <div className={`flex gap-3 mb-8 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? 'bg-foreground border-foreground' : 'border-border'}`} />
        ))}
      </div>
      {error && <p className="text-destructive text-sm mb-4">PIN incorrecto</p>}
      <div className="grid grid-cols-3 gap-3 w-64">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button key={d} onClick={() => handleDigit(String(d))}
            className="w-20 h-14 rounded-md bg-secondary text-lg font-medium hover:bg-accent transition-colors">
            {d}
          </button>
        ))}
        <div />
        <button onClick={() => handleDigit('0')}
          className="w-20 h-14 rounded-md bg-secondary text-lg font-medium hover:bg-accent transition-colors">0</button>
        <button onClick={() => setPin(p => p.slice(0, -1))}
          className="w-20 h-14 rounded-md text-muted-foreground text-sm hover:bg-accent transition-colors">⌫</button>
      </div>
      <p className="text-muted-foreground text-xs mt-8 text-center">¿No tienes PIN? Pide a tu administrador que te lo asigne.</p>
    </div>
  );
}

// ==================== CLOCK SCREEN ====================
function ClockScreen({ employeeId }: { employeeId: string }) {
  const { getEmployee, getDepartment, settings, addClockRecord, acceptConsent, getEmployeeRecords } = useDataStore();
  const [time, setTime] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [showConsent, setShowConsent] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emp = getEmployee(employeeId);
  const dept = emp ? getDepartment(emp.departmentId) : null;
  const records = getEmployeeRecords(employeeId).slice(0, 10);
  const lastRec = records[0];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // RGPD consent the first time
  useEffect(() => {
    if (settings.requireConsent && emp && !emp.consentAcceptedAt) setShowConsent(true);
  }, [emp, settings.requireConsent]);

  const playSound = () => {
    if (!settings.sound) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(); osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };
  const vibrate = () => { if (settings.vibration) try { navigator.vibrate?.([200, 100, 200]); } catch {} };

  const getLocation = (): Promise<{ lat: number; lng: number; accuracy: number; address: string }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve({ lat: 0, lng: 0, accuracy: 0, address: 'Ubicación no disponible' }); return; }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude, lng = pos.coords.longitude, accuracy = Math.round(pos.coords.accuracy);
          let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            const road = data.address?.road || '';
            const number = data.address?.house_number || '';
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            const built = `${road} ${number}, ${city}`.trim();
            if (built && built !== ',') address = built;
          } catch {}
          resolve({ lat, lng, accuracy, address });
        },
        () => resolve({ lat: 0, lng: 0, accuracy: 0, address: 'Ubicación no disponible' }),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const startPress = useCallback(() => {
    if (confirmed) return;
    if (settings.requireConsent && emp && !emp.consentAcceptedAt) { setShowConsent(true); return; }
    setProgress(0);
    const start = Date.now();
    const target = settings.pressTimeSeconds * 1000;
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / target, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(intervalRef.current!);
        setConfirmed(true);
        vibrate(); playSound();
        getLocation().then(loc => {
          try {
            const rec = addClockRecord({ employeeId, lat: loc.lat, lng: loc.lng, address: loc.address, accuracy: loc.accuracy });
            const t = new Date(rec.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            setConfirmMsg(`✓ ${rec.type === 'entry' ? 'Entrada' : 'Salida'} registrada — ${t} — ${loc.address}${rec.inZone ? '' : ' (fuera de zona)'}`);
          } catch (e) {
            setConfirmMsg('Error al registrar el fichaje');
          }
        });
        setTimeout(() => { setConfirmed(false); setProgress(0); setConfirmMsg(''); }, 6000);
      }
    }, 16);
  }, [confirmed, settings.pressTimeSeconds, settings.requireConsent, emp, employeeId, addClockRecord]);

  const endPress = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (!confirmed) setProgress(0);
  }, [confirmed]);

  const circumference = 2 * Math.PI * 82;
  const timeStr = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 select-none">
      <div className="flex items-center gap-2 text-muted-foreground pt-4">
        <Wordmark size="sm" />
      </div>

      <div className="flex flex-col items-center">
        <div className="text-center mb-10">
          <p className="text-6xl font-light tabular-nums leading-none">{timeStr}</p>
          <p className="text-muted-foreground text-sm mt-2 capitalize">{dateStr}</p>
        </div>

        <div className="relative mb-6 flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {progress > 0 && !confirmed && (
            <div className="absolute rounded-full border-2 border-success" style={{ width: 180, height: 180, animation: 'pulse-ring 1s cubic-bezier(0,0,0.2,1) infinite' }} />
          )}
          <svg className="absolute w-[180px] h-[180px] -rotate-90" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="82" fill="none" stroke="currentColor" className="text-border" strokeWidth="4" />
            <circle cx="90" cy="90" r="82" fill="none" stroke="white" strokeWidth="6"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} strokeLinecap="round"
              style={{ transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear', opacity: progress > 0 ? 0.9 : 0 }} />
          </svg>
          <button
            onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
            onTouchStart={startPress} onTouchEnd={endPress}
            className="w-[180px] h-[180px] rounded-full gradient-clock flex items-center justify-center text-success-foreground touch-none"
            style={{ transform: confirmed ? 'scale(1)' : progress > 0 ? `scale(${1.05 + progress * 0.05})` : 'scale(1)', transition: 'transform 0.15s ease-out' }}
          >
            {confirmed ? <Check className="w-12 h-12" strokeWidth={1.5} /> : <Fingerprint className="w-12 h-12" strokeWidth={1.5} style={{ transform: progress > 0 ? `scale(${1 + progress * 0.3})` : 'scale(1)', transition: 'transform 0.1s ease-out' }} />}
          </button>
        </div>

        {confirmMsg ? (
          <p className="text-sm text-success font-medium text-center animate-fade-in-up max-w-xs">{confirmMsg}</p>
        ) : progress > 0 && !confirmed ? (
          <p className="text-sm text-muted-foreground animate-pulse">Manteniendo…</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Mantén pulsado {settings.pressTimeSeconds}s para fichar {lastRec ? (lastRec.type === 'entry' ? 'salida' : 'entrada') : ''}
          </p>
        )}

        <button onClick={() => setShowHistory(true)} className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <History className="w-3.5 h-3.5" strokeWidth={1.5} />Ver mis fichajes
        </button>
      </div>

      <div className="text-center pb-4">
        {emp && <p className="text-muted-foreground text-sm">{emp.name}{dept ? ` · ${dept.name}` : ''}</p>}
        {lastRec && (
          <p className="text-muted-foreground text-xs mt-1">
            Último fichaje hoy: {formatTime(lastRec.timestamp)} ({lastRec.type === 'entry' ? 'entrada' : 'salida'})
          </p>
        )}
      </div>

      {/* Consent dialog */}
      <Dialog open={showConsent} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Consentimiento RGPD</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground leading-relaxed">{settings.consentText}</p>
          <Button onClick={() => { acceptConsent(employeeId); setShowConsent(false); toast.success('Consentimiento registrado'); }} className="w-full">Acepto y continúo</Button>
        </DialogContent>
      </Dialog>

      {/* History dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Mis últimos fichajes</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {records.length === 0 && <p className="text-sm text-muted-foreground">Sin fichajes aún.</p>}
            {records.map((r: ClockRecord) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b">
                <div>
                  <p className="font-medium">{r.type === 'entry' ? '→ Entrada' : '← Salida'}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[200px]">{r.address}</p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">{formatTime(r.timestamp)}</p>
                  <p className="text-xs text-muted-foreground">{formatShortDate(r.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Estos registros son inmutables y se conservan 4 años (RD 8/2019).</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ==================== MAIN ====================
export default function ClockPage() {
  const { user, loginEmployee, logout } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>(() => {
    if (user?.role === 'employee' && user.employeeId) return user.employeeId;
    return localStorage.getItem('clockin_employee');
  });

  const handlePinSuccess = (empId: string) => {
    const found = findEmployeeByPinAcrossAllAdmins(empId);
    if (found) loginEmployee(found.employee.pin);
    setEmployeeId(empId);
  };

  const handleLogout = () => {
    logout();
    setEmployeeId(null);
    localStorage.removeItem('clockin_employee');
  };

  if (!employeeId) return <PinScreen onSuccess={handlePinSuccess} />;
  return (
    <div className="relative">
      <button onClick={handleLogout} className="absolute top-4 right-4 z-10 p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground" title="Cerrar sesión">
        <LogOut className="w-5 h-5" strokeWidth={1.5} />
      </button>
      <ClockScreen employeeId={employeeId} />
    </div>
  );
}
