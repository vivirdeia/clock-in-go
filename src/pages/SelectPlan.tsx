import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth, PlanType } from '@/store/AuthContext';
import { toast } from 'sonner';

export default function SelectPlanPage() {
  const navigate = useNavigate();
  const { user, updatePlan } = useAuth();
  const [annual, setAnnual] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const plans: { key: PlanType; name: string; price: number; desc: string; popular: boolean; features: string[]; cta: string }[] = [
    {
      key: 'starter', name: 'Starter', price: 0, desc: 'Hasta 5 empleados', popular: false,
      features: ['Fichaje con GPS', 'Anti-fraude (pulsación larga)', 'PWA instalable', 'Panel admin básico', 'Historial 30 días', '1 zona de geofencing', 'Branding ClockIn'],
      cta: 'Empezar gratis',
    },
    {
      key: 'business', name: 'Business', price: annual ? 23 : 29, desc: 'Hasta 25 empleados', popular: true,
      features: ['Todo lo de Starter', 'Historial ilimitado', 'Departamentos y equipos', 'Turnos configurables', 'Zonas ilimitadas', 'Alertas completas', 'Reportes CSV/PDF', 'Sin branding', 'Soporte prioritario'],
      cta: 'Seleccionar Business',
    },
    {
      key: 'enterprise', name: 'Enterprise', price: annual ? 47 : 59, desc: 'Hasta 100 empleados', popular: false,
      features: ['Todo lo de Business', 'Múltiples centros', 'API completa', 'Webhooks', 'Exportación contable', 'Calendario ausencias', 'White-label', 'Soporte dedicado'],
      cta: 'Seleccionar Enterprise',
    },
  ];

  const selectPlan = (plan: PlanType) => {
    if (plan !== 'starter') {
      toast.info('En producción se conectaría con Stripe para el pago. Se activa como demo.');
    }
    updatePlan(plan);
    toast.success(`Plan ${plan.charAt(0).toUpperCase() + plan.slice(1)} activado`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6">
      <div className="flex items-center gap-2 font-bold text-lg mt-8 mb-10">
        <Clock className="w-5 h-5" />CLOCKIN
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Elige tu plan</h1>
      <p className="text-muted-foreground text-center mb-6">Puedes cambiarlo en cualquier momento.</p>

      <div className="flex items-center gap-3 mb-8">
        <span className={annual ? 'text-muted-foreground' : 'font-medium'}>Mensual</span>
        <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-foreground' : 'bg-border'}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
        </button>
        <span className={annual ? 'font-medium' : 'text-muted-foreground'}>Anual <Badge variant="secondary" className="ml-1 text-xs">-20%</Badge></span>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl w-full">
        {plans.map(plan => (
          <div key={plan.key} className={`rounded-xl border p-6 relative ${plan.popular ? 'border-foreground shadow-elevated' : ''}`}>
            {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>}
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
            <div className="mb-6">
              <span className="text-4xl font-bold">€{plan.price}</span>
              <span className="text-muted-foreground">/mes</span>
            </div>
            <ul className="space-y-2 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={plan.popular ? 'default' : 'outline'}
              className="w-full rounded-full gap-2"
              size="lg"
              onClick={() => selectPlan(plan.key)}
            >
              {plan.cta} <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
