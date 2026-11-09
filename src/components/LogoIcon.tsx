interface LogoIconProps {
  className?: string;
  variant?: 'dark' | 'light';
  /** Color del círculo interior en la variante light (color del fondo) */
  bg?: string;
}

export default function LogoIcon({ className = 'w-5 h-5', variant = 'dark', bg = '#0A0A0A' }: LogoIconProps) {
  const light = variant === 'light';
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M24 4c-8.3 0-15 6.5-15 14.6C9 29.5 24 44 24 44s15-14.5 15-25.4C39 10.5 32.3 4 24 4z"
        fill={light ? '#FFFFFF' : '#0A0A0A'}
      />
      <circle cx="24" cy="18.5" r="9" fill={light ? bg : '#FFFFFF'} />
      <path
        d="M19.5 18.8l3.2 3.2 5.8-6.8"
        fill="none"
        stroke={light ? '#FFFFFF' : '#2563EB'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
