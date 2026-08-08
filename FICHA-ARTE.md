# FICHA DE DIRECCIÓN DE ARTE — EVA 40+

## Referencia del usuario (CONTRATO — ver 16, protocolo obligatorio)
- ¿Hay imagen(es) de referencia del usuario?: SÍ → 3 sets pegados en el chat (2026-07-24):
  (1) "Zenova" — brand kit completo (landing + typography + paleta + wearable) — REFERENCIA PRINCIPAL de paleta/tipografía/mood
  (2) App de hábito diario (saludo "Hello, Jice", tira de días, tareas de hoy, tabs Today/Toolkit/Discover/Connect/Profile, modal de registro con stepper) — REFERENCIA ESTRUCTURAL para la pantalla de check-in diario
  (3) "Vitalyx" (dashboard rojo/coral) — el usuario pidió explícitamente tonos VERDES y relajantes → esta referencia queda DESCARTADA para color; se ignora el rojo por completo
  - ⚠️ REVISIÓN CONSCIENTE (2026-08-02): el usuario pidió agregar un acento coral `#FF7A59` ("--brand-accent") a la app interna para darle más vida — a pesar de que esto se acerca a la familia de color de "Vitalyx" descartada arriba. Es un cambio explícito y deliberado del usuario sobre su propia decisión anterior, no un error del agente. Uso restringido a un solo elemento semántico por pantalla (60-30-10): la racha/streak (ícono Flame + número) en Hoy y Mi Ruta. NO se usa en landing/onboarding/paywall (fuera del alcance de este pedido) ni se expande a más elementos sin que el usuario lo pida.
- Extracción (mirada con herramienta de imágenes, de Zenova — la referencia de marca más completa):
  - Modo: claro (secciones oscuras verdes como bloques de énfasis, no como modo general) · Fondo: #FFFEFE (Pure Ivory) · Superficie: #DFE6E4 (Mist White) · Texto 1º: #1A2E27 (verde-negro sobre claro) / Texto 2º: #205344 sobre claro, blanco sobre bloques oscuros
  - Acento(s): #205344 (Forest Teal) — aparece en CTAs, bloques hero/oscuros, iconografía y precios · #79988F (Sage Green) — aparece en textos secundarios y detalles suaves
  - Display: serif editorial cálida — fuente de la imagen "Canela" (licencia paga/Klim) → candidatas open-source equivalentes: **Fraunces**, **Lora**, **Playfair Display** (Fraunces recomendada: tiene la misma calidez orgánica con ejes variables)
  - Body: sans grotesca geométrica — fuente de la imagen "Roobert" (licencia paga) → candidatas: **General Sans**, **Inter**, **Plus Jakarta Sans** (General Sans recomendada: proporciones más cercanas a Roobert)
  - Radio: cards ~24-32px · botones ~24px (pill) · el bloque de pricing usa esquinas muy grandes (~40px) con una "cola" curva abajo (forma orgánica, no rectángulo puro)
  - Espaciado base: aireado (mucho whitespace, secciones separadas por aire, no líneas)
  - Sombras: sutiles/casi ninguna — la profundidad viene de fotografía con blur de fondo, no de box-shadow
  - Bordes: no visibles — la separación es por color de fondo y espacio, no por líneas
  - Textura/gradiente/grano: fotografía botánica con blur (flores, mariposas) como fondo de hero y secciones — es la firma visual central de esta referencia
  - Layout: hero fotográfico + bento card flotante superpuesta, grid de 2x3 para "cómo funciona", carrusel de testimonios, sección de precios en bloque de color con esquina orgánica
  - Detalle firma a replicar: la mariposa como motivo recurrente + mockups de teléfono flotando en ángulo sobre fondo botánico difuminado
- Prohibiciones anti-IA que la referencia LEVANTA: ninguna — Zenova ya evita gradientes genéricos/glow/neón por su cuenta; se mantiene la capa anti-IA completa

