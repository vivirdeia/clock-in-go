import { useState, useRef, useCallback, useEffect } from 'react';
import { Clock, Fingerprint, Check, LogOut } from 'lucide-react';
import { employees, getEmployee, getDepartment, getTodayRecords, formatTime } from '@/data/mockData';
import { useAuth } from '@/store/AuthContext';

// ==================== PIN SCREEN ====================
function PinScreen({ onSuccess }: { onSuccess: (empId: string) => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    if (newPin.length === 4) {
      const emp = employees.find(e => e.pin === newPin);
      if (emp) {
        localStorage.setItem('clockin_employee', emp.id);
        onSuccess(emp.id);
      } else {
        setError(true);
        setTimeout(() => { setError(false); setPin(''); }, 800);
      }
    }
  };

  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 text-muted-foreground mb-12">
        <Clock className="w-5 h-5" />
        <span className="font-bold">CLOCKIN</span>
      </div>
      <h2 className="text-xl font-bold mb-8">Introduce tu PIN</h2>
      <div className={`flex gap-3 mb-8 ${error ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? 'bg-foreground border-foreground' : 'border-border'}`} />
        ))}
      </div>
      {error && <p className="text-destructive text-sm mb-4">PIN incorrecto</p>}
      <div className="grid grid-cols-3 gap-3 w-64">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button key={d} onClick={() => handleDigit(String(d))}
            className="w-20 h-14 rounded-lg bg-secondary text-lg font-medium hover:bg-accent transition-colors">
            {d}
          </button>
        ))}
        <div />
        <button onClick={() => handleDigit('0')}
          className="w-20 h-14 rounded-lg bg-secondary text-lg font-medium hover:bg-accent transition-colors">0</button>
        <button onClick={handleDelete}
          className="w-20 h-14 rounded-lg text-muted-foreground text-sm hover:bg-accent transition-colors">⌫</button>
      </div>
      <p className="text-muted-foreground text-xs mt-8 text-center">¿No tienes PIN? Pide a tu administrador que te lo asigne.</p>
    </div>
  );
}

// ==================== CLOCK SCREEN ====================
function ClockScreen({ employeeId }: { employeeId: string }) {
  const [time, setTime] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [hasClocked, setHasClocked] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const emp = getEmployee(employeeId);
  const dept = emp ? getDepartment(emp.departmentId) : null;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Last clock today
  const todayRecs = getTodayRecords().filter(r => r.employeeId === employeeId);
  const lastRec = todayRecs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0];

  const playSound = () => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const vibrate = () => {
    try { navigator.vibrate?.([200, 100, 200]); } catch {}
  };

  const getLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve('Ubicación no disponible'); return; }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            const data = await res.json();
            const road = data.address?.road || '';
            const number = data.address?.house_number || '';
            const city = data.address?.city || data.address?.town || data.address?.village || '';
            resolve(`${road} ${number}, ${city}`.trim() || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          } catch {
            resolve(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
          }
        },
        () => resolve('Ubicación no disponible'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const startPress = useCallback(() => {
    if (confirmed) return;
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / 2000, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(intervalRef.current!);
        setConfirmed(true);
        setHasClocked(true);
        vibrate();
        playSound();
        const clockTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        getLocation().then(addr => {
          setConfirmMsg(`✓ Fichaje registrado — ${clockTime} — ${addr}`);
        });
        setTimeout(() => { setConfirmed(false); setProgress(0); setConfirmMsg(''); }, 6000);
      }
    }, 16);
  }, [confirmed]);

  const endPress = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (!confirmed) setProgress(0);
  }, [confirmed]);

  const circumference = 2 * Math.PI * 82;
  const timeStr = time.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-6 select-none">
      {/* Logo */}
      <div className="flex items-center gap-2 text-muted-foreground pt-4">
        <Clock className="w-4 h-4" />
        <span className="font-bold text-sm tracking-wider">CLOCKIN</span>
      </div>

      {/* Center */}
      <div className="flex flex-col items-center">
        {/* Time */}
        <div className="text-center mb-10">
          <p className="text-6xl font-extralight tabular-nums leading-none">{timeStr}</p>
          <p className="text-muted-foreground text-sm mt-2 capitalize">{dateStr}</p>
        </div>

        {/* Clock button */}
        <div className="relative mb-6 flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {/* Pulse ring effect */}
          {progress > 0 && !confirmed && (
            <div
              className="absolute rounded-full border-2 border-success"
              style={{
                width: 180, height: 180,
                animation: 'pulse-ring 1s cubic-bezier(0,0,0.2,1) infinite',
              }}
            />
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
            style={{
              transform: confirmed ? 'scale(1)' : progress > 0 ? `scale(${1.05 + progress * 0.05})` : 'scale(1)',
              transition: 'transform 0.15s ease-out',
            }}
          >
            {confirmed ? (
              <Check className="w-12 h-12" />
            ) : (
              <Fingerprint
                className="w-12 h-12"
                style={{
                  transform: progress > 0 ? `scale(${1 + progress * 0.3})` : 'scale(1)',
                  transition: 'transform 0.1s ease-out, filter 0.1s ease-out',
                  animation: progress > 0 ? 'icon-glow 1s ease-in-out infinite' : 'none',
                }}
              />
            )}
          </button>
        </div>

        {/* Messages */}
        {confirmMsg ? (
          <p className="text-sm text-success font-medium text-center animate-fade-in-up max-w-xs">{confirmMsg}</p>
        ) : progress > 0 && !confirmed ? (
          <p className="text-sm text-muted-foreground animate-pulse">Manteniendo…</p>
        ) : !hasClocked ? (
          <p className="text-sm text-muted-foreground">Mantén pulsado para fichar</p>
        ) : null}
      </div>

      {/* Bottom */}
      <div className="text-center pb-4">
        {emp && <p className="text-muted-foreground text-sm">{emp.name} · {dept?.name}</p>}
        {lastRec && (
          <p className="text-muted-foreground text-xs mt-1">
            Último fichaje: {formatTime(lastRec.timestamp)} ({lastRec.type === 'entry' ? 'entrada' : 'salida'})
          </p>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN CLOCK PAGE ====================
export default function ClockPage() {
  const { user, loginEmployee, logout } = useAuth();
  const [employeeId, setEmployeeId] = useState<string | null>(() => {
    // If already logged in as employee via auth
    if (user?.role === 'employee' && user.employeeId) return user.employeeId;
    return localStorage.getItem('clockin_employee');
  });

  const handlePinSuccess = (empId: string) => {
    loginEmployee(employees.find(e => e.id === empId)?.pin || '');
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
      <button
        onClick={handleLogout}
        className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
        title="Cerrar sesión"
      >
        <LogOut className="w-5 h-5" />
      </button>
      <ClockScreen employeeId={employeeId} />
    </div>
  );
}
