import { useState, type ReactNode, type InputHTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react';
import Wordmark from '@/components/Wordmark';
import { cn } from '@/lib/utils';

export const authInputCls =
  'h-[52px] w-full rounded-[14px] border border-border bg-background px-4 text-[15px] outline-none transition placeholder:text-muted-foreground/70 focus:border-foreground focus:ring-2 focus:ring-ring/30';

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  icon?: LucideIcon;
}

export function AuthInput({ label, icon: Icon, type, className, id, ...rest }: AuthInputProps) {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';
  const inputId = id || `f-${String(label).replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <div className={className}>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold">{label}</label>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />}
        <input
          id={inputId}
          type={isPwd && show ? 'text' : type}
          className={cn(authInputCls, Icon && 'pl-11', isPwd && 'pr-12')}
          {...rest}
        />
        {isPwd && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            className="absolute right-1.5 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
          >
            {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
          </button>
        )}
      </div>
    </div>
  );
}

interface SplitProps {
  tone: 'black' | 'blue';
  panel: ReactNode;
  children: ReactNode;
  maxW?: number;
}

/** Pantalla partida: panel de color (izq./arriba en móvil) + formulario blanco. */
export function AuthSplit({ tone, panel, children, maxW = 400 }: SplitProps) {
  return (
    <div className="flex min-h-screen flex-wrap bg-background">
      <section
        className={cn(
          'flex flex-col justify-between gap-8 p-6 text-primary-foreground sm:p-12',
          tone === 'black' ? 'bg-foreground' : 'bg-brand-dark',
        )}
        style={{ flex: '1 1 420px' }}
      >
        <Link to="/" aria-label="Ir al inicio" className="w-fit">
          <Wordmark size="md" variant="light" bg={tone === 'black' ? '#0A0A0A' : '#1D4ED8'} />
        </Link>
        <div className="max-w-[520px]">{panel}</div>
        <p className={cn('text-[13px]', tone === 'black' ? 'text-[#A1A1AA]' : 'text-brand-tint')}>Conforme RD-ley 8/2019 · RGPD</p>
      </section>
      <section className="flex items-center justify-center px-6 py-10 sm:py-12" style={{ flex: '1 1 420px' }}>
        <div className="w-full" style={{ maxWidth: maxW }}>{children}</div>
      </section>
    </div>
  );
}

export const authH1 = 'font-display font-extrabold text-[clamp(2rem,4vw,3.6rem)] leading-[1.02] tracking-[-0.03em]';
