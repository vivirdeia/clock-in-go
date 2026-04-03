

## Plan: Hacer todos los botones funcionales con datos mock

### Problema
Muchos botones en la app no hacen nada o solo muestran un toast falso. El usuario quiere que toda la interacción sea real usando datos mock en memoria (sin localStorage).

### Cambios

**1. `src/pages/Index.tsx`** — Botones de pricing funcionales
- Los 3 botones de planes (línea 126) no tienen navegación. Convertirlos en `<Link to="/register">` para que lleven al registro.

**2. `src/pages/dashboard/EmployeesPage.tsx`** — CRUD funcional en memoria
- Convertir `employees` de importación estática a `useState([...employees])` local.
- "Añadir empleado": el formulario crea un empleado real en el estado con PIN auto-generado y lo añade a la lista.
- Click en empleado: permitir editar nombre, email, departamento, turno en el modal existente y actualizar el estado.
- Añadir botón "Eliminar" con confirmación que remueve del estado.

**3. `src/pages/dashboard/DepartmentsPage.tsx`** — CRUD funcional en memoria
- Estado local con `useState([...departments])`.
- "Nuevo departamento": crea de verdad y aparece en la lista.
- Editar/eliminar departamentos funcional.

**4. `src/pages/dashboard/GpsZonesPage.tsx`** — CRUD funcional en memoria
- Estado local con `useState([...zones])`.
- "Nueva zona": crea con los datos del formulario y aparece en la lista.
- Toggle activa/inactiva funcional.
- Eliminar zona.

**5. `src/pages/dashboard/AlertsPage.tsx`** — Acciones funcionales
- "Marcar leída" y "Resolver" ya modifican estado local — verificar que funcionen correctamente.

**6. `src/pages/dashboard/ClockRecords.tsx`** — Exportar CSV real
- El botón "Exportar CSV" genera un archivo `.csv` real con los datos mock y lo descarga usando `Blob` + `URL.createObjectURL`.

**7. `src/pages/dashboard/ReportsPage.tsx`** — Exportación real
- Los botones de "quick reports" y "Exportar CSV/PDF" generan descargas reales.
- CSV: genera Blob con datos y descarga.
- PDF: usa `window.print()` con CSS de impresión.

**8. `src/pages/dashboard/SettingsPage.tsx`** — Formularios funcionales
- Los formularios de configuración guardan en estado local (en memoria de sesión).
- Botón "Nuevo turno" abre un mini-formulario funcional.
- "Descargar plantilla PDF" genera descarga real.

### Lo que NO cambia
- No se usa localStorage para persistir datos.
- Los datos se resetean al recargar la página (son mock en memoria).
- No se crea ningún store global.

### Resultado
Cada botón visible en la app tiene una acción real: navega, crea, edita, elimina, o descarga. Nada queda como toast falso.

