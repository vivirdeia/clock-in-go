## Problema

No puedes iniciar sesión con `admin@techcorp.es / admin123`.

**Causa:** En tu navegador ya existe un `clockin_admins` antiguo en `localStorage` (de una versión previa de la app) que **no tiene el campo `passwordPlain`**. La función `checkPassword` actual compara únicamente `admin.passwordPlain === password`, así que devuelve siempre `false` y muestra "Email o contraseña incorrectos".

El `defaultAdmin` solo se inserta cuando NO hay nada en `localStorage`, así que un registro antiguo nunca se actualiza.

## Solución

Hacer la comprobación de contraseña tolerante a datos antiguos y migrar el seed al cargar.

### Cambios en `src/store/AuthContext.tsx`

**1. `getAdmins()` — auto-migrar el seed admin**

Al leer `localStorage`:
- Si existe un admin con el email de `defaultAdmin` pero sin `passwordPlain`, rellenarlo con `'admin123'` y reescribir el storage.
- Si el admin demo no existe en absoluto, insertarlo al principio.

**2. `checkPassword()` — fallback a hash legado**

```ts
function checkPassword(admin, password) {
  if (admin.passwordPlain) return admin.passwordPlain === password;
  return admin.passwordHash === syncHash(password);
}
```

Así funcionan tanto las cuentas nuevas (con `passwordPlain`) como las antiguas almacenadas solo con `passwordHash`.

### Resultado

- Login demo `admin@techcorp.es / admin123` funciona inmediatamente, incluso con `localStorage` antiguo.
- "¿Olvidaste tu contraseña?" sigue funcionando para todos los registros nuevos.
- No se borra ningún dato existente del usuario.
