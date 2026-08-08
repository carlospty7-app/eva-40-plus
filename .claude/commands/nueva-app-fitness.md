---
description: Crea una app de fitness/nutrición desde cero con dirección de arte derivada (referencia visual opcional, filtrada por la capa anti-IA)
---
NUEVA APP DE FITNESS — desde cero, con dirección de arte derivada (referencia opcional)
(Requiere: el sistema en docs/sistema/. La imagen de referencia es OPCIONAL.)

Voy a crear una app de fitness/nutrición desde cero. Sigue el protocolo de docs/sistema/INICIO.md
con las respuestas adelantadas del contexto de abajo.

━━━ CONTEXTO (tu idea: qué hace, para quién, qué la hace única · di si adjuntas referencia) ━━━
$ARGUMENTS

Si el contexto viene vacío, pregúntame la idea antes de nada (o propón 3 opciones de app de
fitness con potencial de venta en Hotmart y déjame elegir).

REFERENCIA VISUAL (opcional):
 • SI ADJUNTO una imagen de referencia: analízala siguiendo el ANÁLISIS DE REFERENCIAS de
   docs/sistema/INICIO.md y el PASO 0.48 de docs/sistema/16-DIRECCION-DE-ARTE.md. Extrae su
   dirección de arte completa (paleta y dónde usa el acento, tipografía, radios, tratamiento de
   gráficos y cards, densidad informativa) — PERO pásala SIEMPRE por el filtro de LA CAPA ANTI-IA
   del 16: si la referencia ES el cliché "dark + acento neón + glow" (el look-IA que el 16
   prohíbe), se toma su ESTRUCTURA y su nivel de craft (layout, densidad controlada, estilo de
   gráficos, jerarquía) pero el COLOR y el MODO se REDERIVAN desde mi audiencia con el PASO 0
   del 16 — nada de heredar el neón porque "la referencia lo tenía". Quiero ESE nivel de pulido
   o mejor, con identidad propia (no una copia).
 • SI NO ADJUNTO imagen: no me la pidas ni la des por existente. La dirección visual se DERIVA
   completa con el PASO 0 del 16 (brief → arquetipo → mundo del sujeto → paleta/tipografía/motion)
   + la matriz audiencia×nicho de 29-REFERENCIA-VISUAL.md para fitness. El modo (oscuro/claro)
   se deriva de mi audiencia — NO se asume dark por ser fitness.

PROCESO (sigue el ciclo profesional de docs/sistema/12-FLUJO-AGENTICO.md):
1. Dirección de arte: con referencia → análisis + filtro anti-IA; sin referencia → PASO 0 del 16.
   En ambos casos preséntame la ficha de DIRECCIÓN DE ARTE (paleta con hex, tipografía, craft,
   regla del acento, modo derivado y por qué) y ESPERA MI OK.
2. Define la idea, features (3-5 máx) y el App Brief siguiendo docs/sistema/01-IDEACION.md.
3. Diseña arquitectura y flujo con docs/sistema/04 y 15-PATRONES-UX.md.
4. DETENTE y muéstrame el plan visual + de pantallas antes de codear. ESPERA MI OK.
5. (tras mi OK) Construye aplicando RIGUROSAMENTE:
   - docs/sistema/14-LEYES-DE-DISENO.md (specs numéricas exactas)
   - docs/sistema/16-DIRECCION-DE-ARTE.md (identidad audaz y cohesiva, capa anti-IA)
   - docs/sistema/17-VISUALIZACION-DATOS.md (los gráficos del dashboard: anillos, barras, macros)
   - docs/sistema/15-PATRONES-UX.md (skeleton, empty states, micro-interacciones, háptica)
   - docs/sistema/11-DISENO-EMOCIONAL.md (personalidad, celebraciones, movimiento)
6. Verifica tsc + build + dev server en cada capa y mírala renderizada a 375px (regla 7 de
   CLAUDE.md). Test final: "si quito el logo, ¿se distingue de un template Y de las otras apps
   de este SO?" — y cierra actualizando ESTADO.md.

Personalidad sugerida: enérgica, motivadora, premium — el acento y el modo los DERIVA el PASO 0
del 16 según mi audiencia concreta (un acento audaz está bien; el combo neón+glow+dark por
defecto, no). Empieza por el punto 1.
