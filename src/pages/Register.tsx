import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Building2, FileText } from 'lucide-react';
import LogoIcon from '@/components/LogoIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/store/AuthContext';

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
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    const result = register({ name, email, password, company, cif: cif || undefined });
    if (result.success) {
      navigate('/select-plan');
    } else {
      setError(result.error || 'Error al registrar');
    }
  };

  const fields = [
    { icon: User, label: 'Nombre completo', value: name, set: setName, type: 'text', placeholder: 'Juan García', required: true },
    { icon: Mail, label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'juan@empresa.es', required: true },
    { icon: Lock, label: 'Contraseña', value: password, set: setPassword, type: 'password', placeholder: '••••••••', required: true },
    { icon: Building2, label: 'Nombre de empresa', value: company, set: setCompany, type: 'text', placeholder: 'Mi Empresa SL', required: true },
    { icon: FileText, label: 'CIF (opcional)', value: cif, set: setCif, type: 'text', placeholder: 'B12345678', required: false },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg mb-10">
        <LogoIcon className="w-5 h-5" />CLOCKIN
      </Link>

      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">Crear cuenta</h1>
        <p className="text-muted-foreground text-sm text-center mb-8">Empieza gratis. Sin tarjeta de crédito.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(f => (
            <div key={f.label}>
              <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
              <div className="relative">
                <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  className="pl-9"
                  required={f.required}
                />
              </div>
            </div>
          ))}
          {error && <p className="text-destructive text-sm">{error}</p>}
          <Button type="submit" className="w-full rounded-full">Crear cuenta</Button>
        </form>

        <p className="text-sm text-center mt-6 text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-foreground font-medium hover:underline">Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
