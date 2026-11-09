import LogoIcon from '@/components/LogoIcon';
import { cn } from '@/lib/utils';

const sizes = { sm: 20, md: 26, lg: 52 } as const;

interface WordmarkProps {
  size?: keyof typeof sizes;
  variant?: 'dark' | 'light';
  bg?: string;
  className?: string;
}

export default function Wordmark({ size = 'md', variant = 'dark', bg, className }: WordmarkProps) {
  const px = sizes[size];
  return (
    <span
      className={cn('inline-flex items-center font-display font-extrabold lowercase leading-none', variant === 'light' ? 'text-primary-foreground' : 'text-foreground', className)}
      style={{ fontSize: px, letterSpacing: '-0.03em', gap: px * 0.3 }}
    >
      <LogoIcon variant={variant} bg={bg} className="flex-shrink-0" style={{ width: px * 1.1, height: px * 1.1 }} />
      clockin
    </span>
  );
}
