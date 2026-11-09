import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type StatusVariant = 'in' | 'out' | 'absent' | 'late' | 'outzone' | 'resolved' | 'unread';

const styles: Record<StatusVariant, { cls: string; dot: string; label: string }> = {
  in: { cls: 'bg-success-tint text-success-ink', dot: 'bg-success', label: 'Trabajando' },
  out: { cls: 'bg-secondary text-muted-foreground', dot: 'bg-muted-foreground', label: 'Ha salido' },
  absent: { cls: 'bg-danger-tint text-danger-ink', dot: 'bg-danger', label: 'Sin fichar' },
  late: { cls: 'bg-warning-tint text-warning-ink', dot: 'bg-warning', label: 'Llegó tarde' },
  outzone: { cls: 'bg-danger-tint text-danger-ink', dot: 'bg-danger', label: 'Fuera de zona' },
  resolved: { cls: 'bg-success-tint text-success-ink', dot: 'bg-success', label: 'Resuelta' },
  unread: { cls: 'bg-brand text-primary-foreground', dot: 'bg-primary-foreground', label: 'Nueva' },
};

export default function StatusPill({ variant, children, className }: { variant: StatusVariant; children?: ReactNode; className?: string }) {
  const s = styles[variant];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap', s.cls, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {children ?? s.label}
    </span>
  );
}
