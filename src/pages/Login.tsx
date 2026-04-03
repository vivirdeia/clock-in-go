import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, Mail, Lock, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/store/AuthContext';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { loginAdmin, loginEmployee } = useAuth();

  // Admin form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  // Employee PIN
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    const result = loginAdmin(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setAdminError(result.error || 'Error al iniciar sesión');
    }
  };

  const handlePinDigit = (d: string) => {
    if (pin.length >= 4) return;
    const newPin = pin + d;
    setPin(newPin);
    setPinError('');
    if (newPin.length === 4) {
      const result = loginEmployee(newPin);
      if (result.success) {
        localStorage.setItem('clockin_employee', result.employeeId!);
        navigate('/clock');
      } else {
        setPinError('PIN incorrecto');
        setTimeout(() => { setPinError(''); setPin(''); }, 800);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-10">
        <LogoIcon className="w-5 h-5" />CLOCKIN
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-6">Iniciar sesión</h1>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="admin" className="flex-1">Administrador</TabsTrigger>
            <TabsTrigger value="employee" className="flex-1">Empleado</TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="admin@empresa.es"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              {adminError && <p className="text-destructive text-sm">{adminError}</p>}
              <Button type="submit" className="w-full rounded-full">Entrar</Button>
              <button
                type="button"
                className="text-sm text-muted-foreground hover:text-foreground w-full text-center"
                onClick={() => toast.info('En producción se enviaría un email de recuperación')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-6">
              Demo: admin@techcorp.es / admin123
            </p>
          </TabsContent>

          <TabsContent value="employee">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 mb-6 text-muted-foreground">
                <KeyRound className="w-4 h-4" />
                <span className="text-sm">Introduce tu PIN de 4 dígitos</span>
              </div>
              <div className={`flex gap-3 mb-6 ${pinError ? 'animate-shake' : ''}`}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className={`w-4 h-4 rounded-full border-2 transition-all ${i < pin.length ? 'bg-foreground border-foreground' : 'border-border'}`} />
                ))}
              </div>
              {pinError && <p className="text-destructive text-sm mb-4">{pinError}</p>}
              <div className="grid grid-cols-3 gap-3 w-56">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
                  <button key={d} onClick={() => handlePinDigit(String(d))}
                    className="w-16 h-12 rounded-lg bg-secondary text-lg font-medium hover:bg-accent transition-colors">
                    {d}
                  </button>
                ))}
                <div />
                <button onClick={() => handlePinDigit('0')}
                  className="w-16 h-12 rounded-lg bg-secondary text-lg font-medium hover:bg-accent transition-colors">0</button>
                <button onClick={() => setPin(p => p.slice(0, -1))}
                  className="w-16 h-12 rounded-lg text-muted-foreground text-sm hover:bg-accent transition-colors">⌫</button>
              </div>
              <p className="text-xs text-muted-foreground mt-6">Demo: PIN 1234</p>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-sm text-center mt-8 text-muted-foreground">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-foreground font-medium hover:underline">Crear cuenta</Link>
        </p>
      </div>
    </div>
  );
}
