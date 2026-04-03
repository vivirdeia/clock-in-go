

## Plan: Animación de feedback al pulsar el botón de fichaje

### Problema
Al tocar el botón verde, el usuario no percibe que algo está pasando. La escala 1.05x y el anillo SVG son demasiado sutiles. Falta feedback visual inmediato que comunique "mantén pulsado".

### Solución
Añadir múltiples capas de feedback visual durante la pulsación larga:

**Modificar `src/pages/Clock.tsx`** (líneas 170-186, el bloque del botón):

1. **Icono Fingerprint pulsa y crece**: durante el progreso, el icono escala de 1x a 1.3x con una transición suave
2. **Icono cambia de color**: el icono pasa de blanco a un blanco más brillante con glow/sombra
3. **Botón pulsa más**: escala del botón de 1.05x a 1.1x durante la pulsación
4. **Anillo de progreso más grueso y visible**: strokeWidth de 4 a 6, color blanco en vez de verde para contrastar con el fondo verde
5. **Efecto de onda/ripple**: añadir un anillo exterior que se expande con opacidad decreciente mientras se mantiene pulsado (CSS animation)
6. **Texto dinámico**: debajo del botón, mostrar "Manteniendo..." con puntos animados mientras `progress > 0` y no ha confirmado

**Modificar `src/index.css`**:
- Añadir keyframe `pulse-ring` para el efecto de onda expansiva alrededor del botón
- Añadir keyframe `glow` para el brillo del icono durante la pulsación

### Resultado visual
- Toque inicial: el botón crece, aparece ripple, el icono empieza a brillar, texto cambia a "Manteniendo..."
- Durante pulsación: anillo de progreso se llena (más visible), icono crece progresivamente, ondas pulsantes
- Al completar: vibración + sonido + check animado (ya existente)
- Al soltar antes: todo se resetea suavemente

