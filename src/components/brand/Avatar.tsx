const palette = [
  { bg: '#DBEAFE', fg: '#1E3A8A' },
  { bg: '#DCFCE7', fg: '#166534' },
  { bg: '#FEF3C7', fg: '#92400E' },
  { bg: '#EDE9FE', fg: '#5B21B6' },
  { bg: '#FFE4E6', fg: '#9F1239' },
  { bg: '#E0F2FE', fg: '#075985' },
];

export function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function initials(name: string) {
  return name.trim().split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() || '?';
}

export default function Avatar({ name, size = 36, className = '' }: { name: string; size?: number; className?: string }) {
  const c = avatarColor(name);
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0 ${className}`}
      style={{ width: size, height: size, background: c.bg, color: c.fg, fontSize: Math.round(size * 0.38) }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}
