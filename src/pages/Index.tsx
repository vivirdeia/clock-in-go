import { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShieldCheck, Target, LayoutDashboard, Download, Smartphone, Fingerprint, ArrowRight, Star, Check, ChevronDown, Menu, X } from 'lucide-react';
import LogoIcon from '@/components/LogoIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// ==================== INTERACTIVE DEMO ====================
function InteractiveDemo() {
  const [progress, setProgress] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  const startPress = useCallback(() => {
    if (confirmed) return;
    setProgress(0);
    const start = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / 2000, 1);
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

  const circumference = 2 * Math.PI * 82;

  return (
    <div className="bg-background rounded-[2rem] border p-6 w-[280px] mx-auto shadow-elevated">
      <div className="text-center mb-6">
        <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase mb-1">CLOCKIN</p>
        <p className="text-4xl font-extralight tabular-nums">{timeStr}</p>
      </div>
      <div className="flex justify-center mb-4">
        <div className="relative">
          <svg className="absolute inset-0 w-[180px] h-[180px] -rotate-90" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="82" fill="none" stroke="currentColor" className="text-border" strokeWidth="4" />
            <circle cx="90" cy="90" r="82" fill="none" stroke="currentColor" className="text-success" strokeWidth="4"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} strokeLinecap="round"
              style={{ transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear' }} />
          </svg>
          <button
            onMouseDown={startPress} onMouseUp={endPress} onMouseLeave={endPress}
            onTouchStart={startPress} onTouchEnd={endPress}
            className="w-[180px] h-[180px] rounded-full gradient-clock flex items-center justify-center text-success-foreground transition-transform select-none touch-none"
            style={{ transform: progress > 0 && !confirmed ? 'scale(1.05)' : 'scale(1)' }}
          >
            {confirmed ? <Check className="w-12 h-12" /> : <Fingerprint className="w-12 h-12" />}
          </button>
        </div>
      </div>
      {confirmed ? (
        <p className="text-center text-sm text-success font-medium animate-fade-in-up">✓ Fichaje registrado — {timeStr}</p>
      ) : (
        <p className="text-center text-sm text-muted-foreground">Mantén pulsado para fichar</p>
      )}
    </div>
  );
}

// ==================== PRICING ====================
function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const plans = [
    {
      name: 'Starter', price: 0, desc: 'Hasta 5 empleados', popular: false,
      features: ['Fichaje con GPS', 'Anti-fraude (pulsación larga)', 'PWA instalable', 'Panel admin básico', 'Historial 30 días', '1 zona de geofencing', 'Branding ClockIn'],
      cta: 'Empezar gratis', outline: true,
    },
    {
      name: 'Business', price: annual ? 23 : 29, desc: 'Hasta 25 empleados', popular: true,
      features: ['Todo lo de Starter', 'Historial ilimitado', 'Departamentos y equipos', 'Turnos configurables', 'Zonas de geofencing ilimitadas', 'Alertas completas', 'Reportes exportables (CSV/PDF)', 'Sin branding ClockIn', 'Soporte prioritario'],
      cta: 'Empezar con Business', outline: false,
    },
    {
      name: 'Enterprise', price: annual ? 47 : 59, desc: 'Hasta 100 empleados', popular: false,
      features: ['Todo lo de Business', 'Múltiples centros de trabajo', 'API completa', 'Webhook para integraciones', 'Exportación contable', 'Calendario de ausencias', 'White-label total', 'Soporte dedicado'],
      cta: 'Empezar con Enterprise', outline: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-28">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Simple. Sin sorpresas.</h2>
          <p className="text-muted-foreground text-lg">Paga por lo que necesitas. Cambia o cancela cuando quieras.</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={annual ? 'text-muted-foreground' : 'font-medium'}>Mensual</span>
            <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-foreground' : 'bg-border'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={annual ? 'font-medium' : 'text-muted-foreground'}>Anual <Badge variant="secondary" className="ml-1 text-xs">-20%</Badge></span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-card border p-6 md:p-8 relative ${plan.popular ? 'border-foreground shadow-elevated' : ''}`}>
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>}
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">€{plan.price}</span>
                <span className="text-muted-foreground">/mes</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 mt-0.5 text-success flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant={plan.outline ? 'outline' : 'default'} className="w-full rounded-full" size="lg" asChild>
                <Link to="/register">{plan.cta}</Link>
              </Button>
              {plan.popular && <p className="text-center text-xs text-muted-foreground mt-3">14 días gratis · Sin tarjeta</p>}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">¿Más de 100 empleados? <a href="#" className="underline">Contacta con nosotros</a> para un plan a medida.</p>
      </div>
    </section>
  );
}

// ==================== LANDING PAGE ====================
const LandingPage = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <LogoIcon className="w-5 h-5" />CLOCKIN
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonios</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" className="rounded-full" size="sm" asChild><Link to="/login">Iniciar sesión</Link></Button>
            <Button className="rounded-full" size="sm" asChild><Link to="/register">Empezar gratis</Link></Button>
          </div>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t p-4 space-y-3 bg-background">
            <a href="#features" className="block text-sm" onClick={() => setMenuOpen(false)}>Características</a>
            <a href="#pricing" className="block text-sm" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#testimonials" className="block text-sm" onClick={() => setMenuOpen(false)}>Testimonios</a>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="rounded-full flex-1" size="sm" asChild><Link to="/login">Iniciar sesión</Link></Button>
              <Button className="rounded-full flex-1" size="sm" asChild><Link to="/register">Empezar gratis</Link></Button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
          <Badge variant="secondary" className="mb-6 text-sm px-4 py-1.5">⏱️ +2,100 empresas fichan con ClockIn</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">Fichajes con GPS.<br />Sin excusas.</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Tu equipo ficha con un toque desde el móvil. Tú sabes quién está, dónde está y a qué hora llegó. Sin hardware, sin apps complicadas, sin instalaciones. Una PWA y listo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Button size="lg" className="rounded-full text-base gap-2 gradient-primary border-0 text-primary-foreground" asChild>
              <Link to="/register">Empezar gratis <ArrowRight className="w-4 h-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full text-base" asChild>
              <a href="#demo">Ver demo</a>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-12">
            <div className="flex -space-x-2">
              {['CM', 'AT', 'MG', 'LF'].map(i => (
                <div key={i} className="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">{i}</div>
              ))}
            </div>
            <span>Más de 2,100 empresas · 24,000 empleados</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['PWA instalable', 'GPS', 'Anti-fraude', 'Sin hardware'].map(b => (
              <Badge key={b} variant="outline" className="rounded-full px-4 py-1">{b}</Badge>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">¿Tu equipo ficha así?</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: '📋', title: 'Papel y bolígrafo', desc: 'Hojas de firma que nadie revisa. Imposible saber quién llegó tarde de verdad.' },
              { icon: '📱', title: 'WhatsApp', desc: '"Ya estoy" a las 8:03 pero el mensaje lo envió desde el metro. Sin prueba real.' },
              { icon: '🖥️', title: 'Excel', desc: 'Alguien lo rellena a final de mes de memoria. Los datos no valen nada.' },
            ].map(item => (
              <div key={item.title} className="bg-background rounded-card p-6 border">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">Con ClockIn, cada fichaje tiene <strong className="text-foreground">hora exacta + ubicación GPS + verificación anti-fraude.</strong></p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 md:py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Cómo funciona</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Smartphone, step: '1', title: 'El empleado abre la app', desc: 'Abre ClockIn desde el móvil (es una PWA, se instala como una app). Ve solo un botón. Nada más.' },
              { icon: Fingerprint, step: '2', title: 'Mantiene pulsado 2 segundos', desc: 'Pulsación larga anti-fraude con vibración y sonido. No se puede fichar "sin querer" ni automatizar.' },
              { icon: MapPin, step: '3', title: 'Se registra hora + GPS', desc: 'El fichaje queda registrado con hora exacta y dirección legible. Si está fuera de la zona permitida, salta una alerta.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Paso {item.step}</span>
                <h3 className="font-bold text-lg mt-1 mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-16 md:py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Características</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Fingerprint, title: 'Fichaje en 1 toque', desc: 'El empleado solo ve un botón. Sin menús, sin formularios, sin complicaciones. Fichar tarda 2 segundos.' },
              { icon: MapPin, title: 'GPS en cada fichaje', desc: 'Cada registro incluye coordenadas y dirección legible. Sabes dónde fichó exactamente.' },
              { icon: ShieldCheck, title: 'Anti-fraude', desc: 'Pulsación larga de 2 segundos obligatoria con vibración y sonido. Imposible de automatizar o falsificar.' },
              { icon: Target, title: 'Geofencing', desc: 'Define zonas válidas de fichaje. Si alguien ficha fuera, recibes alerta.' },
              { icon: LayoutDashboard, title: 'Panel de admin completo', desc: 'Dashboard en tiempo real: quién fichó, dónde, cuándo. Departamentos, turnos, alertas y reportes.' },
              { icon: Download, title: 'PWA instalable', desc: 'Se instala en el móvil sin App Store ni Google Play. Un link y listo. Funciona en Android y iPhone.' },
            ].map(item => (
              <div key={item.title} className="bg-background rounded-card p-6 border">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4"><item.icon className="w-5 h-5" /></div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO */}
      <section id="demo" className="py-16 md:py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Pruébalo ahora</h2>
          <p className="text-muted-foreground mb-10">Así de simple es fichar para tu equipo.</p>
          <InteractiveDemo />
        </div>
      </section>

      {/* FOR WHO */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Para quién es</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Restaurantes y hostelería', desc: 'Equipos con turnos rotativos. Saber quién llegó, a qué hora, y en qué local.' },
              { title: 'Construcción y obras', desc: 'Empleados en distintas obras. Geofencing para verificar que fichan en la obra correcta.' },
              { title: 'Comercio y retail', desc: 'Tiendas con varios empleados. Control de puntualidad y horas trabajadas.' },
              { title: 'Oficinas y servicios', desc: 'Equipos presenciales o híbridos. Registro limpio para cumplir con la ley de fichaje.' },
            ].map(item => (
              <div key={item.title} className="bg-background rounded-card p-6 border">
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEGAL */}
      <section className="py-16 md:py-20">
        <div className="container text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Cumple con la ley de control horario</h2>
          <p className="text-muted-foreground mb-6">
            Desde 2019, todas las empresas en España están obligadas a registrar la jornada laboral de sus empleados (Real Decreto-ley 8/2019). ClockIn genera un registro digital inmutable con hora y ubicación, listo para cualquier inspección.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="outline" className="rounded-full px-4 py-1.5">✓ Conforme con RD-ley 8/2019</Badge>
            <Badge variant="outline" className="rounded-full px-4 py-1.5">✓ RGPD compliant</Badge>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingSection />

      {/* TESTIMONIALS */}
      <section id="testimonials" className="py-16 md:py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Lo que dicen nuestros clientes</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { text: 'Tenemos 3 restaurantes y 22 empleados con turnos rotativos. Antes del ClockIn era imposible saber si alguien llegaba tarde a su turno o no. Ahora lo sé en tiempo real desde el móvil.', author: 'Pedro García', role: 'Propietario de 3 restaurantes' },
              { text: 'Somos una constructora con 4 obras simultáneas. El geofencing nos permite verificar que cada empleado ficha en la obra correcta. Tuvimos una inspección y el inspector quedó impresionado.', author: 'Marta López', role: 'RRHH en Construmax SL' },
              { text: 'Lo probamos un lunes y el martes ya lo usaba todo el equipo. Así de fácil. El empleado abre el móvil, pulsa el botón y ya. Lo mejor que hemos hecho este año.', author: 'Javier Ruiz', role: 'Gerente de Ópticas Ruiz' },
            ].map(t => (
              <div key={t.author} className="bg-background rounded-card p-6 border">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-warning text-warning" />)}</div>
                <p className="text-sm mb-4 leading-relaxed">"{t.text}"</p>
                <p className="font-bold text-sm">{t.author}</p>
                <p className="text-muted-foreground text-xs">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Preguntas frecuentes</h2>
          <Accordion type="single" collapsible className="w-full">
            {[
              { q: '¿Necesita el empleado descargar una app?', a: 'No. ClockIn es una PWA (Progressive Web App). El empleado recibe un link, lo abre en el móvil, y se instala como una app con un toque. Sin App Store, sin Google Play, sin actualizaciones.' },
              { q: '¿Funciona sin internet?', a: 'El fichaje necesita conexión para registrar el GPS. Pero funciona con datos móviles (no necesita WiFi). Si no hay cobertura en ese momento, el fichaje se encola y se envía cuando recupera conexión.' },
              { q: '¿Es legal fichar por GPS?', a: 'Sí, siempre que informes al empleado (lo cual cumplimos en el onboarding de la app). El fichaje registra la ubicación solo en el momento del fichaje, no rastrea continuamente. Esto es conforme con el RGPD y la ley de control horario española.' },
              { q: '¿Se puede falsear el fichaje?', a: 'Es muy difícil. La pulsación larga de 2 segundos con vibración y sonido impide automatizarlo. El GPS se obtiene del dispositivo en tiempo real. Y el geofencing alerta si alguien ficha fuera de la zona permitida.' },
              { q: '¿Cuánto tarda en implantarse?', a: '10 minutos. Creas la cuenta, añades los empleados (nombre + email), configuras los turnos y las zonas, y les envías el link. Listo.' },
              { q: '¿Puedo exportar los datos para la gestoría?', a: 'Sí. Exporta reportes en CSV o PDF con todos los fichajes, horas trabajadas, retrasos y ausencias. Listo para tu gestoría o para una inspección.' },
              { q: '¿Puedo cancelar cuando quiera?', a: 'Sí. Sin permanencia. Si cancelas, tu cuenta baja al plan Starter gratuito (hasta 5 empleados).' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-16 md:py-20 gradient-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Tu equipo ficha mañana con ClockIn</h2>
          <p className="opacity-80 mb-8 text-lg">10 minutos de setup. Gratis para siempre hasta 5 empleados.</p>
          <Button size="lg" className="rounded-full text-base gap-2 bg-success hover:bg-success/90 text-success-foreground border-0" asChild>
            <Link to="/register">Crear mi cuenta gratis <ArrowRight className="w-4 h-4" /></Link>
          </Button>
          <p className="mt-6 text-sm opacity-60">2,100+ empresas · 24,000+ empleados · 0 hardware necesario</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t">
        <div className="container">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4"><Clock className="w-5 h-5" />CLOCKIN</div>
              <p className="text-sm text-muted-foreground">Fichaje con GPS para PYMEs. Simple, legal y sin hardware.</p>
            </div>
            {[
              { title: 'Producto', links: ['Características', 'Pricing', 'Demo', 'Changelog'] },
              { title: 'Recursos', links: ['Centro de ayuda', 'Guías', 'API Docs'] },
              { title: 'Legal', links: ['Privacidad', 'Términos', 'RGPD', 'Cookies'] },
              { title: 'Compañía', links: ['Sobre nosotros', 'Contacto', 'Twitter', 'LinkedIn'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-bold text-sm mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} ClockIn. Todos los derechos reservados.</p>
            <div className="flex gap-3">
              {['Conforme RD-ley 8/2019', 'RGPD', 'SSL'].map(b => (
                <Badge key={b} variant="outline" className="text-xs">{b}</Badge>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
