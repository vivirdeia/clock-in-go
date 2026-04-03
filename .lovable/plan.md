

## Plan: Corregir scroll horizontal en modo responsive

### Problema
En móvil, el contenido de algunas páginas (tablas, filtros) se desborda del viewport, lo que permite hacer scroll horizontal a la derecha. Pero al intentar volver a la izquierda, el gesto compite con la navegación del navegador o simplemente no responde bien. Esto pasa porque no hay un contenedor que limite el overflow horizontal.

### Solución
Añadir `overflow-x-hidden` en los contenedores principales del layout para que el scroll horizontal solo funcione dentro de las tablas (que ya tienen `overflow-x-auto`), no en toda la página.

### Cambios

**`src/pages/DashboardLayout.tsx`**
- En el `div` principal (línea 40): añadir `overflow-x-hidden` → `"flex min-h-screen w-full bg-secondary/30 overflow-x-hidden"`
- En el `div` del contenido (línea 42): añadir `overflow-x-hidden` → `"flex-1 flex flex-col min-w-0 overflow-x-hidden"`

**`src/index.css`**
- Añadir regla global `html, body { overflow-x: hidden; }` para evitar scroll horizontal en toda la app.

### Resultado
- El scroll horizontal de toda la página desaparece.
- Las tablas individuales siguen permitiendo scroll horizontal interno (gracias a su `overflow-x-auto`).
- El problema de "no poder volver a la izquierda" se elimina por completo.

