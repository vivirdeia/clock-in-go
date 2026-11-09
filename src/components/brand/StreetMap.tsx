import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StreetMapProps {
  focusX?: number;
  focusY?: number;
  scale?: number;
  className?: string;
  children?: ReactNode;
}

/** Mapa ilustrado (900x600) centrado en (focusX, focusY). Los children se posicionan relativos al centro del contenedor. */
export default function StreetMap({ focusX = 330, focusY = 290, scale = 1, className, children }: StreetMapProps) {
  return (
    <div className={cn('relative overflow-hidden', className)} style={{ background: '#EEF0F3' }}>
      <img
        src="/mapa.svg"
        alt=""
        aria-hidden="true"
        draggable={false}
        width={900}
        height={600}
        className="absolute left-1/2 top-1/2 select-none pointer-events-none"
        style={{
          width: 900,
          height: 600,
          maxWidth: 'none',
          transformOrigin: `${focusX}px ${focusY}px`,
          transform: `translate(${-focusX}px, ${-focusY}px) scale(${scale})`,
        }}
      />
      {children}
    </div>
  );
}
