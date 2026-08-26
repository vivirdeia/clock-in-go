# ClockIn: de demo a producción

La base de datos ya está creada y protegida (empresas, perfiles, roles, departamentos, turnos, zonas GPS, fichajes y alertas, con geovallado y alertas automáticas por trigger). Lo que falta es **conectar la app real**: hoy sigue funcionando con datos simulados en memoria/localStorage.

Propongo hacerlo en 4 fases. Yo implemento las fases 1–4; al final te listo lo que tienes que hacer tú a mano.

## Fase 1 — Autenticación real
- Reescribir `AuthContext` sobre la autenticación del backend: registro de admin (crea empresa + turnos por defecto automáticamente), inicio de sesión, cierre de sesión y recuperación de contraseña por email real.
- Rol y empresa se leen de la base de datos, no de localStorage.
- Rutas protegidas con estado de carga real (evita parpadeos y redirecciones erróneas).
- Login de empleado por PIN de 4 dígitos: se valida contra el backend mediante una función de servidor y devuelve la sesión del empleado.
- Eliminar la contraseña demo visible y el "recuperar contraseña" que enseña la clave en pantalla.

## Fase 2 — Datos reales en el panel
- Sustituir el `dataStore` en memoria por consultas reales: empleados, departamentos, turnos, zonas, fichajes y alertas.
- Altas/ediciones/bajas escriben en la base de datos y se refrescan en pantalla.
- Estados de carga con skeletons y mensajes de error claros.
- Alta de empleados por el admin mediante función de servidor (crea cuenta + PIN + perfil vinculado a la empresa).

## Fase 3 — Fichaje real
- El botón de `/clock` toma la ubicación del navegador e inserta el fichaje real con hora, coordenadas y precisión.
- El geovallado y la alerta "fuera de zona" ya los resuelve la base de datos automáticamente.
- Historial propio del empleado leído del backend.

## Fase 4 — Preparar producción
- Revisión de seguridad automatizada y corrección de hallazgos.
- Metadatos de la web (título, descripción, vista previa social).
- Comprobación de la app instalable (PWA) y de la pantalla de fichaje en móvil.

## Lo que tendrás que hacer tú a mano
1. **Correos**: conectar un dominio propio para que los emails de acceso y recuperación no lleguen del remitente por defecto.
2. **Dominio**: comprar el dominio y conectarlo desde Lovable.
3. **Pagos con Stripe**: crear la cuenta Stripe, verificar el negocio y darme luz verde; los productos/planes y el flujo de suscripción los configuro yo con el conector.
4. **Legal (obligatorio en España)**: aviso legal, política de privacidad y cláusula de registro horario/RGPD para el tratamiento de ubicación de empleados. Necesita revisión de un profesional; yo monto las páginas con el texto que me pases.
5. **Publicar** la app y crear tu primera empresa real de prueba.

## Detalles técnicos
- Cliente de backend ya generado en `src/integrations/supabase/client.ts`.
- Nuevas funciones de servidor: `employee-pin-login` y `create-employee` (usan clave de servicio, nunca expuesta al cliente).
- `src/store/dataStore.tsx` pasa a ser una capa de consultas con React Query en vez de estado en memoria.
- Los datos de ejemplo (`src/store/seedData.ts`) se conservan solo como semilla opcional para demos.
