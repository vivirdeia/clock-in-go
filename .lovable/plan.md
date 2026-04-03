

## Plan: Sistema de registro, login y suscripción simulado

### Qué se construye

Un flujo completo de autenticación y selección de plan simulado con localStorage — sin base de datos. El usuario puede registrarse, iniciar sesión, elegir plan, y acceder al dashboard o a la vista de empleado según su rol.

---

### Archivos a crear

**1. `src/store/AuthContext.tsx`** — Context de autenticación simulado
- Estado: `user` (email, nombre, empresa, rol: `admin` | `employee`, plan, etc.) o `null`
- Funciones: `register()`, `login()`, `logout()`, `updatePlan()`
- Persistencia en `localStorage` key `clockin_auth`
- Al registrarse como admin: se crea una "empresa" con plan Starter por defecto
- Al hacer login con PIN (empleado): redirige a `/clock`
- Al hacer login con email/password (admin): redirige a `/dashboard`

**2. `src/pages/Register.tsx`** — Página de registro (`/register`)
- Formulario: nombre, email, contraseña, nombre de empresa, CIF (opcional)
- Al enviar: guarda en localStorage, redirige a selección de plan
- Diseño coherente con la landing (limpio, centrado, bordes redondeados)

**3. `src/pages/Login.tsx`** — Página de login (`/login`)
- Dos tabs: "Administrador" (email + contraseña) y "Empleado" (PIN de 4 dígitos)
- Admin: valida contra datos en localStorage → `/dashboard`
- Empleado: valida PIN contra lista de empleados mock → `/clock`
- Link a "Crear cuenta" y "¿Olvidaste tu contraseña?" (este último solo muestra toast informativo)

**4. `src/pages/SelectPlan.tsx`** — Selección de plan post-registro (`/select-plan`)
- Reutiliza las 3 tarjetas de pricing de la landing (Starter/Business/Enterprise)
- Al seleccionar: guarda el plan en el usuario, redirige a `/dashboard`
- Starter se activa directamente; Business/Enterprise muestran modal "En producción se conectaría con Stripe" y activan igualmente

**5. `src/components/ProtectedRoute.tsx`** — Wrapper de rutas protegidas
- Si no hay sesión → redirige a `/login`
- Si el rol no coincide (ej: empleado intentando `/dashboard`) → redirige a su vista

---

### Archivos a modificar

**6. `src/App.tsx`**
- Envolver con `<AuthProvider>`
- Rutas `/login`, `/register`, `/select-plan`
- `/dashboard/*` envuelto en `<ProtectedRoute role="admin">`
- `/clock` accesible con sesión de empleado o admin

**7. `src/pages/Index.tsx`**
- Botones "Empezar gratis", "Iniciar sesión" → navegan a `/register` y `/login`
- Botones de pricing → `/register` con query param del plan

**8. `src/components/dashboard/AdminSidebar.tsx`**
- Mostrar nombre del usuario y empresa desde el context
- Botón "Cerrar sesión" funcional → `logout()` + redirige a `/`
- Badge del plan actual desde el context

**9. `src/pages/DashboardLayout.tsx`**
- Avatar muestra iniciales reales del usuario logueado
- Dropdown con "Mi cuenta", "Cerrar sesión"

**10. `src/pages/Clock.tsx`**
- Si no hay sesión de empleado → mostrar pantalla de PIN (ya existe)
- El PIN validado guarda sesión de empleado en el context

**11. `src/pages/dashboard/SettingsPage.tsx`**
- Tab "Facturación": muestra plan actual del context, botón "Cambiar plan" abre modal con opciones de upgrade/downgrade simulado

---

### Flujos de usuario

```text
Landing → "Empezar gratis" → /register → /select-plan → /dashboard
Landing → "Iniciar sesión" → /login (admin) → /dashboard
Landing → "Iniciar sesión" → /login (empleado PIN) → /clock
Dashboard → "Cerrar sesión" → /
```

### Datos simulados pre-cargados

- Admin por defecto: `admin@techcorp.es` / `admin123` (para poder probar sin registrarse)
- Los 22 empleados mock ya tienen PINs funcionales
- Plan por defecto del admin mock: Business

### Sin dependencias nuevas

Solo React Context + localStorage + react-router-dom (ya instalado).

