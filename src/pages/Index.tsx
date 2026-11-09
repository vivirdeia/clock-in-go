import { useState, useRef, useCallback, useEffect, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, ShieldCheck, Target, LayoutDashboard, Download, Fingerprint, ArrowRight, Check, Menu, X,
  FileText, MessageCircle, Sheet, Play,
} from 'lucide-react';
import Wordmark from '@/components/Wordmark';
import StreetMap from '@/components/brand/StreetMap';
import Avatar from '@/components/brand/Avatar';
import StatusPill from '@/components/brand/StatusPill';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// ==================== HELPERS ====================
function useInView<T extends Element>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/** Sección cuyas animaciones ci-drop/ci-slide arrancan al entrar en pantalla */
function RevealOnView({ className, children }: { className?: string; children: ReactNode }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const [seen, setSeen] = useState(false);
  useEffect(() => { if (inView) setSeen(true); }, [inView]);
  return <div ref={ref} className={cn(className, !seen && 'ci-wait')}>{children}</div>;
}

const tone = {
  green: 'hsl(var(--success))',
  red: 'hsl(var(--danger))',
  amber: 'hsl(var(--warning))',
};

function Pin({ name, left, top, color, delay }: { name: string; left: string; top: string; color: string; delay: string }) {
  return (
    <div className="absolute z-10" style={{ left, top, transform: 'translate(-50%, -100%)' }}>
      <div className="ci-drop flex flex-col items-center" style={{ animationDelay: delay }}>
        <span className="rounded-full bg-background" style={{ border: `3px solid ${color}` }}>
          <Avatar name={name} size={38} />
        </span>
        <span style={{ width: 3, height: 8, background: color }} />
      </div>
    </div>
  );
}

function Zone({ left, top, size }: { left: string; top: string; size: number }) {
  const style: CSSProperties = { left, top, width: size, height: size, transform: 'translate(-50%, -50%)' };
  return (
    <>
      <div className="absolute rounded-full border-2 border-brand bg-brand/[.12]" style={style} />
      <div className="absolute" style={style}>
        <div className="ci-pulse w-full h-full rounded-full border-2 border-brand bg-brand/[.12]" />
      </div>
    </>
  );
}

const Container = ({ className, children }: { className?: string; children: ReactNode }) => (
  <div className={cn('mx-auto w-full max-w-[1200px] px-6', className)}>{children}</div>
);

const H2 = ({ className, children }: { className?: string; children: ReactNode }) => (
  <h2 className={cn('font-display font-extrabold text-[clamp(2rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em]', className)}>{children}</h2>
);

// ==================== INTERACTIVE DEMO ====================
function InteractiveDemo() {
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeStr = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const startPress = useCallback(() => {
    if (confirmed) return;
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const p = Math.min((Date.now() - start) / 2000, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(intervalRef.current!);
        setConfirmed(true);
        setTimeout(() => { setConfirmed(false); setProgress(0); }, 4000);
      }
    }, 16);
  }, [confirmed]);

  const endPress = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (!confirmed) setProgress(0);
  }, [confirmed]);

  const c = 2 * Math.PI * 82;

  return (
    <div className="bg-background rounded-[38px] border p-6 w-[280px] mx-auto shadow-elevated">
      <div className="mx-auto mb-5 h-[5px] w-16 rounded-full bg-border" />
      <div className="text-center mb-6">
        <p className="text-muted-foreground text-xs mb-1">Prueba a fichar</p>
        <p className="font-display font-extrabold text-[44px] leading-none tabular-nums tracking-[-0.03em]">{timeStr}</p>
      </div>
      <div className="flex justify-center mb-5">
        <div className="relative w-[180px] h-[180px]">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="82" fill="none" className="stroke-secondary" strokeWidth="7" />
            <circle cx="90" cy="90" r="82" fill="none" className={confirmed ? 'stroke-success' : 'stroke-brand'} strokeWidth="7"
              strokeDasharray={c} strokeDashoffset={c * (1 - progress)} strokeLinecap="round"
              style={{ transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear' }} />
          </svg>
          <button
            onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
            onTouchStart={startPress} onTouchEnd={endPress}
            aria-label="Mantén pulsado para fichar"
            className={cn('absolute inset-[22px] rounded-full flex items-center justify-center text-primary-foreground transition-all select-none touch-none',
              confirmed ? 'bg-success' : 'bg-primary')}
            style={{ transform: progress > 0 && !confirmed ? 'scale(1.06)' : 'scale(1)' }}
          >
            {confirmed ? <Check className="w-12 h-12" /> : <Fingerprint className="w-12 h-12" />}
          </button>
        </div>
      </div>
      <div className="h-8 flex items-center justify-center">
        {confirmed ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success-tint text-success-ink px-3 py-1 text-sm font-semibold animate-fade-in-up">
            <Check className="w-4 h-4" />Entrada registrada · {timeStr}
          </span>
        ) : (
          <p className="text-sm font-medium text-muted-foreground">Mantén pulsado para fichar</p>
        )}
      </div>
    </div>
  );
}

