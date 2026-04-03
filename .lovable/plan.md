

## Plan: Transición suave entre páginas del dashboard

### Problema
Al navegar entre secciones del dashboard (Fichajes, Empleados, etc.), el contenido cambia de golpe sin ninguna animación.

### Solución
Crear un componente wrapper `AnimatedOutlet` que envuelva el `<Outlet />` del `DashboardLayout` con una animación fade-in sutil cada vez que cambia la ruta.

### Cambios

**1. `src/components/AnimatedOutlet.tsx`** — Nuevo componente
- Usa `useLocation()` como `key` para re-montar el contenido en cada navegación
- Aplica la clase `animate-fade-in` (ya definida en tailwind.config.ts) al contenedor

**2. `src/pages/DashboardLayout.tsx`** — Reemplazar `<Outlet />`
- Cambiar `<Outlet />` por `<AnimatedOutlet />` en el `<main>`

### Detalle técnico
- Sin dependencias nuevas
- Usa las animaciones ya configuradas en el proyecto (`fade-in`: 0.3s ease-out con translateY)
- El `key={location.pathname}` fuerza el re-render con animación en cada cambio de ruta

