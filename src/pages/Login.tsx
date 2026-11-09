import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, KeyRound, Check, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/store/AuthContext';
import { AuthInput, AuthSplit, authH1 } from '@/components/auth/AuthKit';
import { DialogHead } from '@/components/admin/kit';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const DEMO = { email: 'admin@techcorp.es', password: 'admin123' };

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAdmin, loginEmployee } = useAuth();
  const [tab, setTab] = useState<'admin' | 'employee'>('admin');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [sent, setSent] = useState(false);

  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const doAdminLogin = (em: string, pw: string) => {
    setAdminError('');
    const result = loginAdmin(em, pw);
    if (result.success) navigate('/dashboard');
    else setAdminError(result.error || 'Error al iniciar sesión');
  };

  const handlePinDigit = (d: string) => {
    if (pin.length >= 4 || pinError) return;
    const newPin = pin + d;
    setPin(newPin);
    if (newPin.length === 4) {
      const result = loginEmployee(newPin);
      if (result.success) {
        localStorage.setItem('clockin_employee', result.employeeId!);
        navigate('/clock');
      } else {
        setPinError('Ese PIN no coincide, prueba otra vez');
        setTimeout(() => { setPinError(''); setPin(''); }, 1000);
      }
    }
  };

  const openForgot = () => { setForgotEmail(email); setSent(false); setForgotOpen(true); };
  const sendLink = (e: React.FormEvent) => {
    e.preventDefault();
    // Sin backend: se simula el envío del enlace.
    setSent(true);
  };

  const keyCls = 'h-16 rounded-2xl bg-secondary font-display text-2xl font-bold transition-colors hover:bg-accent active:scale-95 motion-reduce:active:scale-100';

  return (
    <AuthSplit
      tone="black"
      panel={
        <>
          <h1 className={authH1}>Hola de nuevo. Tu equipo ya está fichando.</h1>
          <p className="mt-5 text-[17px] text-[#A1A1AA]">Entra para ver quién está, dónde y desde qué hora.</p>
        </>
      }
    >
      <h2 className="mb-6 font-display text-[32px] font-extrabold tracking-[-0.02em]">Iniciar sesión</h2>

      <div role="tablist" className="mb-6 grid grid-cols-2 gap-1 rounded-[14px] bg-secondary p-1">
        {([['admin', 'Administrador'], ['employee', 'Empleado']] as const).map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={cn('h-11 rounded-[10px] text-[15px] font-semibold transition', tab === k ? 'bg-background text-foreground shadow-card' : 'text-muted-foreground hover:text-foreground')}
          >
            {l}
          </button>
        ))}
      </div>

      {tab === 'admin' ? (
        <form onSubmit={e => { e.preventDefault(); doAdminLogin(email, password); }} className="space-y-4">
          <AuthInput label="Email" icon={Mail} type="email" placeholder="tu@empresa.es" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
          <AuthInput label="Contraseña" icon={Lock} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
          {adminError && <p role="alert" className="text-sm font-medium text-danger-ink">{adminError}</p>}
          <Button type="submit" className="h-[52px] w-full text-[15px]">Entrar</Button>
          <Button type="button" variant="outline" className="h-[52px] w-full text-[15px]" onClick={() => doAdminLogin(DEMO.email, DEMO.password)}>
            Entrar con la cuenta demo
          </Button>
          <button type="button" onClick={openForgot} className="block w-full py-2 text-center text-sm font-medium text-muted-foreground hover:text-foreground">
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center">
          <p className="mb-5 text-[15px] text-muted-foreground">Introduce tu PIN de 4 cifras</p>
          <div className={cn('mb-4 flex gap-3', pinError && 'animate-shake')}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={cn(
                  'flex h-14 w-12 items-center justify-center rounded-[14px] border-2 font-display text-2xl font-bold',
                  pinError ? 'border-danger text-danger' : i < pin.length ? 'border-foreground' : 'border-border',
                )}
              >
                {i < pin.length ? '•' : ''}
              </div>
            ))}
          </div>
          <div className="mb-4 h-6">
            {pinError && <p role="alert" className="text-sm font-semibold text-danger-ink">{pinError}</p>}
          </div>
          <div className="grid w-full max-w-[300px] grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
              <button key={d} onClick={() => handlePinDigit(String(d))} className={keyCls}>{d}</button>
            ))}
            <div />
            <button onClick={() => handlePinDigit('0')} className={keyCls}>0</button>
            <button onClick={() => setPin(p => p.slice(0, -1))} aria-label="Borrar" className="flex h-16 items-center justify-center rounded-2xl text-muted-foreground hover:bg-secondary">
              <Delete className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{' '}
        <Link to="/register" className="font-semibold text-foreground hover:underline">Créala gratis</Link>
      </p>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="max-w-[560px] space-y-5">
          {!sent ? (
            <form onSubmit={sendLink} className="space-y-5">
              <DialogHead icon={KeyRound} tint="blue" title="Recupera tu acceso" />
              <p className="text-[15px] text-muted-foreground">Escribe tu email y te enviamos un enlace para crear una contraseña nueva.</p>
              <AuthInput label="Email" icon={Mail} type="email" placeholder="tu@empresa.es" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              <Button type="submit" className="h-[52px] w-full">Enviar enlace</Button>
              <button type="button" onClick={() => setForgotOpen(false)} className="block w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground">
                Volver a iniciar sesión
              </button>
            </form>
          ) : (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-tint text-success-ink">
                <Check className="h-8 w-8" />
              </div>
              <DialogTitle className="font-display text-2xl font-extrabold">Revisa tu correo</DialogTitle>
              <p className="text-[15px] text-muted-foreground">Hemos enviado el enlace a <strong className="text-foreground">{forgotEmail}</strong>. Caduca en 30 minutos.</p>
              <Button className="h-[52px] w-full" onClick={() => setForgotOpen(false)}>Volver a iniciar sesión</Button>
              <button type="button" onClick={() => toast.success('Te hemos reenviado el enlace')} className="block w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground">
                ¿No te ha llegado? Reenviar
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AuthSplit>
  );
}