// ==================== HERO VISUAL ====================
function HeroVisual() {
  return (
    <div className="relative w-full max-w-[540px] h-[580px] mx-auto">
      {/* a) Mapa */}
      <div className="absolute right-0 top-10 w-[76%] h-[470px] rounded-[32px] border shadow-elevated overflow-hidden">
        <StreetMap focusX={330} focusY={290} className="w-full h-full">
          <Zone left="50%" top="50%" size={220} />
          <Pin name="Lucía F." left="46%" top="34%" color={tone.green} delay=".3s" />
          <Pin name="Carlos M." left="60%" top="50%" color={tone.green} delay=".9s" />
          <Pin name="Ana T." left="38%" top="56%" color={tone.green} delay="1.5s" />
          <Pin name="Jorge P." left="80%" top="18%" color={tone.red} delay="2.1s" />
          <span className="ci-blink absolute z-20 h-6 px-2.5 rounded-full bg-danger text-danger-foreground text-[11px] font-semibold inline-flex items-center"
            style={{ left: '66%', top: '9%', transform: 'translateX(-50%)' }}>Fuera de zona</span>
        </StreetMap>
      </div>

      {/* b) Móvil */}
      <div className="ci-float absolute left-0 top-[70px] w-[240px] rounded-[38px] bg-background border shadow-elevated p-5 z-20">
        <div className="mx-auto mb-4 h-[5px] w-16 rounded-full bg-border" />
        <p className="text-center text-xs text-muted-foreground">Hola, Lucía</p>
        <p className="text-center font-display font-extrabold text-[46px] leading-none tabular-nums tracking-[-0.03em] mb-4">08:57</p>
        <div className="relative mx-auto w-[172px] h-[172px]">
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 172 172">
            <circle cx="86" cy="86" r="80" fill="none" className="stroke-secondary" strokeWidth="7" />
            <circle cx="86" cy="86" r="80" fill="none" className="stroke-brand ci-ring" strokeWidth="7" strokeDasharray="503" strokeLinecap="round" />
          </svg>
          <div className="ci-press absolute inset-0 m-auto w-[136px] h-[136px] rounded-full bg-primary flex items-center justify-center">
            <Fingerprint className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
        <div className="relative h-8 mt-4">
          <span className="ci-hint absolute inset-0 flex items-center justify-center text-[13px] font-medium text-muted-foreground">Mantén pulsado para fichar</span>
          <span className="ci-toast absolute inset-0 flex items-center justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-tint text-success-ink px-3 py-1 text-[13px] font-semibold">
              <Check className="w-3.5 h-3.5" />Entrada registrada
            </span>
          </span>
        </div>
      </div>

      {/* c) Notificación */}
      <div className="ci-float2 absolute right-[-6px] top-0 w-[250px] rounded-[18px] bg-background border shadow-elevated p-3 flex items-center gap-3 z-30">
        <Avatar name="Lucía F." size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Lucía ha fichado</p>
          <p className="text-xs text-muted-foreground truncate">Entrada 08:57 · Oficina Central</p>
        </div>
        <span className="w-[26px] h-[26px] rounded-full bg-success flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-success-foreground" />
        </span>
      </div>

      {/* d) Tarjeta negra */}
      <div className="ci-float absolute right-7 bottom-0 w-[240px] rounded-[18px] bg-primary text-primary-foreground p-4 shadow-elevated z-30" style={{ animationDelay: '-3s' }}>
        <p className="text-[13px] text-subtle">Trabajando ahora</p>
        <p className="font-display font-extrabold text-[26px] tabular-nums mb-3">16 <span className="text-sm text-subtle">/ 22</span></p>
        <div className="h-2 rounded-full bg-graphite overflow-hidden">
          <div className="ci-grow h-full rounded-full bg-brand" style={{ width: '73%' }} />
        </div>
      </div>
    </div>
  );
}

