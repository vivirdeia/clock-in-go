

## Plan: Logo con huella dactilar SVG + tipografía Google Sans

### Cambios

**1. `index.html`** — Reemplazar fuente
- Cambiar el link de Google Fonts de `DM Sans` a `Product Sans` (Google Sans no está en Google Fonts público, se usa Product Sans como alternativa más cercana disponible, o bien se carga Inter/Outfit como fallback moderno similar)
- Actualizar el título si es necesario

> **Nota**: Google Sans (Product Sans) no está disponible públicamente en Google Fonts — es propiedad de Google. Las alternativas más cercanas disponibles son **Outfit** o **Inter**. ¿Quieres una de estas, o prefieres que use un archivo .woff2 de Product Sans si lo tienes?

**2. `tailwind.config.ts`** — Cambiar fontFamily
- Reemplazar `"DM Sans"` por la nueva fuente elegida en `theme.extend.fontFamily.sans`

**3. `src/index.css`** — Sin cambios (ya usa `font-sans`)

**4. Logo: SVG de huella dactilar inline**
- Crear un componente `src/components/LogoIcon.tsx` con un SVG de huella dactilar (fingerprint) minimalista en monocromático
- Reemplazar `<Clock className="w-5 h-5" />` por `<LogoIcon />` en todos los sitios donde aparece el logo:
  - `src/pages/Index.tsx` (navbar, ~línea 148)
  - `src/pages/Login.tsx` (~línea 53)
  - `src/pages/SelectPlan.tsx` (~línea 49)
  - `src/components/dashboard/AdminSidebar.tsx`

**5. Archivos afectados**: 6 archivos (LogoIcon nuevo + 5 ediciones)

### Pregunta pendiente
Necesito confirmar qué fuente usar ya que Google Sans no es pública. Las opciones: **Outfit** (geométrica, moderna, muy similar) o **Inter** (neutral, muy legible).

