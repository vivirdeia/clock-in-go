import type { ReactNode, ComponentType } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/store/AuthContext';
import { PLAN_LIMITS } from '@/types';

type Icon = ComponentType<{ className?: string }>;

/* ---------- Tonos para iconos en tinte ---------- */
export const tints = {
  blue: 'bg-brand-tint text-brand-dark',
  green: 'bg-success-tint text-success-ink',
  amber: 'bg-warning-tint text-warning-ink',
  red: 'bg-danger-tint text-danger-ink',
  violet: 'bg-violet-tint text-violet-ink',
  gray: 'bg-secondary text-muted-foreground',
  black: 'bg-primary text-primary-foreground',
} as const;
export type Tint = keyof typeof tints;

export function IconTile({ icon: I, tint = 'gray', size = 44, className }: { icon: Icon; tint?: Tint; size?: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center justify-center rounded-[14px] flex-shrink-0', tints[tint], className)} style={{ width: size, height: size }}>
      <I className={size >= 56 ? 'w-7 h-7' : 'w-5 h-5'} />
    </span>
  );
}

/* ---------- Página ---------- */
export function PageHeader({ title, subtitle, eyebrow, actions }: { title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div className="min-w-0">
        {eyebrow && <p className="text-sm text-muted-foreground mb-1">{eyebrow}</p>}
        <h1 className="font-display font-extrabold text-[28px] sm:text-[36px] leading-[1.05] tracking-[-0.02em]">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ className, children, ...rest }: { className?: string; children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('bg-background border rounded-[20px]', className)} {...rest}>{children}</div>;
}

/* ---------- Segmentado en píldora ---------- */
export function Segmented<T extends string>({ value, onChange, options, className }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[]; className?: string;
}) {
  return (
    <div role="radiogroup" className={cn('inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-secondary', className)}>
      {options.map(o => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={cn('h-9 px-4 rounded-full text-sm font-semibold transition-colors whitespace-nowrap',
            value === o.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Cabecera de diálogo ---------- */
export function DialogHead({ icon, tint = 'blue', title, subtitle, lead }: { icon?: Icon; tint?: Tint; title: ReactNode; subtitle?: ReactNode; lead?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 pr-12">
      {lead ?? (icon && <IconTile icon={icon} tint={tint} />)}
      <div className="min-w-0">
        <DialogTitle>{title}</DialogTitle>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

export function DialogActions({ children }: { children: ReactNode }) {
  return <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">{children}</div>;
}

export function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="block text-sm font-semibold mb-1.5">{label}</span>
      {children}
    </label>
  );
}

/** Clases para inputs/selects nativos de 48px */
export const inputCls = 'w-full h-12 rounded-xl border bg-background px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-ring';
export const textareaCls = 'w-full rounded-xl border bg-background p-3.5 text-[15px] outline-none focus:ring-2 focus:ring-ring resize-none';

/* ---------- Estado vacío ---------- */
export function EmptyState({ icon, tint, title, text, action }: { icon: Icon; tint: Tint; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="border-2 border-dashed border-subtle rounded-[20px] p-10 text-center flex flex-col items-center bg-background">
      <IconTile icon={icon} tint={tint} size={56} className="mb-4 rounded-2xl" />
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-5">{text}</p>
      {action}
    </div>
  );
}

export function TryAppButton() {
  return <Button variant="outline" className="h-11" asChild><Link to="/clock">Probar la app</Link></Button>;
}

/* ---------- Diálogo de límite del plan ---------- */
type PlanKey = 'starter' | 'business' | 'enterprise';
const PLAN_INFO: Record<PlanKey, { name: string; price: number; features: string[] }> = {
  starter: { name: 'Starter', price: 0, features: [] },
  business: { name: 'Business', price: 29, features: ['Hasta 25 empleados', 'Zonas ilimitadas y avisos', 'Departamentos y turnos', 'Informes CSV y PDF'] },
  enterprise: { name: 'Enterprise', price: 59, features: ['Hasta 100 empleados', 'Varios centros de trabajo', 'API y webhooks', 'Soporte dedicado'] },
};

export function PlanLimitDialog({ open, onOpenChange, kind = 'employees', used }: {
  open: boolean; onOpenChange: (o: boolean) => void; kind?: 'employees' | 'zones'; used: number;
}) {
  const { user, updatePlan } = useAuth();
  const navigate = useNavigate();
  const current = (user?.plan ?? 'starter') as PlanKey;
  const next: PlanKey | null = current === 'starter' ? 'business' : current === 'business' ? 'enterprise' : null;
  const limit = PLAN_LIMITS[current][kind];
  const nextLimit = next ? PLAN_LIMITS[next][kind] : null;
  const noun = kind === 'employees' ? 'empleados' : 'zonas';
  const info = next ? PLAN_INFO[next] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden [&>button:last-child]:hidden">
        <div className="bg-brand-dark text-primary-foreground p-7 relative">
          <button onClick={() => onOpenChange(false)} aria-label="Cerrar"
            className="absolute right-5 top-5 w-10 h-10 rounded-full bg-background/15 hover:bg-background/25 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <span className="inline-flex rounded-full bg-background/15 px-3 py-1 text-xs font-semibold mb-4">Plan {PLAN_INFO[current].name}</span>
          <DialogTitle className="text-[28px] text-primary-foreground mb-2">Tu equipo está creciendo</DialogTitle>
          <p className="text-brand-tint text-[15px] mb-5">
            Ya tienes {used} de {limit === Infinity ? '∞' : limit} {noun}.
            {info && nextLimit != null && ` Pasa a ${info.name} para añadir hasta ${nextLimit === Infinity ? 'sin límite' : nextLimit} y desbloquear todo lo demás.`}
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {[0, 1, 2, 3, 4].map(i => <span key={i} className="h-1.5 rounded-full bg-background" />)}
          </div>
        </div>
        {info && next ? (
          <div className="p-7">
            <div className="flex items-baseline justify-between gap-3 mb-4">
              <p className="font-display font-extrabold text-[22px] tracking-[-0.02em]">{info.name}</p>
              <p><span className="font-display font-extrabold text-[32px] tabular-nums">{info.price} €</span><span className="text-muted-foreground"> /mes</span></p>
            </div>
            <ul className="grid sm:grid-cols-2 gap-2.5 mb-6">
              {info.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />{f}</li>
              ))}
            </ul>
            <Button className="w-full h-12" onClick={() => { updatePlan(next); onOpenChange(false); }}>Probar {info.name} 14 días gratis</Button>
            <p className="text-[13px] text-muted-foreground text-center mt-3">Sin permanencia. Puedes volver a {PLAN_INFO[current].name} cuando quieras.</p>
          </div>
        ) : (
          <div className="p-7">
            <Button className="w-full h-12" onClick={() => { onOpenChange(false); navigate('/dashboard/settings'); }}>Ver planes</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
