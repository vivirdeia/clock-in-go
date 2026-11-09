import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Wordmark from '@/components/Wordmark';
import { Button } from '@/components/ui/button';
import { useAuth, PlanType } from '@/store/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const plans: { key: PlanType; name: string; price: number; desc: string; features: string[] }[] = [
  { key: 'starter', name: 'Starter', price: 0, desc: 'Hasta 5 empleados', features: ['Fichaje con GPS y anti-fraude', 'Panel básico', 'Historial de 30 días', '1 zona de fichaje'] },
  { key: 'business', name: 'Business', price: 29, desc: 'Hasta 25 empleados', features: ['Todo lo de Starter', 'Historial ilimitado', 'Departamentos y turnos', 'Zonas ilimitadas y avisos', 'Informes CSV y PDF'] },
  { key: 'enterprise', name: 'Enterprise', price: 59, desc: 'Hasta 100 empleados', features: ['Todo lo de Business', 'Varios centros de trabajo', 'API y webhooks', 'Marca blanca y soporte dedicado'] },
];

export default function SelectPlanPage() {
  const navigate = useNavigate();
  const { user, updatePlan } = useAuth();
  const [selected, setSelected] = useState<PlanType>('business');

  if (!user) return <Navigate to="/login" replace />;
  const current = plans.find(p => p.key === selected)!;

  const confirm = () => {
    updatePlan(selected);
    toast.success(`Plan ${current.name} activado`);
    navigate(user.needsOnboarding ? '/onboarding' : '/dashboard');
  };

  return (
    <div className="min-h-screen bg-panel px-6 py-8">
      <div className="mx-auto flex max-w-[1080px] flex-col items-center">
        <Wordmark size="md" />
        <h1 className="mt-10 text-center font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-tight tracking-[-0.03em]">Elige cómo quieres empezar</h1>
        <p className="mt-2 text-center text-[17px] text-muted-foreground">Puedes cambiar de plan cuando quieras, sin permanencia.</p>

        <div role="radiogroup" className="mt-10 grid w-full gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {plans.map(p => {
            const on = p.key === selected;
            return (
              <button
                key={p.key}
                role="radio"
                aria-checked={on}
                onClick={() => setSelected(p.key)}
                className={cn('rounded-[24px] border-2 p-7 text-left transition', on ? 'border-foreground bg-foreground text-primary-foreground shadow-elevated' : 'border-border bg-background hover:border-muted-foreground')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[22px] font-extrabold">{p.name}</p>
                    <p className={cn('text-sm', on ? 'text-[#A1A1AA]' : 'text-muted-foreground')}>{p.desc}</p>
                  </div>
                  <span className={cn('mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2', on ? 'border-brand bg-brand' : 'border-[#A1A1AA]')}>
                    {on && <span className="h-2 w-2 rounded-full bg-background" />}
                  </span>
                </div>
                <p className="mt-5"><span className="font-display text-[40px] font-extrabold tabular-nums">{p.price} €</span><span className={on ? 'text-[#A1A1AA]' : 'text-muted-foreground'}> /mes</span></p>
                <ul className="mt-5 space-y-2.5">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[15px]">
                      <Check className={cn('mt-0.5 h-4 w-4 flex-shrink-0', on ? 'text-primary-foreground' : 'text-foreground')} />{f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <Button onClick={confirm} className="mt-10 h-[52px] px-8 text-[15px]">Continuar con {current.name}</Button>
        <p className="mt-3 text-[13px] text-muted-foreground">Los planes de pago incluyen 14 días gratis</p>
      </div>
    </div>
  );
}
