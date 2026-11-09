import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building2, FileText, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/store/AuthContext';
import { AuthInput, AuthSplit, authH1 } from '@/components/auth/AuthKit';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [cif, setCif] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    const result = register({ name, email, password, company, cif: cif || undefined });
    if (result.success) navigate('/select-plan');
    else setError(result.error || 'Error al registrar');
  };

  return (
    <AuthSplit
      tone="blue"
      maxW={420}
      panel={
        <>
          <h1 className={authH1}>En 10 minutos, tu equipo ficha desde el móvil.</h1>
          <ul className="mt-6 space-y-3">
            {['Gratis hasta 5 empleados', 'Sin tarjeta y sin permanencia', 'Sin aparatos ni instalaciones'].map(t => (
              <li key={t} className="flex items-center gap-3 text-base font-medium">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-foreground/15"><Check className="h-4 w-4" /></span>
                {t}
              </li>
            ))}
          </ul>
        </>
      }
    >
      <h2 className="font-display text-[32px] font-extrabold tracking-[-0.02em]">Crear cuenta</h2>
      <p className="mb-6 mt-1 text-[15px] text-muted-foreground">Empieza gratis hoy mismo.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput label="Nombre completo" icon={User} placeholder="Juan García" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
        <AuthInput label="Email" icon={Mail} type="email" placeholder="juan@empresa.es" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
        <AuthInput label="Contraseña" icon={Lock} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthInput label="Empresa" icon={Building2} placeholder="Mi Empresa SL" value={company} onChange={e => setCompany(e.target.value)} required />
          <AuthInput label={<>CIF <span className="font-normal text-muted-foreground">(opcional)</span></>} id="f-cif" icon={FileText} placeholder="B12345678" value={cif} onChange={e => setCif(e.target.value)} />
        </div>
        {error && <p role="alert" className="text-sm font-medium text-danger-ink">{error}</p>}
        <Button type="submit" className="h-[52px] w-full text-[15px]">Crear cuenta</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link to="/login" className="font-semibold text-foreground hover:underline">Inicia sesión</Link>
      </p>
    </AuthSplit>
  );
}
