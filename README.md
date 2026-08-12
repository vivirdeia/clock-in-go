# FICHAJES EMPLEADOS

Crea una plantilla completa de micro SaaS llamada "ClockIn" — una plataforma de fichaje de empleados con geolocalización GPS para PYMEs. El empleado abre la app en su móvil, pulsa un botón y ficha. Se registra la hora exacta y la ubicación GPS. El administrador ve quién ha fichado, dónde, a qué hora, y tiene un panel completo con departamentos, alertas y reportes. La plantilla debe estar completa y lista para duplicar, conectar Stripe y Supabase, y tener un SaaS funcionando. Mobile first, PWA instalable.

---

DISEÑO Y ESTILO:

Mobile first obligatorio (el empleado ficha desde el móvil). Desktop responsive para el admin.

Paleta de colores:

- Fondo: blanco (#FFFFFF)

- Superficie: gris molt clar (#F9FAFB)

- Superficie elevada: blanco (#FFFFFF)

- Acento principal: negro (#111111)

- Acento secundario: verde (#16A34A) — para estados positivos y botón de fichaje

- Gradiente principal: linear-gradient(135deg, #111111, #1F2937) — CTAs de la landing

- Gradiente fichaje: linear-gradient(135deg, #16A34A, #059669) — botón de fichar

- Texto principal: (#111111)

- Texto secundario: (#6B7280)

- Éxito/presente: verde (#16A34A)

- Alerta/ausente: rojo (#EF4444)

- Warning/tardío: naranja (#F59E0B)

- Fuera de zona: rojo (#DC2626)

- Bordes: (#E5E7EB)

Tipografía: sans-serif moderna y limpia (DM Sans, Inter o similar). Pesos: 200 extralight (reloj), 400 regular, 500 medium, 700 bold. El reloj digital usa font-variant-numeric: tabular-nums para que los números no bailen.

Estética: monocromática excepto el verde del fichaje y los colores de estado. Limpia, funcional, que se sienta como una herramienta de trabajo seria. Bordes redondeados (16px tarjetas, 12px inputs, full para botón de fichar y CTAs). Sombras mínimas. Iconos de Lucide.

---

ESTRUCTURA DE LA APP:

1. LANDING PAGE (/) — vende ClockIn a PYMEs

2. VISTA DEL EMPLEADO (/clock) — pantalla de fichaje, solo un botón

3. PANEL DEL ADMIN (/dashboard) — gestión completa de fichajes, empleados, zonas y reportes

---

PARTE 1 — LANDING PAGE (/):

NAV STICKY:

- Logo "CLOCKIN" en bold con icono de reloj minimalista

- Links: Características, Pricing, Testimonios

- Botón outline: "Iniciar sesión"

- Botón negro: "Empezar gratis"

HERO:

- Badge: "⏱️ +2,100 empresas fichen con ClockIn"

- Título grande (48-56px): "Fichajes con GPS. Sin excusas."

- Subtítulo (20px): "Tu equipo ficha con un toque desde el móvil. Tú sabes quién está, dónde está y a qué hora llegó. Sin hardware, sin apps complicadas, sin instalaciones. Una PWA y listo."

- Dos CTAs:

  - Botón negro grande: "Empezar gratis →"

  - Botón outline: "Ver demo"

- Debajo: avatares + "Más de 2,100 empresas · 24,000 empleados"

- Mockup dual: móvil con la pantalla de fichaje (botón verde grande + reloj) a la izquierda + pantalla del dashboard del admin a la derecha

- Badges debajo del mockup: "PWA instalable · GPS · Anti-fraude · Sin hardware"

SECCIÓN "EL PROBLEMA":

- Título: "¿Tu equipo ficha así?"

- 3 columnas con dolor:

  - "📋 Papel y bolígrafo" — "Hojas de firma que nadie revisa. Imposible saber quién llegó tarde de verdad."

  - "📱 WhatsApp" — "'Ya estoy' a las 8:03 pero el mensaje lo envió desde el metro. Sin prueba real."

  - "🖥️ Excel" — "Alguien lo rellena a final de mes de memoria. Los datos no valen nada."

- Debajo: "Con ClockIn, cada fichaje tiene hora exacta + ubicación GPS + verificación anti-fraude."

SECCIÓN "CÓMO FUNCIONA" (3 pasos):

- Paso 1: "El empleado abre la app" — "Abre ClockIn desde el móvil (es una PWA, se instala como una app). Ve solo un botón. Nada más." — Icono: Smartphone

- Paso 2: "Mantiene pulsado 2 segundos" — "Pulsación larga anti-fraude con vibración y sonido. No se puede fichar 'sin querer' ni automatizar." — Icono: Fingerprint

- Paso 3: "Se registra hora + GPS" — "El fichaje queda registrado con hora exacta y dirección legible (calle + ciudad). Si está fuera de la zona permitida, salta una alerta." — Icono: MapPin

SECCIÓN "CARACTERÍSTICAS" (grid de 6 tarjetas):

Tarjeta 1 — "Fichaje en 1 toque":

- "El empleado solo ve un botón. Sin menús, sin formularios, sin complicaciones. Fichar tarda 2 segundos."

- Icono: Clock

Tarjeta 2 — "GPS en cada fichaje":

- "Cada registro incluye coordenadas y dirección legible. Sabes dónde fichó exactamente."

- Icono: MapPin

Tarjeta 3 — "Anti-fraude":

- "Pulsación larga de 2 segundos obligatoria con vibración y sonido. Imposible de automatizar o falsificar."

- Icono: ShieldCheck

Tarjeta 4 — "Geofencing":

- "Define zonas válidas de fichaje (oficina, almacén, obra). Si alguien ficha fuera, recibes alerta."

- Icono: Target

Tarjeta 5 — "Panel de admin completo":

- "Dashboard en tiempo real: quién fichó, dónde, cuándo. Departamentos, turnos, alertas y reportes."

- Icono: LayoutDashboard

Tarjeta 6 — "PWA instalable":

- "Se instala en el móvil sin App Store ni Google Play. Un link y listo. Funciona en Android y iPhone."

- Icono: Download

SECCIÓN "DEMO INTERACTIVA":

- Título: "Pruébalo ahora"

- Mockup de móvil interactivo mostrando la pantalla del empleado:

  - Reloj en vivo

  - Botón verde grande de fichaje

  - Al mantener pulsado: anillo de progreso se llena + vibración simulada + check ✓

- "Así de simple es fichar para tu equipo."

SECCIÓN "PARA QUIÉN ES" (4 tarjetas):

"Restaurantes y hostelería":

- "Equipos con turnos rotativos. Saber quién llegó, a qué hora, y en qué local."

"Construcción y obras":

- "Empleados en distintas obras. Geofencing para verificar que fichan en la obra correcta."

"Comercio y retail":

- "Tiendas con varios empleados. Control de puntualidad y horas trabajadas."

"Oficinas y servicios":

- "Equipos presenciales o híbridos. Registro limpio para cumplir con la ley de fichaje."

SECCIÓN "CUMPLIMIENTO LEGAL":

- Título: "Cumple con la ley de control horario"

- Texto: "Desde 2019, todas las empresas en España están obligadas a registrar la jornada laboral de sus empleados (Real Decreto-ley 8/2019). ClockIn genera un registro digital inmutable con hora y ubicación, listo para cualquier inspección."

- Badge: "✓ Conforme con RD-ley 8/2019"

- Badge: "✓ RGPD compliant"

SECCIÓN "PRICING" (id="pricing"):

Título: "Simple. Sin sorpresas."

Subtítulo: "Paga por lo que necesitas. Cambia o cancela cuando quieras."

3 tarjetas:

STARTER — €0/mes:

- Hasta 5 empleados

- Fichaje con GPS

- Anti-fraude (pulsación larga)

- PWA instalable

- Panel admin básico

- Historial 30 días

- 1 zona de geofencing

- Branding ClockIn

- Botón outline: "Empezar gratis"

BUSINESS — €29/mes (badge "Popular"):

- Hasta 25 empleados

- Todo lo de Starter

- Historial ilimitado

- Departamentos y equipos

- Turnos configurables

- Zonas de geofencing ilimitadas

- Alertas (retrasos, ausencias, fuera de zona, horas extra)

- Reportes exportables (CSV/PDF)

- Sin branding ClockIn

- Soporte prioritario

- Botón negro: "Empezar con Business"

- "14 días gratis · Sin tarjeta"

ENTERPRISE — €59/mes:

- Hasta 100 empleados

- Todo lo de Business

- Múltiples centros de trabajo

- API completa

- Webhook para integraciones

- Exportación contable (formato estándar)

- Calendario de ausencias/vacaciones (visual)

- White-label total

- Soporte dedicado

- Botón outline: "Empezar con Enterprise"

Nota: "¿Más de 100 empleados? Contacta con nosotros para un plan a medida."

Toggle anual/mensual: €29/€59 mensual — €23/€47 anual (ahorra 20%)

SECCIÓN "TESTIMONIOS" (3 tarjetas):

"Tenemos 3 restaurantes y 22 empleados con turnos rotativos. Antes del ClockIn era imposible saber si alguien llegaba tarde a su turno o no. Ahora lo sé en tiempo real desde el móvil. Y el empleado solo tiene que pulsar un botón." — Pedro García, propietario de 3 restaurantes — ★★★★★

"Somos una constructora con 4 obras simultáneas. El geofencing nos permite verificar que cada empleado ficha en la obra correcta. Tuvimos una inspección de trabajo el mes pasado y el inspector quedó impresionado con el registro." — Marta López, RRHH en Construmax SL — ★★★★★

"Lo probamos un lunes y el martes ya lo usaba todo el equipo. Así de fácil. El empleado abre el móvil, pulsa el botón y ya. Sin apps que descargar, sin formación. Lo mejor que hemos hecho este año." — Javier Ruiz, gerente de Ópticas Ruiz (3 tiendas) — ★★★★★

SECCIÓN "FAQ" (acordeón, 7 preguntas):

- "¿Necesita el empleado descargar una app?" — "No. ClockIn es una PWA (Progressive Web App). El empleado recibe un link, lo abre en el móvil, y se instala como una app con un toque. Sin App Store, sin Google Play, sin actualizaciones."

- "¿Funciona sin internet?" — "El fichaje necesita conexión para registrar el GPS. Pero funciona con datos móviles (no necesita WiFi). Si no hay cobertura en ese momento, el fichaje se encola y se envía cuando recupera conexión."

- "¿Es legal fichar por GPS?" — "Sí, siempre que informes al empleado (lo cual cumplimos en el onboarding de la app). El fichaje registra la ubicación solo en el momento del fichaje, no rastrea continuamente. Esto es conforme con el RGPD y la ley de control horario española."

- "¿Se puede falsear el fichaje?" — "Es muy difícil. La pulsación larga de 2 segundos con vibración y sonido impide automatizarlo. El GPS se obtiene del dispositivo en tiempo real. Y el geofencing alerta si alguien ficha fuera de la zona permitida."

- "¿Cuánto tarda en implantarse?" — "10 minutos. Creas la cuenta, añades los empleados (nombre + email), configuras los turnos y las zonas, y les envías el link. Listo."

- "¿Puedo exportar los datos para la gestoría?" — "Sí. Exporta reportes en CSV o PDF con todos los fichajes, horas trabajadas, retrasos y ausencias. Listo para tu gestoría o para una inspección."

- "¿Puedo cancelar cuando quiera?" — "Sí. Sin permanencia. Si cancelas, tu cuenta baja al plan Starter gratuito (hasta 5 empleados)."

SECCIÓN CTA FINAL:

- Fondo negro

- Título en blanco: "Tu equipo ficha mañana con ClockIn"

- Subtítulo: "10 minutos de setup. Gratis para siempre hasta 5 empleados."

- Botón verde grande: "Crear mi cuenta gratis →"

- Debajo: "2,100+ empresas · 24,000+ empleados · 0 hardware necesario"

FOOTER:

- Logo "CLOCKIN"

- Columnas: Producto (Características, Pricing, Demo, Changelog), Recursos (Centro de ayuda, Guías, API Docs), Legal (Privacidad, Términos, RGPD, Política de cookies), Compañía (Sobre nosotros, Contacto, Twitter, LinkedIn)

- Badges: "Conforme RD-ley 8/2019" + "RGPD" + "SSL"

- Copyright

---

PARTE 2 — VISTA DEL EMPLEADO (/clock):

La pantalla más minimalista de toda la app. El empleado abre la app y solo ve UN botón. NADA más.

Acceso: el empleado recibe un link por email/WhatsApp, lo abre, introduce su PIN de 4 dígitos (asignado por el admin) y accede a su pantalla de fichaje. El PIN se guarda en localStorage para no pedirlo cada vez.

PANTALLA COMPLETA:

Fondo limpio (blanco). Centrado vertical y horizontal. Sin sidebar, sin header complejo, sin menú, sin navegación.

Elementos (de arriba a abajo, centrados):

1. Logo "CLOCKIN" pequeño y sutil (gris muted, no protagonista) — parte superior

2. Hora actual en tiempo real:

   - Formato HH:mm — tamaño grande (56px), font-weight 200 (extralight), tabular-nums

   - Sin segundos (limpio)

   - Debajo: fecha en español en texto muted: "martes, 25 de marzo de 2025"

3. BOTÓN DE FICHAJE (el elemento central, el protagonista absoluto):

   - Circular, grande (180x180px)

   - Fondo: gradiente verde (#16A34A → #059669)

   - Icono central: Fingerprint en blanco (48px)

   - Sin texto "Entrada"/"Salida" — el botón no distingue, solo registra

   

   Interacción — PULSACIÓN LARGA DE 2 SEGUNDOS:

   - Al mantener pulsado: anillo SVG de progreso circular blanco semitransparente se llena alrededor del botón durante 2 segundos

   - El botón se escala ligeramente (1.05x) mientras se mantiene pulsado

   - Si suelta antes de 2 segundos: se resetea con animación, no ficha

   - Al completar los 2 segundos:

     - Vibración: patrón 200-100-200ms

     - Sonido: tono corto (880Hz, 0.3s con fade-out)

     - Geolocalización: obtiene coordenadas GPS con navigator.geolocation (alta precisión), luego llama a Nominatim (OpenStreetMap) para convertir lat/lng en dirección legible (calle + ciudad). Fallback si falla: coordenadas numéricas. Si geolocalización no disponible: "Ubicación no disponible"

     - Animación de confirmación: el botón se transforma en un check (✓) verde con escala y el fondo hace un flash sutil verde. Dura 4 segundos

     - Mensaje de confirmación temporal debajo del botón:

       "✓ Fichaje registrado — 08:02 — Calle de Alcalá 45, Madrid"

       Desaparece después de 6 segundos con fade-out

4. Texto muted debajo del botón: "Mantén pulsado para fichar" — desaparece tras el primer fichaje exitoso del día

5. Nombre del empleado y departamento en texto muted en la parte inferior: "Carlos Martínez · Desarrollo"

6. Último fichaje (si ya fichó hoy): texto muted muy pequeño: "Último fichaje: 08:02 (entrada)"

NADA MÁS. Sin historial, sin estadísticas, sin menú, sin navegación a otras páginas. Solo el reloj y el botón.

PANTALLA DE PIN (primera vez o si expiró):

- Logo "CLOCKIN"

- "Introduce tu PIN"

- 4 campos de dígito (como el PIN del móvil)

- Teclado numérico en pantalla (para móvil)

- "¿No tienes PIN? Pide a tu administrador que te lo asigne"

- Al introducir PIN correcto: transición suave a la pantalla de fichaje

- PIN incorrecto: shake animation + "PIN incorrecto"

---

PARTE 3 — PANEL DEL ADMIN (/dashboard):

Login con email + contraseña (simulado).

SIDEBAR:

- Logo "CLOCKIN"

- Dashboard (icono LayoutDashboard)

- Fichajes (icono ClipboardList)

- Empleados (icono Users)

- Departamentos (icono Building2)

- Zonas GPS (icono MapPin)

- Alertas (icono Bell)

- Reportes (icono FileDown)

- Configuración (icono Settings)

- Plan actual: badge "BUSINESS" negro o "STARTER" gris

HEADER:

- Breadcrumb

- Nombre de la empresa: "TechCorp SL"

- Búsqueda: "Buscar empleado, departamento..."

- Notificaciones (campana con badge de alertas no leídas)

- Avatar admin con dropdown

---

PÁGINA — DASHBOARD:

KPIs (fila de 5 tarjetas):

- Empleados totales: 22

- Ficharon hoy: 18 de 22 (82%) — barra de progreso verde

- En oficina ahora: 15 — punto verde pulsante

- No han fichado: 4 — texto rojo si es después de la hora del turno

- Horas medias hoy: 6h 42min

Cada tarjeta con sparkline mini de los últimos 7 días y flecha de tendencia vs semana anterior.

FILA 2 — Dos columnas:

Columna izquierda (60%) — TIMELINE EN TIEMPO REAL:

- Feed cronológico inverso de fichajes de hoy:

  - Cada entrada: avatar circular (iniciales), nombre, tipo (→ Entrada / ← Salida), dirección abreviada, hora exacta, badge departamento

  - Fichajes fuera de zona: icono ⚠️ rojo

  - Fichajes tardíos: badge naranja "Tardío"

  - Animación sutil de entrada al aparecer nuevos fichajes

Datos mock timeline (al menos 15):

- 08:01 — Carlos Martínez → Entrada — Calle de Alcalá 45, Madrid — Desarrollo

- 08:03 — Ana Torres → Entrada — Calle de Alcalá 45, Madrid — Diseño

- 08:05 — Marcos García → Entrada — Calle de Alcalá 45, Madrid — Desarrollo

- 08:12 — Lucía Fernández → Entrada — Calle de Serrano 20, Madrid — Marketing — ⚠️ Fuera de zona

- 08:18 — Jorge Pérez → Entrada — Calle de Alcalá 45, Madrid — Ventas

- 08:31 — Elena Sánchez → Entrada — Calle de Alcalá 45, Madrid — RRHH — Badge "Tardío"

- 08:42 — David Rodríguez → Entrada — Paseo de la Castellana 100, Madrid — Dirección — ⚠️ Fuera de zona

- 08:58 — Roberto Hernández → Entrada — Calle de Alcalá 45, Madrid — Desarrollo

- 09:47 — Laura Medina → Entrada — Calle de Alcalá 45, Madrid — Diseño — Badge "Tardío"

- 12:30 — Carlos Martínez ← Salida — Calle de Alcalá 45, Madrid

- 12:32 — Ana Torres ← Salida — Calle de Alcalá 45, Madrid

- 13:30 — Carlos Martínez → Entrada — Calle de Alcalá 45, Madrid

- 13:33 — Ana Torres → Entrada — Calle de Alcalá 45, Madrid

- 14:02 — Marcos García ← Salida — Calle de Alcalá 45, Madrid

- 16:05 — Jorge Pérez ← Salida — Calle de Goya 8, Madrid — ⚠️ Fuera de zona

Columna derecha (40%):

ESTADO POR DEPARTAMENTO:

- Lista de departamentos:

  - Nom + empleats presents / total + mini barra

  - Badge verd si tots presents, taronja si falten, vermell si cap

- Datos:

  - Desarrollo: 4 de 5 presentes

  - Diseño: 2 de 2 presentes

  - Marketing: 2 de 3 presentes — 1 fuera de zona

  - Ventas: 1 de 2 presentes

  - RRHH: 1 de 1 presente

  - Dirección: 1 de 1 presente — fuera de zona

  - Soporte: 3 de 4 presentes

  - Contabilidad: 2 de 2 presentes

  - Producto: 2 de 2 presentes

ALERTAS DEL DÍA (tarjeta):

- Las 5 alertas más recientes:

  - "⚠️ Lucía Fernández fichó fuera de zona — Calle de Serrano 20 — 08:12"

  - "⏰ Elena Sánchez fichó 1 min tarde — 08:31 (turno 08:30)"

  - "⚠️ David Rodríguez fichó fuera de zona — Paseo de la Castellana 100 — 08:42"

  - "⏰ Laura Medina fichó 47 min tarde — 09:47 (turno 09:00)"

  - "❌ Pablo Navarro no ha fichado — Último: ayer 17:02"

- Link: "Ver todas las alertas →"

---

PÁGINA — FICHAJES:

FILTROS:

- Empleado (dropdown amb cerca)

- Departamento (dropdown)

- Rango de fechas (datepicker)

- Tipo (pills): Todos | Entradas | Salidas

- Estado (pills): Todos | En zona | Fuera de zona | Tardíos

- Botón "Limpiar filtros"

TABLA:

- Columnas: Empleado (avatar + nom), Departamento, Tipo (→/←), Fecha, Hora, Dirección, Precisión GPS (metres), Estado (badges: "En zona" verd, "Fuera de zona" vermell, "Tardío" taronja)

- Ordenar per qualsevol columna

- Paginació: 25 registres

- Comptador: "Mostrando 248 registros"

- Botón "Exportar CSV" / "Exportar PDF" (simulat)

Al fer clic en un registre → modal:

- Totes les dades del fitxatge

- Mapa mini (placeholder) amb el punt de fitxatge i la zona de geofencing

- Si fora de zona: distància al punt més proper de la zona

Al menys 80 registres mock distribuïts en els últims 5 dies laborables, coherents amb els 22 empleats.

---

PÁGINA — EMPLEADOS:

Botón "+ Añadir empleado"

Toggle vista: Taula / Targetes

TAULA:

- Columnes: Avatar (inicials), Nom, Email, Departament, Torn, PIN, Estat avui (Present verd / Absent vermell / Sortit gris), Hora entrada avui, Hores avui, Últim fitxatge

- Ordenar per qualsevol columna

TARGETES (grid):

- Inicials en cercle

- Nom, email, departament (badge), torn

- Estat: punt verd/vermell/gris + text

- Hores avui

- Botons: "Editar" / "Historial"

FITXA DE L'EMPLEAT:

- Dades: nom, email, telèfon, departament, torn, PIN (ocult amb botó "Mostrar"), data d'alta

- Estat actual: present/absent + hora última acció

- Estadístiques del mes:

  - Dies treballats: 18 de 22

  - Hores totals: 142h 30min

  - Mitjana diària: 7h 55min

  - Retards: 2

  - Fitxatges fora de zona: 1

  - Absències: 2

- Gràfica de barres: hores per dia (últims 20 dies laborables)

- Taula de fitxatges filtrada per aquest empleat

- Botó "Exportar historial"

AFEGIR/EDITAR EMPLEAT (modal):

- Nom complet (obligatori)

- Email (obligatori)

- Telèfon

- Departament (selector)

- Torn (selector: "Mañana 8:30-17:00", "Tarde 14:00-22:00", "Flexible", "Personalizado")

- PIN de 4 dígits (autogenerat o manual, amb botó "Regenerar")

- Botó "Guardar"

- Al crear: toast "Empleado creado. Se le enviará el link de acceso por email."

22 empleats mock en 9 departaments:

- Desarrollo (5): Carlos Martínez, Marcos García, Roberto Hernández, Pablo Navarro, Adrián Blanco

- Diseño (2): Ana Torres, Laura Medina

- Marketing (3): Lucía Fernández, Isabel Moreno, Carmen Díaz

- Ventas (2): Jorge Pérez, Elena López

- RRHH (1): Elena Sánchez

- Dirección (1): David Rodríguez

- Soporte (4): Óscar Méndez, Sara Vega, Cristina Romero, Javier López

- Contabilidad (2): Andrea Blanco, Miguel Navarro

- Producto (2): Diego Torres, Raquel Ruiz

---

PÁGINA — DEPARTAMENTOS:

Botón "+ Nuevo departamento"

Targetes per departament:

- Nom, nº empleats, responsable, presents avui (barra), hores mitjanes mes, retards mes, taxa puntualitat %

Al fer clic → fitxa:

- Dades: nom, responsable, descripció

- Empleats del departament amb estat d'avui

- Estadístiques: hores mitjanes, puntualitat, presència, fitxatges fora de zona

- Gràfica: comparativa d'hores per empleat

CREAR/EDITAR (modal):

- Nom, responsable (selector), descripció, torn per defecte

- Botó "Guardar"

---

PÁGINA — ZONAS GPS:

Títol: "Zonas de fichaje válidas"

Subtítol: "Los fichajes fuera de estas zonas generan alerta automática."

Targetes de zones:

- Nom: "Oficina Central"

- Adreça: "Calle de Alcalá 45, Madrid"

- Radi: 150 metres

- Estat: toggle Activa/Inactiva

- Assignada a: "Todos" o departaments específics

- Mapa mini placeholder amb punt + cercle de radi

Zones mock:

- Oficina Central — Calle de Alcalá 45, Madrid — 150m — Activa — Todos

- Oficina Satélite — Calle de Velázquez 20, Madrid — 100m — Activa — Marketing, Ventas

- Almacén Norte — Polígono Industrial San Fernando — 200m — Activa — Soporte

- Coworking WeWork — Paseo de la Castellana 77 — 80m — Inactiva

CREAR/EDITAR ZONA (modal):

- Nom (obligatori)

- Adreça

- Coordenades: lat/lng (inputs)

- Radi: slider 50m a 500m (per defecte 150m)

- Assignar a: toggle "Todos" o multiselect departaments/empleats

- Estat: activa/inactiva

- Mapa placeholder amb punt + cercle

- Botó "Guardar"

Lògica: al fitxar, es comparen coordenades GPS amb zones actives assignades a l'empleat. Si dins del radi d'almenys una → "En zona" (verd). Si fora de totes → "Fuera de zona" (vermell) + alerta automàtica.

---

PÁGINA — ALERTAS:

FILTRES:

- Tipus: Totes | Fora de zona | Retard | Absència | Hores extra

- Departament, Empleat, Rang de dates

- Estat: Totes | No llegides | Llegides | Resoltes

TARGETES D'ALERTES:

Cada alerta:

- Icona de tipus + color

- Títol descriptiu

- Empleat + departament

- Data i hora

- Detall expandible

- Estat: badge "No leída" (bold) / "Leída" / "Resuelta" (gris amb check)

- Botons: "Marcar como leída" / "Resolver" (amb camp de nota)

Alertes mock (al menys 15, últims 5 dies):

Fora de zona (5):

- "Lucía Fernández fichó entrada fuera de zona — Calle de Serrano 20 (a 1.2km de Oficina Central) — Hoy 08:12" — No leída

- "David Rodríguez fichó entrada fuera de zona — Paseo de la Castellana 100 (a 800m) — Hoy 08:42" — No leída

- "Jorge Pérez fichó salida fuera de zona — Calle de Goya 8 (a 650m) — Hoy 16:05" — No leída

- "Isabel Moreno fichó entrada fuera de zona — Centro Comercial La Vaguada (a 4.5km) — Ayer" — Leída

- "Carmen Díaz fichó salida fuera de zona — Estación de Atocha (a 2.1km) — Hace 2 días" — Resuelta — "Reunión con cliente en Atocha, justificado"

Retards (4):

- "Laura Medina fichó 47 minutos tarde — 09:47, turno 09:00 — Hoy" — No leída

- "Elena Sánchez fichó 1 minuto tarde — 08:31, turno 08:30 — Hoy" — Leída

- "Pablo Navarro fichó 22 minutos tarde — 08:52, turno 08:30 — Ayer" — Leída

- "Óscar Méndez fichó 15 minutos tarde — 08:45, turno 08:30 — Hace 3 días" — Resuelta — "Retraso de metro"

Absències (3):

- "Pablo Navarro no ha fichado hoy — Último: ayer 17:02" — No leída

- "Sofía Ruiz no fichó el viernes 21" — Leída

- "Fernando Gil ausente 2 días (20-21 marzo)" — Resuelta — "Baja médica"

Hores extra (3):

- "Carlos Martínez trabajó 9h 45min (turno 8h) — Ayer" — Leída

- "Roberto Hernández trabajó 10h 12min — Hace 2 días" — Leída

- "Marcos García acumula 6h extra esta semana" — No leída

Estadístiques d'alertes (barra superior):

- No leídas: 5 (badge vermell)

- Esta semana: 12

- Tipo más frecuente: Fuera de zona (5)

- Departamento con más alertas: Marketing (4)

---

PÁGINA — REPORTES:

Títol: "Exportar informes"

GENERADOR:

- Tipus d'informe (selector):

  - Registro de fichajes (todos los del periodo)

  - Resumen por empleado (horas, retrasos, ausencias)

  - Resumen por departamento (métricas agregadas)

  - Informe de alertas

  - Informe de horas extra

- Filtres: període (presets: esta semana, este mes, mes anterior, trimestre, personalizado), departament, empleat

- Format: pills "CSV" / "PDF"

PREVIEW:

- Taula preview amb primers 10 registres

- Resum: "Este informe contiene 248 registros del periodo 1-25 marzo 2025"

- Botó "Exportar" (simulat amb toast)

INFORMES RÀPIDS (targetes d'accés directe):

- "Fichajes de hoy" — 1 clic → CSV

- "Resumen mensual" — 1 clic → PDF

- "Empleados con incidencias" — 1 clic → llista

- "Horas extra del mes" — 1 clic → llistat

Historial d'informes generats: últims 10 amb botó "Descargar de nuevo"

---

PÁGINA — CONFIGURACIÓN:

Tab "General":

- Nom de l'empresa: "TechCorp SL"

- CIF: "B12345678"

- Zona horària: "Europe/Madrid"

- Format hora: 24h

Tab "Turnos":

- Llista de torns:

  - Mañana: 8:30-17:00 (8h, 30min pausa)

  - Tarde: 14:00-22:00 (8h)

  - Flexible: sense hora fixa (no genera alertes de retard)

- Crear/editar torn: nom, hora entrada, hora sortida, pausa, tolerància de retard (minuts)

- La tolerància defineix quan salta l'alerta: si és 5 min i el torn és 8:30, l'alerta salta a les 8:36

Tab "Alertas":

- Toggles per tipus:

  - Fichaje fuera de zona: activada ✓

  - Retraso: activada ✓ (tolerancia configurable)

  - Ausencia (no fichó en todo el día): activada ✓

  - Horas extra (supera X horas): activada ✓ (umbral: 9h)

- Notificació per email al admin: toggle per tipus

- Resum diari per email a les 18:00: toggle

Tab "Seguridad":

- Requerir GPS per fitxar: toggle (si desactivat, permet fitxar sense GPS)

- Temps de pulsació llarga: slider 1-3 segons (per defecte 2)

- Vibració al fitxar: toggle

- So al fitxar: toggle

- Expiració del PIN: selector (mai, 30 dies, 90 dies)

Tab "Facturación":

- Pla actual: "BUSINESS — €29/mes"

- Pròxima factura

- Mètode de pagament

- Historial de factures

- Canviar pla / Cancel·lar

Tab "Legal":

- Text de consentiment per a empleats (editable): "Al utilizar ClockIn, consiento que se registre la hora y ubicación GPS de mis fichajes con el fin de control horario según el RD-ley 8/2019..."

- Toggle "Requerir aceptación del empleado en su primer acceso"

- Descarregar plantilla de consentiment (PDF simulat)

---

INTEGRACIÓ AMB STRIPE:

Preparada per a:

1. Checkout de plans (Starter → Business → Enterprise)

2. Portal de gestió de subscripció

3. Webhooks per actualitzar pla

4. Escalament automàtic: si l'empresa afegeix l'empleat nº 6 en pla Starter, modal "Has superado el límite de 5 empleados del plan Starter. Actualiza a Business para continuar." amb botó d'upgrade

En la demo: botons d'upgrade mostren modal explicatiu. Dades de facturació mock.

Taules de Supabase suggerides:

- companies (id, name, cif, timezone, plan, stripe_customer_id, config_json, created_at)

- users_admin (id, company_id, email, name, role, created_at)

- employees (id, company_id, name, email, phone, department_id, shift_id, pin_hash, status, created_at)

- departments (id, company_id, name, manager_id, description, default_shift_id)

- shifts (id, company_id, name, start_time, end_time, break_minutes, late_tolerance_minutes)

- clock_records (id, employee_id, type, timestamp, lat, lng, address, accuracy, in_zone, zone_id, created_at)

- zones (id, company_id, name, address, lat, lng, radius_meters, assigned_to_json, active)

- alerts (id, company_id, employee_id, type, description, status, resolved_note, created_at)

---

PWA:

Manifest:

- name: "ClockIn — Fichaje"

- short_name: "ClockIn"

- theme_color: "#111111"

- background_color: "#FFFFFF"

- display: standalone

- orientation: portrait

- Icones: rellotge minimalista (cercle + agulles) en negre sobre fons blanc arrodonit (192x192 i 512x512)

Service Worker:

- Cache d'assets estàtics

- RuntimeCaching NetworkFirst per a l'API de Nominatim (geocodificació inversa)

- Offline: si no hi ha connexió, mostrar missatge "Sin conexión. Tu fichaje se enviará cuando recuperes cobertura." i encolar el fitxatge

---

ASPECTES TÈCNICS:

- React amb Tailwind

- Recharts per a gràfiques

- Lucide React per a icones

- Supabase per a auth i dades

- Stripe per a pagaments (preparat)

- localStorage per al PIN de l'empleat i fallback demo

- navigator.geolocation per a GPS (alta precisió)

- Nominatim API (OpenStreetMap) per a geocodificació inversa (coordenades → adreça)

- Fórmula haversine per a càlcul de distància al geofencing

- vite-plugin-pwa per a PWA

- Touch events (touchstart/touchend) + mouse events (mousedown/mouseup) per al botó de pulsació llarga

- Web Audio API per al so de confirmació (880Hz, 0.3s, fade-out)

- Navigator.vibrate per a vibració (200-100-200ms)

- Skeleton loaders, toasts, transicions

- Switcher de rol per a demo: Empleado (selector d'empleat) / Admin

---

RESTRICCIONS:

No incloguis autenticació real (PIN simulat amb localStorage), passarel·la de pagament real (Stripe preparat però no connectat), xat, gestió de nòmines, càlcul de salaris, gestió de vacances/absències (només detecció com a alerta), calendari de vacances complet, integració amb Google Calendar, sistema d'aprovació d'hores, rastreig GPS continu (només en el moment del fitxatge), ni reconeixement facial. El geofencing usa haversine, no Google Maps API. Els informes s'"exporten" com a simulació. Textos en espanyol d'Espanya.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://clock-in-go.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/bd853b65-c90e-4ceb-b26d-156018487b5c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
