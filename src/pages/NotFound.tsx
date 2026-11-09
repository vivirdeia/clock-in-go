import { Link } from 'react-router-dom';
import Wordmark from '@/components/Wordmark';
import StreetMap from '@/components/brand/StreetMap';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background px-6 py-6">
      <div className="mx-auto max-w-[1200px]">
        <Link to="/" aria-label="Ir al inicio"><Wordmark size="md" /></Link>
      </div>
      <main className="mx-auto mt-10 flex max-w-[720px] flex-col items-center text-center">
        <div className="relative h-[360px] w-full overflow-hidden rounded-[32px] border border-border">
          <StreetMap focusX={450} focusY={300} className="absolute inset-0" />
          <div className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center" style={{ left: '28%', top: '55%' }}>
            <div className="h-[170px] w-[170px] rounded-full border-2 border-brand" style={{ background: 'rgba(37,99,235,.12)' }} />
            <span className="absolute rounded-full bg-background px-3 py-1 text-[13px] font-semibold shadow-card">Tu zona</span>
          </div>
          <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: '76%', top: '34%' }}>
            <div className="ci-pulse absolute left-1/2 top-[26px] -ml-10 -mt-10 h-20 w-20 rounded-full bg-danger/40" />
            <div className="ci-float relative flex flex-col items-center">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-4 border-background bg-danger font-display text-lg font-extrabold text-primary-foreground shadow-elevated">?</div>
              <div className="h-3 w-1 bg-danger" />
            </div>
          </div>
        </div>
        <span className="mt-8 rounded-full bg-danger-tint px-3.5 py-1.5 text-sm font-semibold text-danger-ink">Error 404 · Fuera de zona</span>
        <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">Esta página ha fichado fuera de su zona</h1>
        <p className="mt-4 max-w-[520px] text-[17px] text-muted-foreground">La dirección que buscas no existe o se ha movido. Te llevamos de vuelta a un sitio conocido.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="h-[52px] px-7"><Link to="/">Ir al inicio</Link></Button>
          <Button asChild variant="outline" className="h-[52px] px-7"><Link to="/dashboard">Ir a mi panel</Link></Button>
        </div>
      </main>
    </div>
  );
}