## Referencia estructural secundaria (patrón de check-in diario, no de color)
- App de hábito/sobriedad: saludo con nombre + tira de 7 días (L-D) con el día activo resaltado en círculo oscuro, lista de "tareas de hoy" con tarjetas de borde de color por categoría e ícono de check circular, modal inferior (bottom sheet) con stepper +/- y botón de acción alternativa ("Did Not Drink" → en EVA sería algo como "Hoy no tuve antojos")
- Se adapta a EVA: la tira de días + lista de tareas de hoy encaja perfecto con el check-in de síntomas/hábitos de 60 segundos del MVP
- Bottom nav de 5 tabs (Today/Toolkit/Discover/Connect/Profile) → para EVA se adapta a las 3-5 secciones reales de la app interna (a definir en Sesión 5, probablemente: Hoy · Mi Ruta · Progreso · Perfil)

## Personalidad compilada
- 3 adjetivos de personalidad: cálida, en calma, con autoridad (no clínica-fría, no infantil)
- Compilación (11 — se detalla en Sesión 2 con 11-DISENO-EMOCIONAL.md): tendencia hacia motion suave y lento (spring poco rebotado), celebraciones discretas y elegantes (no confeti infantil), radio tendencial ~24px

## Brand kit preliminar (se confirma y se vuelca a globals.css en Sesión 2)
- Fondo: #FFFEFE · Superficie: #DFE6E4 · Hundido: variante más oscura de Mist White · Texto 1º: #1A2E27 / Texto 2º: #205344
- Acento: #205344 Forest Teal (SOLO en CTAs, iconografía activa, precios) · 2ª nota: #79988F Sage Green (textos secundarios, estados suaves)
- Semánticos: éxito verde más vivo (a definir con contraste AA) · error rojo cálido (no el rojo de Vitalyx) · aviso ámbar suave
- Nota funcional (documentada en Sesión 4d, uso ya vigente desde la landing): `--brand-gold` se usa EXCLUSIVAMENTE para el badge "Más popular/recomendado" en tarjetas de precio — no es un 3er acento decorativo de marca, es un solo punto funcional reservado a ese rol
- Display: Fraunces (pesos 400/500 para headlines) · Body: General Sans (pesos 400/500/600) · Escala exacta se fija en 10-DESIGN-TOKENS.md (Sesión 2)
- Radio: 24px base (botones pill, cards redondeadas) · Profundidad: sombras casi nulas + fotografía con blur como recurso de profundidad · Espaciado base: escala 4·8·12·16·24·32·48·64
- Dispositivo ownable: motivo de mariposa/botánico sutil (a perturbar para no clonar 1:1 — ver 54 en Sesión 2)
- Motion signature: se define en Sesión 2 (11-DISENO-EMOCIONAL.md)

## Trazabilidad y vetos
- Protocolo A/B/C: CERRADO. Ronda 1 → Opción A (editorial botánico, hero + tarjeta flotante), Opción B (ficha clínica cálida, bento + tags), Opción C (diario de bienestar, día-strip + check-in). Ronda 2 → mezcla A+B + Opción D (editorial de revista) + Opción E (ritual matutino, descartadas). El usuario eligió **combinar A+B+C** en la pantalla "Hoy": de A el hero botánico + tarjeta flotante + score en círculo CENTRADO (protagonista); de B los mini-bloques de datos (sueño/antojos) con íconos en chip soft-3D + las etiquetas ("Nuevo"/"Detonante"/"Hábito") en prioridades; de C el saludo con tira de 7 días + el check-in diario con borde de color y check circular.
- Página comparativa final: `direcciones-abc.html` (raíz del proyecto) — se borra antes del deploy a producción
- Paleta derivada de: referencia del usuario (Zenova)
- Registro anti-repetición: paleta Forest Teal/Sage Green/Mist White/Pure Ivory + par Fraunces/Plus Jakarta Sans quedan VETADOS para el próximo proyecto de este SO
- Modo (claro/oscuro): DERIVADO de la referencia — claro con bloques oscuros de énfasis (hero), NO dark mode general
- Composición final aprobada (patrón para el resto de pantallas de la app interna): hero oscuro con contexto/saludo arriba → tarjeta flotante blanca con el dato héroe en círculo centrado → bento de datos secundarios → listas con tag/borde de color según si es "prioridad" o "check-in"

## Idioma UI: español (LATAM) · Fecha de cierre: 2026-07-24 · Aprobada por el usuario: SÍ