// ==================== LIVE TICKER ====================
const liveItems = [
  { name: 'Carlos M.', text: 'Entrada 08:01 · Oficina Central', ok: true },
  { name: 'Ana T.', text: 'Entrada 08:03 · Oficina Central', ok: true },
  { name: 'Lucía F.', text: 'Entrada 08:12 · Calle de Serrano', ok: false },
  { name: 'Jorge P.', text: 'Entrada 08:18 · Oficina Satélite', ok: true },
  { name: 'Óscar M.', text: 'Entrada 08:20 · Almacén Norte', ok: true },
  { name: 'Roberto H.', text: 'Entrada 08:58 · Oficina Central', ok: true },
];

function LiveTicker() {
  return (
    <section className="border-y bg-panel py-[18px] overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-6 pr-4 bg-panel">
        <span className="inline-flex items-center gap-2 h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold whitespace-nowrap">
          <span className="ci-blink w-2 h-2 rounded-full bg-success" />En directo
        </span>
      </div>
      <div className="ci-marquee flex w-max gap-3 pl-40">
        {[...liveItems, ...liveItems].map((it, i) => (
          <div key={i} aria-hidden={i >= liveItems.length} className="h-[52px] flex items-center gap-3 rounded-full bg-background border pl-2 pr-3 whitespace-nowrap">
            <Avatar name={it.name} size={36} />
            <span className="text-sm font-semibold">{it.name}</span>
            <span className="text-sm text-muted-foreground">{it.text}</span>
            <StatusPill variant={it.ok ? 'in' : 'outzone'}>{it.ok ? 'En zona' : 'Fuera de zona'}</StatusPill>
          </div>
        ))}
      </div>
    </section>
  );
}

