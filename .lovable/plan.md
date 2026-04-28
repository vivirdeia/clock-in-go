
# Plan MVP funcional sin backend (todo en localStorage)

## Objetivo
Convertir la demo actual en un MVP que un comercial pueda enseñar a una empresa, donde **todo lo que el usuario hace persiste y funciona de verdad** — sin necesidad de backend ni auth real.

---

## Arquitectura de datos: capa de persistencia

### Nuevo: `src/store/dataStore.ts`
Capa centralizada que reemplaza los arrays estáticos de `mockData.ts` por un store reactivo respaldado en localStorage, **aislado por admin (multi-tenant)**.

- Clave en localStorage: `clockin_data_<adminId>` → guarda `{ employees, departments, shifts, zones, clockRecords, alerts, settings }`.
- Hook `useDataStore()` que expone los datos y mutadores (`addEmployee`, `addClockRecord`, `updateZone`, etc.).
- Cada admin nuevo arranca con un **dataset semilla limpio** (1 zona "Oficina" creada con su geolocalización al hacer onboarding, 0 empleados).
- El admin demo (`admin@techcorp.es`) sigue cargando los datos mock actuales para que la demo "rica" siga funcionando.

### Mantener `mockData.ts`
Se conserva solo como **dataset semilla del admin demo**. Los tipos (`Employee`, `ClockRecord`, etc.) se mueven a `src/types.ts`.

---

## Fichaje real (núcleo del producto)

### `src/pages/Clock.tsx`
- Al confirmar el long-press, **insertar un `ClockRecord` real** en el store del admin del empleado.
- Detección automática `entry` vs `exit`: si el último fichaje del día es `entry` → siguiente es `exit`, y viceversa.
- Calcular `inZone` con `haversineDistance` (ya existe) comparando contra las zonas activas asignadas al departamento del empleado.
- Guardar lat/lng/accuracy reales del navegador en el registro.
- Mostrar al empleado un **histórico propio de sus últimos 10 fichajes** debajo del botón (cumplimiento legal RD 8/2019: el trabajador debe poder consultar sus registros).
- Aviso RGPD la primera vez que ficha (modal con consentimiento, se guarda en localStorage por empleado).

### Generación automática de alertas
Al insertar un fichaje, evaluar y crear alertas automáticamente:
- `out_of_zone` si `inZone === false`.
- `late` si `entry` llega después de `shift.startTime + lateToleranceMinutes`.
- `overtime` si la jornada acumulada del día supera la del turno.
Job ligero al cargar dashboard que evalúa `absent` (empleados activos sin fichar antes de las 10:00).

---

## CRUDs persistentes

Todas las páginas del dashboard pasan a leer/escribir desde `useDataStore()`:
- **EmployeesPage**: añadir, editar, eliminar persisten. Las stats del modal (días trabajados, horas, retardos) se calculan desde los `clockRecords` reales del empleado, no hardcoded.
- **DepartmentsPage**: CRUD persistente.
- **GpsZonesPage**: CRUD persistente. Permitir capturar coordenadas con "Usar mi ubicación actual".
- **AlertsPage**: marcar leída / resolver con nota persiste.
- **ClockRecords**: filtros por fecha/empleado/departamento/zona sobre datos reales, edición manual de un fichaje (correcciones del admin) con flag `editedByAdmin`.
- **SettingsPage**: nombre empresa, CIF, logo, política de tolerancia, idioma → persiste en `settings`.

---

## Auth y multi-tenant (sin backend real)

### `src/store/AuthContext.tsx`
- Hashear contraseñas con SHA-256 antes de guardar (no es seguridad real, pero evita texto plano visible).
- Cada admin nuevo registrado recibe su propio `dataStore` aislado.
- Al iniciar sesión un empleado (PIN), buscar el PIN entre los empleados de **todos los stores** y asociarlo al admin correspondiente.
- Fix: actualmente al registrarse un admin nuevo ve los datos de TechCorp — corregir para que arranque con dataset vacío.

### Reset de contraseña simulado
Botón "¿Olvidaste tu contraseña?" → modal que pide email → si existe, muestra la contraseña en un toast (modo demo, claramente etiquetado).

---

## Onboarding tras registro

Nueva ruta `/onboarding` (3 pasos, tras crear cuenta y elegir plan):
1. **Tu primera zona GPS**: capturar ubicación actual → crear zona "Oficina principal".
2. **Tu primer departamento**: nombre + turno por defecto.
3. **Tu primer empleado**: nombre, email, PIN auto-generado → mostrar PIN destacado para entregárselo.

Al terminar, ir al dashboard ya con datos propios.

---

## Cumplimiento legal (RD 8/2019)

- **Histórico del empleado** en `/clock` (apartado "Mis fichajes").
- **Registros inmutables**: no permitir borrar `clockRecords`, solo añadir correcciones (nuevo registro con `correctsId`).
- **Exportación oficial** en `ReportsPage`: nuevo informe "Registro horario oficial" en CSV con formato compatible Inspección de Trabajo (DNI, fecha, hora entrada, hora salida, total horas).
- **Aviso RGPD** al primer fichaje del empleado.

---

## Límites por plan

En `dataStore`, enforce simple:
- `starter`: máx 10 empleados, 1 zona.
- `business`: máx 50 empleados, 5 zonas.
- `enterprise`: ilimitado.

Bloquear el botón "Añadir empleado/zona" con CTA "Mejorar plan" cuando se llega al límite.

---

## Detalles técnicos

### Archivos nuevos
- `src/types.ts` — tipos extraídos de mockData.
- `src/store/dataStore.ts` — Context + hook `useDataStore` + persistencia localStorage por admin.
- `src/store/seedData.ts` — dataset demo de TechCorp (lo actual de mockData).
- `src/lib/alerts.ts` — generadores de alertas automáticas.
- `src/lib/geofencing.ts` — wrapper sobre haversine para validar zonas.
- `src/pages/Onboarding.tsx` — wizard 3 pasos.
- `src/components/RgpdConsent.tsx` — modal consentimiento empleado.

### Archivos modificados
- `src/store/AuthContext.tsx` — hash, dataset aislado por admin, reset password demo.
- `src/pages/Clock.tsx` — insertar fichaje real, histórico empleado, RGPD.
- `src/pages/dashboard/*.tsx` — todas las páginas leen/escriben desde dataStore.
- `src/pages/Register.tsx` — redirige a `/onboarding` tras registro.
- `src/App.tsx` — añadir ruta `/onboarding`, envolver con `DataStoreProvider`.
- `src/data/mockData.ts` — convertido en re-export del seed (compatibilidad).

### Sin dependencias nuevas
Todo se hace con APIs nativas (Web Crypto para hash, localStorage, navigator.geolocation).

---

## Lo que NO se hace (por decisión explícita)
- No backend, no Supabase, no edge functions.
- No pasarela de pago real (los planes son selección visual).
- No envío real de emails.
- No PWA push notifications.

---

## Resultado esperado
Un comercial podrá:
1. Registrar una cuenta nueva en directo delante del cliente.
2. Hacer el onboarding (zona + departamento + empleado) en 30 segundos.
3. Pasar el móvil al cliente para que ese empleado fiche con su PIN.
4. Volver al dashboard y ver el fichaje aparecer en tiempo real con su geolocalización.
5. Generar y descargar un informe oficial CSV en el momento.
6. Todo sigue ahí al día siguiente al recargar.
