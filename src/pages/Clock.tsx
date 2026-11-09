import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Fingerprint, Check, LogOut, History, Delete, AlertCircle, MapPin, AlertTriangle, ShieldCheck,
  ChevronLeft, ArrowRight, ArrowLeft,
} from 'lucide-react';
import Wordmark from '@/components/Wordmark';
import LogoIcon from '@/components/LogoIcon';
import StreetMap from '@/components/brand/StreetMap';
import StatusPill from '@/components/brand/StatusPill';
import { useAuth } from '@/store/AuthContext';
import { useDataStore } from '@/store/dataStore';
import { findEmployeeByPinAcrossAllAdmins } from '@/store/dataStore';
import { formatTime, type ClockRecord } from '@/types';
import { distanceToNearestZone } from '@/lib/geofencing';
import { computeWorkedMinutes, formatHm } from '@/lib/alerts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const fmtDate = (d: Date) => d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toLowerCase();
const fmtHM = (d: Date) => d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
const fmtDistance = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${Math.round(m)} m`);

// ==================== PIN SCREEN ====================
function PinScreen({ onSuccess }: { onSuccess: (empId: string) => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (pin.length >= 4 || error) return;
    const newPin = pin + d;
    setPin(newPin);
    if (newPin.length === 4) {
      const found = findEmployeeByPinAcrossAllAdmins(newPin);
      if (found) {
        localStorage.setItem('clockin_employee', found.employee.id);
        onSuccess(found.employee.id);
      } else {
        setError(true);
        setTimeout(() => { setError(false); setPin(''); }, 1000);
      }
    }
  };

  const key = 'h-16 rounded-[20px] bg-secondary text-2xl font-medium tabular-nums hover:bg-border active:scale-95 transition motion-reduce:transition-none';

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-[72px] h-[72px] rounded-[22px] bg-primary flex items-center justify-center mb-6">
        <LogoIcon variant="light" bg="#0A0A0A" className="w-10 h-10" />
      </div>
      <h1 className="font-display font-extrabold text-[30px] tracking-[-0.03em] mb-1">Introduce tu PIN</h1>
      <p className="text-[15px] text-muted-foreground mb-8">4 cifras y a fichar</p>

      <div className={cn('flex gap-4 mb-6', error && 'animate-shake motion-reduce:animate-none')} aria-label={`${pin.length} de 4 cifras`}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={cn('w-4 h-4 rounded-full transition-colors',
            error ? 'bg-danger' : i < pin.length ? 'bg-foreground' : 'border-2 border-subtle')} />
        ))}
      </div>

      <div className="h-10 mb-4 flex items-center">
        {error && (
          <p role="alert" className="inline-flex items-center gap-2 rounded-full bg-danger-tint text-danger-ink text-sm font-semibold px-4 py-2">
            <AlertCircle className="w-4 h-4" />Ese PIN no coincide, prueba otra vez
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-[14px] w-[300px] max-w-full">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <button key={d} onClick={() => handleDigit(String(d))} className={key}>{d}</button>
        ))}
        <div />
        <button onClick={() => handleDigit('0')} className={key}>0</button>
        <button onClick={() => setPin(p => p.slice(0, -1))} aria-label="Borrar"
          className="h-16 rounded-[20px] bg-background text-muted-foreground flex items-center justify-center hover:bg-secondary transition-colors">
          <Delete className="w-6 h-6" />
        </button>
      </div>

      <p className="text-sm text-muted-foreground mt-8 text-center max-w-[300px]">
        {error ? '¿Lo has olvidado? Tu responsable puede verlo o generarte uno nuevo desde el panel.' : 'Tu administrador te asigna el PIN desde el panel.'}
      </p>
    </div>
  );
}

// ==================== CONSENT SHEET ====================
function ConsentSheet({ text, onAccept }: { text: string; onAccept: () => void }) {
  const [full, setFull] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/50" />
      <div role="dialog" aria-modal="true" aria-labelledby="consent-title"
        className="relative w-full max-w-md bg-background rounded-t-[28px] p-6 pb-8 animate-in slide-in-from-bottom duration-300 motion-reduce:animate-none max-h-[92vh] overflow-y-auto">
        <div className="mx-auto mb-6 w-11 h-[5px] rounded-full bg-border" />
        <div className="w-[52px] h-[52px] rounded-2xl bg-brand-tint flex items-center justify-center mb-5">
          <ShieldCheck className="w-7 h-7 text-brand-dark" />
        </div>
        <h1 id="consent-title" className="font-display font-extrabold text-[26px] tracking-[-0.03em] leading-tight mb-3">Antes de tu primer fichaje</h1>
        <p className={cn('text-[15px] leading-relaxed text-graphite mb-5', !full && 'line-clamp-4')}>{text}</p>
        <ul className="rounded-2xl bg-secondary p-4 space-y-3 mb-6">
          {['Solo al fichar, nunca de forma continua', 'Se conserva 4 años, como marca la ley', 'Puedes consultar tus fichajes cuando quieras'].map(t => (
            <li key={t} className="flex items-start gap-2.5 text-[15px]">
              <Check className="w-4 h-4 mt-1 text-success flex-shrink-0" />{t}
            </li>
          ))}
        </ul>
        <Button onClick={onAccept} className="w-full h-[54px] text-base">Acepto y continúo</Button>
        {!full && (
          <button onClick={() => setFull(true)} className="block mx-auto mt-3 h-11 text-sm text-muted-foreground underline underline-offset-4">Leer el texto completo</button>
        )}
      </div>
    </div>
  );
}

// ==================== HISTORY VIEW ====================
function HistoryView({ records, onBack }: { records: ClockRecord[]; onBack: () => void }) {
  const now = new Date();
  const todayKey = now.toDateString();
  const monday = new Date(now); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const weekMins = computeWorkedMinutes(records.filter(r => new Date(r.timestamp) >= monday));
  const todayMins = computeWorkedMinutes(records.filter(r => new Date(r.timestamp).toDateString() === todayKey));

  const sorted = [...records].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  const groups: { key: string; label: string; items: ClockRecord[] }[] = [];
  for (const r of sorted) {
    const d = new Date(r.timestamp);
    const k = d.toDateString();
    let g = groups.find(x => x.key === k);
    if (!g) {
      const wd = d.toLocaleDateString('es-ES', { weekday: 'long' });
      const label = k === todayKey ? `Hoy, ${wd} ${d.getDate()}` : `${wd.charAt(0).toUpperCase()}${wd.slice(1)} ${d.getDate()}`;
      g = { key: k, label, items: [] };
      groups.push(g);
    }
    g.items.push(r);
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} aria-label="Volver" className="w-11 h-11 rounded-full border flex items-center justify-center hover:bg-secondary">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display font-extrabold text-2xl tracking-[-0.03em]">Mis fichajes</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="rounded-[20px] bg-brand text-primary-foreground p-4">
          <p className="text-sm opacity-90">Esta semana</p>
          <p className="font-display font-extrabold text-[26px] tabular-nums tracking-[-0.02em]">{formatHm(weekMins)}</p>
        </div>
        <div className="rounded-[20px] bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Hoy</p>
          <p className="font-display font-extrabold text-[26px] tabular-nums tracking-[-0.02em]">{formatHm(todayMins)}</p>
        </div>
      </div>

      {groups.length === 0 && <p className="text-muted-foreground text-[15px] text-center py-10">Aún no tienes fichajes. El primero aparecerá aquí.</p>}
      <div className="space-y-6">
        {groups.map(g => (
          <section key={g.key}>
            <h2 className="text-[13px] font-semibold text-muted-foreground mb-2">{g.label}</h2>
            <ul className="divide-y">
              {g.items.map(r => {
                const out = !r.inZone;
                const entry = r.type === 'entry';
                return (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <span className={cn('w-[38px] h-[38px] rounded-xl flex items-center justify-center flex-shrink-0',
                      out ? 'bg-danger-tint text-danger-ink' : entry ? 'bg-success-tint text-success-ink' : 'bg-secondary text-muted-foreground')}>
                      {entry ? <ArrowRight className="w-[18px] h-[18px]" /> : <ArrowLeft className="w-[18px] h-[18px]" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold">{entry ? 'Entrada' : 'Salida'}</p>
                      <p className="text-[13px] text-muted-foreground truncate">{r.address}{out ? ' · fuera de zona' : ''}</p>
                    </div>
                    <span className="text-base font-semibold tabular-nums">{formatTime(r.timestamp)}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-10">Tus fichajes no se pueden modificar y se conservan 4 años (RD-ley 8/2019).</p>
    </div>
  );
}

// ==================== CONFIRMATION VIEW ====================
interface ConfirmData { record: ClockRecord; zoneName: string | null; nearestZone: string | null; distance: number | null }

function ConfirmView({ data, onBack, onHistory, onNote }: { data: ConfirmData; onBack: () => void; onHistory: () => void; onNote: (n: string) => void }) {
  const { record } = data;
  const [note, setNote] = useState('');
  const d = new Date(record.timestamp);
  const label = record.type === 'entry' ? 'Entrada' : 'Salida';

  if (record.inZone) {
    return (
      <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center">
        <div className="w-[200px] h-[200px] rounded-full bg-success-tint flex items-center justify-center mb-6">
          <div className="w-[150px] h-[150px] rounded-full bg-success flex items-center justify-center animate-in zoom-in-50 duration-300 motion-reduce:animate-none">
            <Check className="w-[72px] h-[72px] text-success-foreground" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="font-display font-extrabold text-[30px] tracking-[-0.03em]">{label} registrada</h1>
        <p className="text-[52px] leading-tight tabular-nums tracking-[-0.04em]">{fmtHM(d)}</p>
        <p className="text-[15px] text-muted-foreground mb-6">{fmtDate(d)}</p>
        <div className="w-full max-w-sm rounded-[20px] border overflow-hidden text-left mb-6">
          <StreetMap focusX={330} focusY={290} className="h-[110px]">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] rounded-full border-2 border-success bg-success/15" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand border-[3px] border-background shadow" />
          </StreetMap>
          <div className="p-4 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold truncate">{record.address}</p>
              <p className="text-[13px] text-muted-foreground">{data.zoneName ?? 'Zona de fichaje'} · precisión {record.accuracy} m</p>
            </div>
            <StatusPill variant="in">En zona</StatusPill>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-2">
          <Button onClick={onHistory} className="w-full h-12">Ver mis fichajes</Button>
          <Button variant="ghost" onClick={onBack} className="w-full h-12 text-muted-foreground">Volver</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <div className="relative h-[250px] rounded-[24px] overflow-hidden border mb-6">
        <StreetMap focusX={380} focusY={300} className="w-full h-full">
          <span className="absolute left-[38%] top-[45%] -translate-x-1/2 -translate-y-1/2 w-[130px] h-[130px] rounded-full border-2 border-brand bg-brand/[.14]" />
          {data.nearestZone && (
            <span className="absolute left-[38%] top-[45%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background shadow px-2.5 py-1 text-xs font-semibold whitespace-nowrap">{data.nearestZone}</span>
          )}
          <span className="absolute left-[74%] top-[70%] -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-danger border-[3px] border-background shadow" />
          <span className="absolute left-[74%] top-[70%] -translate-x-1/2 mt-3 rounded-full bg-danger text-danger-foreground px-2.5 py-1 text-xs font-semibold whitespace-nowrap">
            Estás aquí{data.distance != null ? ` · a ${fmtDistance(data.distance)}` : ''}
          </span>
        </StreetMap>
      </div>
      <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-danger-tint text-danger-ink text-sm font-semibold px-3 py-1.5 mb-3">
        <AlertTriangle className="w-4 h-4" />Fuera de tu zona
      </span>
      <h1 className="font-display font-extrabold text-[26px] tracking-[-0.03em] leading-tight mb-2">{label} registrada a las {fmtHM(d)}</h1>
      <p className="text-[15px] text-muted-foreground mb-5">Desde {record.address}. Tu responsable recibirá el aviso; si estás trabajando fuera, cuéntale el motivo y lo tendrá en cuenta.</p>
      <label htmlFor="motivo" className="text-sm font-semibold mb-1.5">Motivo (opcional)</label>
      <textarea id="motivo" value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Ej.: reunión con un cliente"
        className="w-full rounded-2xl border bg-background p-3 text-[15px] outline-none focus:ring-2 focus:ring-ring mb-5 resize-none" />
      <div className="space-y-2 mt-auto">
        <Button className="w-full h-12" onClick={() => { if (note.trim()) onNote(note.trim()); onBack(); }}>Enviar motivo</Button>
        <Button variant="secondary" className="w-full h-12" onClick={onBack}>Ahora no</Button>
      </div>
    </div>
  );
}

// ==================== CLOCK SCREEN ====================
function ClockScreen({ employeeId, onLogout }: { employeeId: string; onLogout: () => void }) {
  const { getEmployee, getDepartment, settings, addClockRecord, acceptConsent, getEmployeeRecords, zones, addEmployeeNote } = useDataStore();
  const [time, setTime] = useState(new Date());
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmData, setConfirmData] = useState<ConfirmData | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const emp = getEmployee(employeeId);
  const dept = emp ? getDepartment(emp.departmentId) : null;
  const allRecords = getEmployeeRecords(employeeId);
  const lastRec = allRecords[0];
  const lastZone = lastRec?.zoneId ? zones.find(z => z.id === lastRec.zoneId) : null;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => { clearInterval(t); if (resetRef.current) clearTimeout(resetRef.current); };
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

  const closeConfirm = useCallback(() => {
    if (resetRef.current) clearTimeout(resetRef.current);
    setConfirmed(false); setProgress(0); setConfirmData(null);
  }, []);

  const startPress = useCallback(() => {
    if (confirmed) return;
    if (settings.requireConsent && emp && !emp.consentAcceptedAt) { setShowConsent(true); return; }
    setProgress(0);
    const start = Date.now();
    const target = settings.pressTimeSeconds * 1000;
    intervalRef.current = setInterval(() => {
      const p = Math.min((Date.now() - start) / target, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(intervalRef.current!);
        setConfirmed(true);
        vibrate(); playSound();
        getLocation().then(loc => {
          try {
            const rec = addClockRecord({ employeeId, lat: loc.lat, lng: loc.lng, address: loc.address, accuracy: loc.accuracy });
            const zone = rec.zoneId ? zones.find(z => z.id === rec.zoneId) : null;
            const nearest = loc.lat || loc.lng ? distanceToNearestZone(loc.lat, loc.lng, zones) : null;
            setConfirmData({ record: rec, zoneName: zone?.name ?? null, nearestZone: nearest?.zone.name ?? null, distance: nearest ? nearest.distance : null });
            // En zona se cierra solo a los 6 s; fuera de zona espera al motivo
            if (rec.inZone) resetRef.current = setTimeout(closeConfirm, 6000);
          } catch {
            toast.error('No se ha podido registrar el fichaje');
            closeConfirm();
          }
        });
      }
    }, 16);
  }, [confirmed, settings.pressTimeSeconds, settings.requireConsent, emp, employeeId, addClockRecord, zones, closeConfirm]);

  const endPress = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (!confirmed) setProgress(0);
  }, [confirmed]);

  if (showHistory) return <HistoryView records={allRecords} onBack={() => setShowHistory(false)} />;
  if (confirmData) {
    return (
      <ConfirmView data={confirmData} onBack={closeConfirm}
        onHistory={() => { closeConfirm(); setShowHistory(true); }}
        onNote={n => { addEmployeeNote(confirmData.record.id, n); toast.success('Motivo enviado'); }} />
    );
  }

  const r = 112;
  const circumference = 2 * Math.PI * r;
  const pressing = progress > 0 && !confirmed;
  const nextType = lastRec && new Date(lastRec.timestamp).toDateString() === new Date().toDateString() && lastRec.type === 'entry' ? 'salida' : 'entrada';
  const firstName = emp?.name.split(' ')[0] ?? '';

  return (
    <div className="min-h-screen bg-background flex flex-col p-6 select-none">
      <header className="flex items-center justify-between">
        <Wordmark size="sm" />
        <button onClick={onLogout} aria-label="Cerrar sesión" className="w-11 h-11 rounded-full border flex items-center justify-center text-muted-foreground hover:bg-secondary">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center py-8">
        <p className="text-[15px] text-muted-foreground">Hola, {firstName}</p>
        <p className="text-[72px] font-normal leading-none tabular-nums tracking-[-0.04em] my-1">{fmtHM(time)}</p>
        <p className="text-[15px] text-muted-foreground mb-8">{fmtDate(time)}</p>

        <div className="relative w-[232px] h-[232px] flex items-center justify-center mb-6">
          {pressing && (
            <span className="absolute w-[188px] h-[188px] rounded-full border-2 border-brand motion-reduce:hidden"
              style={{ animation: 'pulse-ring 1s cubic-bezier(0,0,0.2,1) infinite' }} />
          )}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 232 232" aria-hidden="true">
            <circle cx="116" cy="116" r={r} fill="none" className="stroke-secondary" strokeWidth="8" />
            <circle cx="116" cy="116" r={r} fill="none" className="stroke-brand" strokeWidth="8"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} strokeLinecap="round"
              style={{ transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear', opacity: progress > 0 ? 1 : 0 }} />
          </svg>
          <button
            onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
            onTouchStart={startPress} onTouchEnd={endPress}
            aria-label={`Mantén pulsado para fichar ${nextType}`}
            className="relative w-[188px] h-[188px] rounded-full bg-primary flex items-center justify-center touch-none motion-reduce:!transform-none"
            style={{ transform: pressing ? `scale(${1.05 + progress * 0.05})` : 'scale(1)', transition: 'transform 0.15s ease-out' }}
          >
            {confirmed
              ? <Check className="w-16 h-16 text-primary-foreground" strokeWidth={1.5} />
              : <Fingerprint className="w-16 h-16 text-primary-foreground" strokeWidth={1.5} />}
          </button>
        </div>

        <p className="text-[17px] font-semibold text-center">Mantén pulsado para fichar {nextType}</p>
        <p className="text-sm text-muted-foreground h-5 mt-1" aria-live="polite">
          {pressing ? 'Un momento más… ya casi está' : confirmed ? 'Registrando tu ubicación…' : ''}
        </p>
      </main>

      <div className="space-y-3 w-full max-w-md mx-auto">
        <div className="rounded-[20px] bg-secondary p-3 flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-background flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold truncate">
              {[lastZone?.name ?? (lastRec ? null : 'Tu zona de fichaje'), dept?.name].filter(Boolean).join(' · ') || 'Tu zona de fichaje'}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {!lastRec ? 'Ubicación pendiente' : lastRec.inZone ? 'Dentro de tu zona de fichaje' : 'Último fichaje fuera de zona'}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setShowHistory(true)} className="w-full h-12 gap-2">
          <History className="w-4 h-4" />Ver mis fichajes
        </Button>
      </div>

      {showConsent && (
        <ConsentSheet
          text={settings.consentText || `${settings.companyName || 'Tu empresa'} registrará la hora y tu ubicación GPS solo en el momento de cada fichaje, para cumplir con el registro de jornada (RD-ley 8/2019).`}
          onAccept={() => { acceptConsent(employeeId); setShowConsent(false); toast.success('Consentimiento registrado'); }}
        />
      )}
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
  return <ClockScreen employeeId={employeeId} onLogout={handleLogout} />;
}