// ==================== VIDEO ====================
function VideoSection() {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || failed) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (inView && !reduce) v.play().catch(() => {});
    else v.pause();
  }, [inView, failed]);

  return (
    <section id="video" className="pt-6 pb-24">
      <Container className="text-center">
        <p className="text-brand text-sm font-semibold uppercase tracking-[.08em] mb-3">En 30 segundos</p>
        <H2 className="mb-10">Mira ClockIn en acción</H2>
        <div ref={ref} className="relative mx-auto max-w-[960px] aspect-video rounded-[28px] overflow-hidden border shadow-elevated bg-primary">
          {failed ? (
            <div className="absolute inset-0 flex items-center justify-center"><Wordmark size="lg" variant="light" /></div>
          ) : (
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" src="/video/clockin-30s-720-mudo.mp4"
              poster="/video/clockin-30s-poster.jpg" muted loop playsInline preload="metadata" onError={() => setFailed(true)} />
          )}
          <button onClick={() => setOpen(true)}
            className="absolute inset-0 m-auto w-[72px] h-[72px] rounded-full bg-background text-foreground flex items-center justify-center shadow-elevated hover:scale-105 transition-transform">
            <Play className="w-7 h-7 ml-1" fill="currentColor" />
            <span className="sr-only">Ver con sonido</span>
          </button>
        </div>
      </Container>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-primary border-0 rounded-[28px]">
          <DialogTitle className="sr-only">Mira ClockIn en acción</DialogTitle>
          {open && (
            <video controls autoPlay className="w-full aspect-video" src="/video/clockin-30s.mp4" poster="/video/clockin-30s-poster.jpg">
              <track kind="subtitles" srcLang="es" label="Español" src="/video/clockin-30s.vtt" default />
            </video>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

// ==================== PRICING ====================
function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    { name: 'Starter', desc: 'Hasta 5 empleados', price: 0, dark: false,
      features: ['Fichaje con GPS y anti-fraude', 'Panel básico', 'Historial de 30 días', '1 zona de fichaje'], cta: 'Empezar gratis' },
    { name: 'Business', desc: 'Hasta 25 empleados', price: annual ? 23 : 29, dark: true,
      features: ['Todo lo de Starter', 'Historial ilimitado', 'Departamentos y turnos', 'Zonas ilimitadas y avisos', 'Informes CSV y PDF'], cta: 'Probar 14 días gratis' },
    { name: 'Enterprise', desc: 'Hasta 100 empleados', price: annual ? 47 : 59, dark: false,
      features: ['Todo lo de Business', 'Varios centros de trabajo', 'API y webhooks', 'Marca blanca y soporte dedicado'], cta: 'Empezar con Enterprise' },
  ];

  return (
    <section id="precios" className="py-24">
      <Container>
        <div className="text-center mb-12">
          <H2 className="mb-3">Precios claros, sin permanencia</H2>
          <p className="text-muted-foreground text-lg">Paga por lo que usas. Cambia de plan cuando quieras.</p>
          <div className="inline-flex items-center gap-1 mt-8 p-1 rounded-full bg-secondary">
            {[{ v: false, l: 'Mensual' }, { v: true, l: 'Anual' }].map(o => (
              <button key={o.l} onClick={() => setAnnual(o.v)}
                className={cn('h-10 px-5 rounded-full text-sm font-semibold inline-flex items-center gap-2 transition-colors',
                  annual === o.v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {o.l}
                {o.v && <span className="rounded-full bg-brand-tint text-brand-ink text-xs px-2 py-0.5">-20%</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.name} className={cn('rounded-[24px] p-8 flex flex-col', plan.dark ? 'bg-primary text-primary-foreground' : 'bg-background border')}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-display font-extrabold text-2xl tracking-[-0.02em]">{plan.name}</h3>
                {plan.dark && <span className="rounded-full bg-brand-tint text-brand-ink text-xs font-semibold px-3 py-1">El más elegido</span>}
              </div>
              <p className={cn('text-sm mb-6', plan.dark ? 'text-subtle-light' : 'text-muted-foreground')}>{plan.desc}</p>
              <div className="mb-6">
                <span className="font-display font-extrabold text-5xl tabular-nums tracking-[-0.03em]">{plan.price} €</span>
                <span className={plan.dark ? 'text-subtle-light' : 'text-muted-foreground'}> /mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px]">
                    <Check className={cn('w-4 h-4 mt-1 flex-shrink-0', plan.dark ? 'text-primary-foreground' : 'text-foreground')} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.dark ? 'brand' : 'outline'} size="lg" className="w-full h-[52px] text-base" asChild>
                <Link to="/register">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">¿Más de 100 empleados? <a href="mailto:hola@clockin.es" className="underline text-foreground">Contacta con nosotros</a> para un plan a medida.</p>
      </Container>
    </section>
  );
}

// ==================== DATA ====================
const navLinks = [
  { href: '#caracteristicas', label: 'Características' },
  { href: '#precios', label: 'Precios' },
  { href: '#testimonios', label: 'Testimonios' },
];

const faqs = [
  { q: '¿Necesita el empleado descargar una app?', a: 'No. ClockIn es una PWA (Progressive Web App). El empleado recibe un link, lo abre en el móvil, y se instala como una app con un toque. Sin App Store, sin Google Play, sin actualizaciones.' },
  { q: '¿Funciona sin internet?', a: 'El fichaje necesita conexión para registrar el GPS. Pero funciona con datos móviles (no necesita WiFi). Si no hay cobertura en ese momento, el fichaje se encola y se envía cuando recupera conexión.' },
  { q: '¿Es legal fichar por GPS?', a: 'Sí, siempre que informes al empleado (lo cual cumplimos en el onboarding de la app). El fichaje registra la ubicación solo en el momento del fichaje, no rastrea continuamente. Esto es conforme con el RGPD y la ley de control horario española.' },
  { q: '¿Se puede falsear el fichaje?', a: 'Es muy difícil. La pulsación larga de 2 segundos con vibración y sonido impide automatizarlo. El GPS se obtiene del dispositivo en tiempo real. Y el geofencing alerta si alguien ficha fuera de la zona permitida.' },
  { q: '¿Cuánto tarda en implantarse?', a: '10 minutos. Creas la cuenta, añades los empleados (nombre + email), configuras los turnos y las zonas, y les envías el link. Listo.' },
  { q: '¿Puedo exportar los datos para la gestoría?', a: 'Sí. Exporta reportes en CSV o PDF con todos los fichajes, horas trabajadas, retrasos y ausencias. Listo para tu gestoría o para una inspección.' },
  { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencia. Si cancelas, tu cuenta baja al plan Starter gratuito (hasta 5 empleados).' },
];

// ==================== LANDING PAGE ====================
const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* 1) NAV */}
      <nav className="sticky top-0 z-50 bg-background border-b">
        <Container className="flex items-center justify-between h-[72px]">
          <Link to="/" aria-label="ClockIn, inicio"><Wordmark size="md" /></Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => <a key={l.href} href={l.href} className="text-[15px] font-medium text-foreground hover:text-brand transition-colors">{l.label}</a>)}
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" className="h-11 px-5 text-[15px]" asChild><Link to="/login">Iniciar sesión</Link></Button>
            <Button className="h-11 px-5 text-[15px]" asChild><Link to="/register">Empezar gratis</Link></Button>
          </div>
          <button className="md:hidden p-2 -mr-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menú">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </Container>
        {menuOpen && (
          <div className="md:hidden border-t bg-background px-6 py-4 space-y-1">
            {navLinks.map(l => <a key={l.href} href={l.href} className="block py-2 text-[15px] font-medium" onClick={() => setMenuOpen(false)}>{l.label}</a>)}
            <div className="flex gap-2 pt-3">
              <Button variant="outline" className="h-11 flex-1" asChild><Link to="/login">Iniciar sesión</Link></Button>
              <Button className="h-11 flex-1" asChild><Link to="/register">Empezar gratis</Link></Button>
            </div>
          </div>
        )}
      </nav>

      {/* 2) HERO */}
      <section className="pt-[72px] pb-[88px]">
        <Container className="flex flex-wrap items-center gap-14">
          <div className="flex-1 basis-[420px] min-w-0 flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 h-[34px] px-4 rounded-full bg-brand-tint text-brand-ink text-sm font-semibold">
              <MapPin className="w-4 h-4" />+2.100 empresas fichan con ClockIn
            </span>
            <h1 className="font-display font-extrabold text-[clamp(2.6rem,5.5vw,4.6rem)] tracking-[-0.03em] leading-[1.02]">
              Tu equipo ficha en un toque. <span className="text-brand">Tú, tranquilo.</span>
            </h1>
            <p className="text-[19px] leading-relaxed text-muted-foreground max-w-[560px]">
              Cada fichaje llega con hora exacta y ubicación GPS. Sabes quién está, dónde y desde cuándo, sin aparatos ni instalaciones: una app en el móvil y listo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button className="h-[54px] px-7 text-base gap-2" asChild><Link to="/register">Empezar gratis <ArrowRight className="w-4 h-4" /></Link></Button>
              <Button variant="outline" className="h-[54px] px-7 text-base" asChild><a href="#video">Ver demo</a></Button>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {['Gratis hasta 5 empleados', 'Listo en 10 minutos', 'Conforme RD-ley 8/2019'].map(t => (
                <span key={t} className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                  <Check className="w-4 h-4 text-foreground" />{t}
                </span>
              ))}
            </div>
          </div>
          <div className="flex-1 basis-[420px] min-w-0">
            <div className="origin-top scale-[.72] -mb-[160px] sm:scale-100 sm:mb-0">
              <HeroVisual />
            </div>
          </div>
        </Container>
      </section>

      {/* 3) EN DIRECTO */}
      <LiveTicker />

      {/* 4) PROBLEMA */}
      <section className="bg-secondary py-[88px]">
        <Container>
          <p className="text-muted-foreground text-sm uppercase tracking-[.08em] font-semibold mb-3">Lo de siempre</p>
          <H2 className="mb-10">¿Tu equipo ficha así?</H2>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {[
              { icon: FileText, title: 'Papel y bolígrafo', desc: 'Hojas de firma que nadie revisa. Imposible saber quién llegó tarde de verdad.' },
              { icon: MessageCircle, title: 'WhatsApp', desc: '"Ya estoy" a las 8:03, enviado desde el metro. Sin prueba real.' },
              { icon: Sheet, title: 'Excel', desc: 'Se rellena a final de mes, de memoria. Datos que no te sirven ante una inspección.' },
            ].map(item => (
              <div key={item.title} className="bg-background rounded-[20px] p-7">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5 text-muted-foreground"><item.icon className="w-6 h-6" /></div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-[18px]">Con ClockIn, cada fichaje tiene <strong>hora exacta, ubicación GPS y verificación anti-fraude.</strong></p>
        </Container>
      </section>

      {/* 5) CÓMO FUNCIONA */}
      <section id="demo" className="py-24">
        <Container>
          <H2 className="text-center mb-14">Así de fácil, en 3 pasos</H2>
          <div className="grid md:grid-cols-3 gap-10 mb-16">
            {[
              { n: '1', title: 'Abre la app', desc: 'Se instala desde un enlace, sin App Store ni Google Play. El empleado solo ve un botón.' },
              { n: '2', title: 'Mantiene pulsado 2 segundos', desc: 'Con vibración y sonido, para que cada fichaje sea intencionado y verificable.' },
              { n: '3', title: 'Queda registrado con hora y GPS', desc: 'Con dirección legible. Si alguien ficha fuera de su zona, te llega un aviso.' },
            ].map(s => (
              <div key={s.n}>
                <p className="font-display font-extrabold text-[64px] leading-none tracking-[-0.03em] mb-4">{s.n}</p>
                <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
          <InteractiveDemo />
        </Container>
      </section>

      {/* 6) VÍDEO */}
      <VideoSection />

      {/* 7) MAPA DEL EQUIPO */}
      <section className="pt-6 pb-24">
        <Container className="flex flex-wrap items-center gap-14">
          <div className="flex-1 basis-[380px] min-w-0">
            <p className="text-brand text-sm font-semibold uppercase tracking-[.08em] mb-3">Mapa en tiempo real</p>
            <H2 className="mb-5">Todo tu equipo, de un vistazo</H2>
            <p className="text-[17px] text-muted-foreground mb-8">Cada fichaje aparece en el mapa al momento, con su zona de trabajo alrededor. Sabes quién está en su sitio sin hacer una sola llamada.</p>
            <ul className="space-y-5">
              {[
                { c: 'bg-success', t: 'Dentro de su zona', d: 'El fichaje se valida solo y queda guardado con hora y dirección.' },
                { c: 'bg-warning', t: 'Llega tarde', d: 'Te avisamos si se pasa del margen que tú definas para su turno.' },
                { c: 'bg-danger', t: 'Fuera de zona', d: 'Recibes una alerta con la dirección exacta para que decidas.' },
              ].map(i => (
                <li key={i.t} className="flex gap-4">
                  <span className={cn('mt-1 w-[22px] h-[22px] rounded-full border-4 border-background flex-shrink-0', i.c)} style={{ boxShadow: '0 0 0 1px hsl(var(--border))' }} />
                  <div>
                    <p className="font-semibold">{i.t}</p>
                    <p className="text-muted-foreground text-[15px]">{i.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <RevealOnView className="flex-1 basis-[380px] min-w-0">
            <div className="relative h-[460px] rounded-[32px] border shadow-elevated overflow-hidden">
              <StreetMap focusX={450} focusY={300} className="w-full h-full">
                <Zone left="30%" top="46%" size={190} />
                <div className="absolute rounded-full border-2 border-brand bg-brand/[.12]" style={{ left: '70%', top: '66%', width: 150, height: 150, transform: 'translate(-50%,-50%)' }} />
                <span className="absolute z-20 left-6 top-5 rounded-full bg-background shadow-elevated px-3 py-1.5 text-xs font-semibold">Oficina Central</span>
                <span className="absolute z-20 right-6 bottom-5 rounded-full bg-background shadow-elevated px-3 py-1.5 text-xs font-semibold">Almacén Norte</span>
                <Pin name="Carlos M." left="24%" top="34%" color={tone.green} delay=".2s" />
                <Pin name="Ana T." left="32%" top="48%" color={tone.green} delay=".6s" />
                <Pin name="Roberto H." left="20%" top="52%" color={tone.green} delay="1s" />
                <Pin name="Laura M." left="35%" top="30%" color={tone.amber} delay="1.4s" />
                <Pin name="Óscar M." left="68%" top="58%" color={tone.green} delay="1.8s" />
                <Pin name="Sara V." left="74%" top="68%" color={tone.green} delay="2.2s" />
                <Pin name="Lucía F." left="56%" top="20%" color={tone.red} delay="2.6s" />
                <div className="ci-slide absolute z-30 rounded-2xl bg-background shadow-elevated p-3 max-w-[calc(42%-8px)] sm:max-w-none"
                  style={{ left: '58%', top: '7%', animationDelay: '3s' }}>
                  <p className="flex items-center gap-2 text-[13px] font-semibold text-danger-ink"><span className="ci-blink w-2 h-2 rounded-full bg-danger" />Fuera de zona</p>
                  <p className="text-xs text-muted-foreground">Lucía F. · Calle de Serrano 20</p>
                </div>
              </StreetMap>
            </div>
          </RevealOnView>
        </Container>
      </section>

      {/* 8) CARACTERÍSTICAS */}
      <section id="caracteristicas" className="bg-primary text-primary-foreground py-24">
        <Container>
          <H2 className="max-w-[640px] mb-12">Todo lo que necesitas para controlar la jornada</H2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Fingerprint, title: 'Fichaje en un toque', desc: 'Un solo botón, sin menús ni formularios. Fichar lleva 2 segundos.' },
              { icon: MapPin, title: 'GPS en cada fichaje', desc: 'Coordenadas y dirección legible en cada registro.' },
              { icon: ShieldCheck, title: 'Anti-fraude', desc: 'Pulsación larga con vibración y sonido: cada fichaje lo hace una persona real.' },
              { icon: Target, title: 'Zonas de fichaje', desc: 'Define dónde se puede fichar y recibe un aviso si alguien ficha fuera.' },
              { icon: LayoutDashboard, title: 'Panel en tiempo real', desc: 'Quién ha fichado, dónde y cuándo. Departamentos, turnos, avisos e informes.' },
              { icon: Download, title: 'Informes para tu gestoría', desc: 'Exporta en CSV o PDF horas, retrasos y ausencias, listos para entregar.' },
            ].map(f => (
              <div key={f.title} className="rounded-[20px] border border-graphite p-7">
                <f.icon className="w-7 h-7 text-primary-foreground mb-5" />
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-subtle">{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 9) PRECIOS */}
      <PricingSection />

      {/* 10) TESTIMONIOS */}
      <section id="testimonios" className="bg-secondary py-24">
        <Container>
          <H2 className="mb-12">Lo que cuentan nuestros clientes</H2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { text: 'Tenemos 3 restaurantes y 22 empleados con turnos rotativos. Ahora sé en tiempo real, desde el móvil, quién ha llegado a su turno.', author: 'Pedro García', role: 'Propietario de 3 restaurantes' },
              { text: 'Con 4 obras a la vez, las zonas de fichaje nos confirman que cada persona ficha en su obra. En la última inspección todo estaba en orden.', author: 'Marta López', role: 'RRHH en Construmax SL' },
              { text: 'Lo probamos un lunes y el martes ya lo usaba todo el equipo. Abres el móvil, pulsas y listo.', author: 'Javier Ruiz', role: 'Gerente de Ópticas Ruiz' },
            ].map(t => (
              <div key={t.author} className="bg-background rounded-[20px] p-7 flex flex-col justify-between gap-6">
                <p className="text-base leading-[1.6]">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <Avatar name={t.author} size={44} />
                  <div>
                    <p className="text-[15px] font-semibold">{t.author}</p>
                    <p className="text-[13px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* 11) FAQ */}
      <section className="py-24">
        <Container className="max-w-[820px]">
          <H2 className="text-center mb-10">Preguntas frecuentes</H2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border rounded-[20px] px-6 bg-background">
                <AccordionTrigger className="text-left text-[17px] font-semibold hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[15px] leading-relaxed">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Container>
      </section>

      {/* 12) CTA FINAL */}
      <section className="py-24">
        <Container>
          <div className="rounded-[32px] bg-brand-dark text-primary-foreground text-center px-6 py-16 sm:px-8">
            <h2 className="font-display font-extrabold text-[clamp(2rem,4.5vw,3.4rem)] leading-[1.05] tracking-[-0.03em] mb-4">Mañana tu equipo ya ficha con ClockIn</h2>
            <p className="text-[18px] text-brand-tint mb-8">10 minutos de configuración. Gratis para siempre hasta 5 empleados.</p>
            <Button className="h-14 px-8 text-base gap-2" asChild><Link to="/register">Crear mi cuenta gratis <ArrowRight className="w-4 h-4" /></Link></Button>
          </div>
        </Container>
      </section>

      {/* 13) FOOTER */}
      <footer className="border-t py-10">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <Wordmark size="sm" />
              <span className="text-sm text-muted-foreground">Fichaje con GPS para pymes</span>
            </div>
            <div className="flex flex-wrap gap-5">
              {['Privacidad', 'Términos', 'RGPD', 'Cookies'].map(l => <a key={l} href="#" className="text-sm text-muted-foreground hover:text-foreground">{l}</a>)}
            </div>
          </div>
          <div className="border-t pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ClockIn</p>
            <div className="flex flex-wrap gap-2">
              {['Conforme RD-ley 8/2019', 'RGPD', 'SSL'].map(b => (
                <span key={b} className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">{b}</span>
              ))}
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
