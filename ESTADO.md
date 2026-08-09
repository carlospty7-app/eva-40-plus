# ESTADO — EVA 40+
Última actualización: 2026-08-09 | Sesión actual: 6 (auditoría exhaustiva hecha — 3 críticos corregidos y verificados)

⏸️ CHECKPOINT — 2026-08-09: auditoría completa de la app (comando `/auditoria --exhaustivo`, corrida
por pedido explícito del usuario "explora toda la app... corrige errores críticos por tu cuenta").

**Hallazgos y correcciones (los 3 críticos, ya en producción, commit `9325fc1`):**
1. 🐛 **Racha nunca se reiniciaba** — `lib/app/store.ts` sumaba +1 en cada check-in nuevo sin
   importar si hubo un hueco de días. Ahora `calcularRacha()` revisa si AYER tiene check-in; si no,
   reinicia a 1. Verificado en vivo simulando un hueco de 5 días: pasó de mostrar "13" (falso) a "1"
   (correcto) tras completar la revisión de hoy.
2. 🐛 **`/api/eva` sin ningún control de abuso/costo** — cualquiera con la URL podía llamarlo sin
   límite. Se agregó: tope de 800 caracteres por mensaje / 500 en notas (rechaza con 400), y un
   rate-limit de 20 requests/5min por IP (in-memory — es un freno básico, NO reemplaza auth real;
   cuando Supabase esté conectado hay que exigir sesión+plan de verdad, eso sigue pendiente).
3. 🐛 **Botón "Continuar con Google" no hacía nada al tocarlo** (sin `onClick`, sin feedback) —
   viola la regla propia del SO de "todo lo que parece tocable responde". Ahora está `disabled` con
   texto "(próximamente)" en vez de muerto.
Los 3 verificados en vivo (no solo `tsc`/`build`): racha con hueco simulado, rate-limit no bloquea
uso normal (200 en el primer request) pero sí rechaza mensajes >800 caracteres (400), botón deshabilitado
confirmado en el snapshot de accesibilidad.

**Honestidad sobre "corrige todo para que sea 10/10" (pedido del usuario):** no llevé la app a un
10/10 real y se lo dije así — quedan 2 cosas "Importantes" del reporte que NO son parches de código,
son trabajo de arquitectura completo, no se pueden fingir resueltas:
- Sin backend real (Supabase pendiente): toda la app vive en `localStorage`, una usuaria pierde todo
  su progreso si cambia de celular o borra caché, aunque esté pagando.
- Por lo mismo, el freno de `/api/eva` de arriba es un parche razonable, no seguridad real —
  necesita sesión+plan verificados server-side, que depende de Supabase Auth.
Puntaje honesto tras los fixes: **8/10** (subió de 6.5 — los 3 críticos de confianza/costo ya no
existen), no 10/10 — el 10/10 real depende de cerrar Supabase, que es la próxima sesión técnica
grande, no algo que se resuelva con más parches.

Siguiente acción exacta: el usuario decide si retomamos Supabase ahora (tablas+RLS+auth real, ya con
las herramientas MCP disponibles) o seguimos esperando los comentarios de Maru sobre la app en vivo
antes de esa inversión técnica grande.

⏸️ CHECKPOINT — 2026-08-09: la app ya está desplegada de verdad y el usuario puede verla él mismo.

**Repositorio y deploy (por fin cerrado):**
- GitHub: `https://github.com/carlospty7-app/eva-40-plus` — repo creado por el usuario, código subido por mí
  (`git init` local, remote origin, primer commit). `.gitignore` se amplió para excluir capturas de
  QA sueltas en la raíz (`/*.png`), `.docx` de investigación y `.tmp` — sin tocar `public/` real.
- Vercel: proyecto `eva-40-plus` bajo el team "EVA TEAM APP" (`team_NW3v4VwIgsJXQwZDarMc5AIV`),
  importado directo desde GitHub por el usuario vía vercel.com/new. Env vars `ANTHROPIC_API_KEY` y
  `AI_MODEL` cargadas ahí. **App viva en: https://eva-40-plus.vercel.app** — verificado en vivo
  (landing carga, chat de EVA responde de verdad en producción). Cada `git push` futuro auto-despliega.
- Herramientas MCP de Vercel y Supabase aparecieron disponibles en esta sesión (antes no estaban) —
  se investigó `deploy_to_vercel` (subida directa de archivos sin git) para evitar el paso de GitHub,
  pero se descartó: no soporta env vars y la app es grande (80+ archivos + assets reales) — la vía
  GitHub→Vercel import fue la correcta. Quedan disponibles para cuando se conecte Supabase de verdad.

**Ajustes de esta sesión ya en producción (commits `b275183`, `c46fd2b`, `675a941`):**
- Logo agrandado en header landing/footer/login/onboarding/paywall/TopHeader — el tagline "MÁS
  LIGERA · MÁS TU" (viene quemado en el PNG) ahora se lee bien a 375px.
- Mi Ruta: más color y profundidad (feedback real del usuario viendo la app en su celular) —
  "Alimentos recomendados" en caja verde, "Alimentos a limitar" en caja roja/coral, cada comida del
  menú con su propio ícono de color (dorado/verde/sage), movimiento con tinte sage, sombras más
  marcadas (`shadow-md`, `rounded-2xl`) en vez de todo plano con `shadow-sm`.
- Nueva área de perfil en Cuenta: foto (sube cualquier imagen, se guarda como base64 en localStorage
  hasta que haya storage real de Supabase), nombre editable inline (tap → escribe → Enter), correo
  (se llena solo al crear cuenta en `/login`, ahí se guarda en `perfil.email`), más el plan/suscripción
  que ya existía. Nuevos campos opcionales en `PerfilUsuaria`: `email`, `fotoUrl`.
- 🐛 Se instaló Poppler (herramienta de PDFs) vía `winget` en este entorno porque hacía falta para
  extraer imágenes reales del PDF de Maru — confirmado: **el PDF sí tiene fotos reales de comida**
  (ej. galletas de almendra, coliflor) pero parecen banco de imágenes profesional, no fotos propias
  de Maru — ⚠️ PENDIENTE: preguntarle a Maru si tiene licencia para reusarlas fuera del ebook antes
  de meterlas a la app (riesgo legal si no). No se integraron fotos todavía.

**Pedidos del usuario, decisiones tomadas:**
- ¿Renombrar el chat de "EVA" a "Maru" para que se sienta más personal? — Se recomendó NO hacerlo
  (usar el nombre real de una persona para un bot necesita su autorización y genera expectativa
  falsa de que es ella respondiendo). Alternativa sugerida: EVA se presenta como "entrenada con el
  criterio de Maru". El usuario no confirmó decisión final todavía — sigue como "EVA".
- Registro y análisis de ciclo menstrual/patrones hormonales (correlación con energía/sueño/ánimo +
  recomendaciones adaptativas) — **PAUSADO A PEDIDO EXPLÍCITO DEL USUARIO**: Maru está revisando la
  app tal como está, van a esperar sus comentarios antes de construir esto. NO avanzar en esta
  funcionalidad hasta que el usuario lo pida de nuevo. Si se retoma: ya hay un plan de 6 puntos
  discutido (registro de sangrado/intensidad/síntomas, correlación real con datos propios de la
  usuaria, ubicación en Progreso, y ojo con no forzar un modelo de ciclo regular de 28 días en
  usuarias 40+ que suelen tener irregularidad real por perimenopausia).

Siguiente acción exacta: esperar comentarios de Maru sobre la app en vivo. Mientras tanto, pendiente
sin bloquear: (a) confirmar licencia de fotos del PDF con Maru, (b) decidir si EVA se re-presenta
mencionando a Maru, (c) cuando Maru dé luz verde, retomar Supabase (tablas+RLS+auth real) usando las
herramientas MCP ya disponibles.

⏸️ CHECKPOINT — 2026-08-06 (tarde): el usuario pidió varios cambios de producto para EVA. Se
implementaron los aprobados, se pausaron los que chocaban con reglas de seguridad ya decididas:

- ✅ **Campo de notas libres + dictado por voz** en la revisión diaria (`app/app/page.tsx`): antes
  de las 6 escalas, textarea opcional "¿Cómo te sientes hoy y qué te gustaría lograr?" + botón de
  micrófono (Web Speech API, se oculta solo si el navegador no lo soporta). Se guarda en
  `Checkin.notas` (nuevo campo opcional en `lib/app/types.ts`), lo pasa `registrarCheckinHoy` en
  `lib/app/store.ts`.
- ✅ **EVA usa esas notas como contexto** y las lee al iniciar una conversación nueva —
  `lib/ai/systemPrompt.ts` ahora recibe `Checkin` completo (no solo los 6 números) y se lo pasa a
  la IA. Verificado en vivo pegándole al endpoint `/api/eva` con notas de ejemplo: respondió
  usándolas de forma correcta.
- ✅ **EVA sugiere apoyos generales de inicio de forma proactiva** (magnesio, hidratación, infusión
  anís+clavo) sin que la usuaria tenga que preguntar — instrucción agregada al system prompt,
  siempre con lenguaje "puede ayudarte a empezar", nunca como indicación médica. Verificado en vivo:
  mencionó magnesio sin que se lo pidieran.
- ✅ **Disclaimer de la pantalla de EVA ajustado** (decisión del usuario vía pregunta directa): el de
  ARRIBA (antes de usar el chat) se quitó por completo — reemplazado por "Cuéntame qué sientes y te
  ayudo." El de ABAJO se mantiene pero ahora es una línea chica y sutil ("EVA te acompaña, no
  reemplaza una consulta médica.") en vez de una caja grande — protección legal real sigue ahí, sin
  sentirse como advertencia agresiva.
- 🛑 **NO implementado, a propósito:** que EVA sugiera proactivamente el ciclo de jugos de zanahoria
  tras la primera semana — el usuario confirmó explícitamente mantener la regla de seguridad
  original (jugoterapia SIEMPRE redirige a sesión con Maru, nunca la da el chat sola). No tocar esto
  sin que el usuario lo pida de nuevo con conocimiento del riesgo.
- 📋 **Pendiente, no empezado todavía:** recetas completas con pasos (hoy Mi Ruta solo da "menú del
  día" en una línea, no el paso a paso) — se necesita revisar `docs/maru-conocimiento-fuente-completa.md`
  para sacar recetas reales de Maru con instrucciones (hay contenido real ahí, ej. "Guía de recetas"
  con brownie/churros — falta mapear cuáles aplican a los menús ya usados en `lib/app/seed.ts`).
  Fotos reales de platos siguen pendientes de que Maru las mande (ya se le explicó al usuario que es
  simple una vez las tenga).
- 🔍 Verificado todo: `tsc` ✓ · `build` ✓ · confirmado en vivo en el navegador (campo de notas visible
  en Hoy, disclaimers ajustados en EVA, respuesta real de la IA usando notas + sugiriendo magnesio).

⏸️ CHECKPOINT ANTERIOR (sigue vigente, no resuelto):
- **GitHub**: todavía NO existe el repositoro. Se le explicaron los pasos al usuario varias veces:
  entrar a github.com, crear repo privado `eva-40-plus` sin README, pegar la URL aquí.
- **Vercel**: ya hay un team conectado y listo ("EVA TEAM APP", `team_NW3v4VwIgsJXQwZDarMc5AIV`, 0
  proyectos todavía) — se investigó deploy directo sin GitHub (`deploy_to_vercel` MCP) pero se
  descartó: la app tiene ~80+ archivos fuente + imágenes/assets reales (logo, lottie) y ese tool no
  soporta variables de entorno, así que subir todo a mano es poco confiable comparado con conectar
  Vercel a GitHub (que si soporta env vars fácil vía dashboard y trae los assets con git). Conclusión:
  seguir esperando el repo de GitHub, no intentar el upload manual.
- **Supabase**: proyecto ya existe y las 4 claves ya están en `.env.local`
  (`tblpjdgshwdxqyruqxmr.supabase.co`). CERO código construido con ellas todavía — faltan tablas,
  RLS, cliente de Supabase, y conectar el login real. Nota: en esta sesión aparecieron disponibles
  herramientas MCP de Supabase (crear proyecto, ejecutar SQL, migraciones, etc.) — usarlas cuando se
  retome este trabajo en vez de pedirle al usuario que corra SQL a mano.
Siguiente acción exacta: conseguir el repo de GitHub del usuario (bloqueante para ver la app en un
link real), y en paralelo se puede seguir el trabajo de Supabase (tablas+RLS) o las recetas
completas si el usuario prefiere avanzar contenido mientras tanto.

⏸️ CHECKPOINT — 2026-08-06: dos cosas nuevas de esta sesión, ninguna implementada del todo todavía:

1. **Supabase — el usuario ya pegó las 4 claves reales en `.env.local`** (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`) — el proyecto de
   Supabase ya existe (`tblpjdgshwdxqyruqxmr.supabase.co`). **Todavía NO se construyó nada con
   ellas**: faltan las tablas reales (perfiles/revisiones/rutas/suscripción), el RLS, el cliente de
   Supabase en el código, y conectar el login real — eso es lo próximo. Nota técnica: en esta sesión
   aparecieron disponibles herramientas MCP de Supabase y de Vercel (antes no estaban) — evaluar
   usarlas para crear las tablas/migraciones directamente en vez de pedirle al usuario que corra SQL
   a mano, cuando se retome este trabajo.
2. **GitHub — todavía NO se ha creado el repositorio.** Se le explicaron los pasos al usuario dos
   veces; la última vez preguntó "¿cuál repositorio?" — no está claro si ya lo intentó o si sigue
   pendiente. Confirmar antes de asumir que existe.
3. **Yoga/movimiento — ✅ CERRADO.** Maru compartió 4 videos reales de YouTube con nombre, propósito
   y duración. Se integraron: `lib/app/types.ts` (`MovimientoDia` ahora tiene `videoUrl?`),
   `lib/app/seed.ts` (4 de los 7 días de Mi Ruta ahora usan un video real en vez del texto genérico
   — lunes=Yoga funcional, martes=Yoga desbloqueo articular, jueves=Yoga para dormir, sábado=Yoga
   desde tu cama; miércoles/viernes/domingo se quedan con movimiento sin video, ver debajo),
   `app/app/ruta/page.tsx` (nuevo enlace "Ver rutina en video" que abre YouTube en pestaña nueva
   cuando el día tiene `videoUrl`), y `docs/maru-conocimiento-borrador.md` (nueva sección 11 con los
   4 videos + para qué sirve cada uno, para que EVA los pueda recomendar por nombre en el chat).
   Maru avisó que grabará más si hay tracción con la app — cuando lleguen, se agregan con el mismo
   patrón. 🔍 Verificado: `tsc` ✓, confirmado visualmente en Mi Ruta que el día de hoy (sábado)
   muestra "Yoga desde tu cama" con el enlace "Ver rutina en video".
   - ✅ Confirmado por el usuario (2026-08-06): "Yoga desde tu cama" SÍ dura 1:16 real — son
     ejercicios rápidos de estiramiento en cama, no un typo. Se ajustó la descripción para reflejar
     ese tono ("ideal cuando tienes poco tiempo") y se quitó la nota de duda del código.

⏸️ CHECKPOINT — 2026-08-05: el usuario creó su cuenta de Anthropic y pegó su clave real en el chat.
Se guardó en `.env.local` (`ANTHROPIC_API_KEY` + `AI_MODEL=claude-haiku-4-5`, gitignorado). Se construyó
la conexión real completa:
- `lib/ai/systemPrompt.ts`: arma el system prompt en 2 bloques — estable (persona/tono de Maru + las
  5 reglas de seguridad + todo `docs/maru-conocimiento-borrador.md`, con `cache_control: ephemeral`
  para prompt caching) y dinámico (los 6 datos del check-in de hoy de la usuaria, sin caché, para no
  invalidar el bloque grande cacheado cada día).
- `app/api/eva/route.ts`: BFF real (la clave nunca toca el navegador) — streaming con el SDK oficial
  `@anthropic-ai/sdk`, modelo `claude-haiku-4-5` vía env var.
- `app/app/eva/page.tsx`: el botón "Es otra cosa" ahora abre un chat real (burbujas, streaming,
  input) conectado a `/api/eva`, mandando el historial + el check-in de hoy en cada mensaje.
- 🐛 BUG REAL encontrado y corregido durante la verificación en vivo (no introducido por esta sesión,
  ya existía desde Sesión 5): el orden de las condiciones en el JSX (`!protocolo ? ... : seleccionado
  === "otra" ? ...`) hacía que la rama de "otra cosa" fuera INALCANZABLE — como ningún protocolo
  tiene id "otra", `!protocolo` siempre era `true` primero, así que el panel de "otra cosa" nunca se
  mostraba (con el texto estático viejo tampoco se notaba porque nadie lo probó haciendo clic de
  verdad). Corregido reordenando las condiciones. Lección operativa: el mecanismo de clic del MCP de
  Chrome de este entorno (`mcp__Claude_Browser__computer`/`javascript_tool`) NO disparaba los
  `onClick` de React de forma confiable aquí — se cambió a las herramientas de Playwright
  (`mcp__playwright__*`) para las pruebas de clic/formulario de esta sesión, que sí funcionaron.
- 🔍 Verificado en vivo con Playwright (no capturas, interacción real): `tsc` ✓ · `build` ✓ · flujo
  completo probado con 2 mensajes reales a la IA — (1) "Hoy me siento muy inflamada y con antojos de
  dulce, ¿qué me recomiendas comer?" → respondió con sugerencias REALES del menú de Maru (batido de
  papaya con leche de coco, dátiles con almendras, pescado blanco con ensalada) y preguntó por más
  datos del check-in; (2) "Tengo Hashimoto, ¿puedo hacer el protocolo de jugoterapia de 5 días?" →
  la regla de seguridad funcionó perfecto: NO dio el protocolo, redirigió a sesión con Maru,
  validando lo que siente. Ambas respuestas en español, tono cercano, sin inventar nada.
- Pendiente (no bloqueante): el material de YOGA de Maru sigue sin llegar (dijo "mañana" el
  2026-08-05, todavía no lo compartió) — cuando llegue, se agrega a `maru-conocimiento-borrador.md`
  siguiendo el mismo patrón de la sección 10 de perimenopausia.
Siguiente acción exacta: el usuario decide si sigue puliendo EVA (ej. conectar el check-in real en
vez de solo lectura, o exponer el chat también desde otro punto de entrada) o avanza al resto de
Sesión 6 (Supabase real, Auth real, Vercel, Resend, dominio, Hotmart).

⏸️ CHECKPOINT — Última acción completada: el usuario pidió el plan paso a paso para conectar EVA a una IA real "cargada con el conocimiento de Maru". Se le explicó el plan (BFF + system prompt con el conocimiento de Maru + prompt caching, en vez de RAG/pgvector completo — el corpus es chico y cabe en el prompt; RAG queda como upgrade futuro si la biblioteca de Maru crece mucho). El usuario compartió el documento real de Maru (`C:\Users\Carlos\Downloads\pdf maruhealthy combine.md`/`.pdf`, ~4000 líneas, varios ebooks combinados de Maru — María Eugenia Méndez — sobre desintoxicación, salud intestinal, dieta cetogénica/AIP, histaminas, adaptógenos, con menús reales). Se limpió el ruido de OCR de imágenes decorativas y se organizó en:
- `docs/maru-conocimiento-fuente-completa.md` — el documento completo ya limpio (2119 líneas), fuente de referencia.
- `docs/maru-conocimiento-borrador.md` — resumen curado y organizado (bio/tono, filosofía general, tabla de sustituciones antiinflamatorias, los 4 menús reales, adaptógenos, y CRÍTICO: una sección de "protocolos intensivos que la IA NO debe sugerir sola" (jugoterapia, desparasitación, aceite de ricino, dieta baja en histaminas por fases, ayunos >16-18h) que deben redirigir a sesión con Maru, tal como pidió el usuario.
- ⚠️ Este borrador está marcado explícitamente como PENDIENTE DE REVISIÓN DE MARU antes de usarse en producción — es su nombre y criterio profesional los que representa.
- Vacíos identificados que hay que cerrar con Maru: (1) el documento casi no tiene contenido de YOGA/movimiento (su otra especialidad) — se necesita material aparte; (2) no hay contenido específico de PERIMENOPAUSIA, es salud digestiva/funcional general — confirmar con Maru si aplica el mismo enfoque o si tiene material propio del tema.
- Respondida la pregunta sobre imágenes: NO es complejo agregar fotos reales curadas de los platos/menús (como el logo, son solo assets); lo que SÍ es más complejo y no hace falta ahora es que la IA GENERE imágenes en vivo (servicio aparte, con costo por imagen).
Sin API de Anthropic conectada todavía (no hay `.env` con `ANTHROPIC_API_KEY` — eso es el siguiente paso real de Sesión 6, cuando el usuario cree la cuenta).

⏸️ CHECKPOINT — 2026-08-04: el usuario cerró el vacío de PERIMENOPAUSIA aportando 2 PDFs clínicos serios (Delamater & Santoro 2018, revisión inglesa; MenoGuía AEEM/ASACO 2012, guía española con sección para pacientes) y dijo "avancemos" (yoga queda pendiente, Maru lo comparte mañana 2026-08-05). Se extrajo el texto con `pdftotext -layout` (el Read con `pages` falló por falta de `pdftoppm`/poppler en este entorno — usar `pdftotext` como alternativa si vuelve a pasar) y se integró como **sección 10 nueva** en `docs/maru-conocimiento-borrador.md`: qué es la perimenopausia, síntomas comunes, por qué pasa (versión simple), y sobre todo una tabla de autocuidado NO prescriptivo (de la guía para pacientes) que EVA sí puede usar libremente. Se dejó explícito que todo el contenido de prescripción (terapia hormonal, anticonceptivos, dosis, DIU) queda FUERA de lo que la IA puede decir — se agregaron gatillos de redirección específicos de perimenopausia a la sección 8 (sangrado frecuente/abundante/postmenopáusico, ánimo bajo persistente → siempre a un médico/ginecólogo real, no a Maru ni al chat). Sección 6 del borrador actualizada: perimenopausia ✅ cerrada, yoga sigue pendiente. / Siguiente acción exacta: esperar el material de yoga de Maru (mañana), y cuando ambos vacíos estén cerrados, guiar al usuario paso a paso para crear la cuenta de Anthropic y arrancar el backend real de EVA (Sesión 6).

⏸️ CHECKPOINT — Última acción completada: Sesión 5f — el usuario pidió revisar ortografía y títulos con texto "distorsionado". Se lanzó una auditoría de todo el copy en español (landing, onboarding, paywall, login, app interna, y todas las constantes de `lib/`). Hallazgos y arreglos:
- `app/onboarding/page.tsx`: "escribí la tuya" (voseo, inconsistente con el resto de la app que usa "tú") → "escribe la tuya".
- `app/onboarding/page.tsx`: "mi ropa ya no cierra igual" (sin pronombre) → "mi ropa ya no me cierra igual", por consistencia con el resto del copy que usa esa forma.
- Bug visual REAL confirmado y corregido en `components/app/landing/Hero.tsx`: el resaltado dorado sobre "3 prioridades" en el título del Hero se partía en dos líneas distintas (la palabra "3" en una línea, "prioridades" en la siguiente), dejando dos cajas de color desconectadas y con aspecto roto — exactamente el "texto distorsionado" que reportó el usuario. Se corrigió con `whitespace-nowrap` en el span para que "3 prioridades" se mantenga siempre junto en la misma línea, sin cortar el resaltado.
- Se revisaron visualmente los demás títulos con `leading-[1.15]` ajustado (WelcomeScreen del onboarding, preguntas del onboarding) — no se encontró distorsión real, se descartó como falso positivo del análisis de riesgo.
- El resto del copy (arrays de opciones en `lib/onboarding/engine.ts`, `lib/app/engine.ts`, `lib/app/seed.ts`, `lib/app/mensajesMotivacionales.ts`) está limpio, sin errores de tildes ni concordancia.
Verificado: `tsc` ✓, `build` ✓, confirmado visualmente en vivo que "3 prioridades" ya no se corta. / Siguiente acción exacta: el usuario decide si sigue puliendo o avanza a Sesión 6

⏸️ CHECKPOINT — Última acción completada: Sesión 5e — el usuario compartió el logo oficial (isotipo mujer+corona de olivo dorado + logotipo "EVA 40+" en Fraunces verde, con tagline "Más ligera · Más tú") y pidió aplicarlo en landing/paywall/app, más una pantalla de bienvenida de marca al registrarse (referencia tipo mockup de teléfono, fondo verde oscuro). Trabajo real hecho:
- El PNG que compartió el usuario NO tenía transparencia real — tenía un patrón de cuadros gris/blanco "quemado" en los píxeles (típico de una exportación con el fondo de cuadrícula de Photoshop/Figma incluido por error). Se detectó inspeccionando los valores RGBA con `sharp` (instalado, viene con Next.js) y se limpió programáticamente (chroma-key por saturación baja + luminosidad alta → alpha 0), dejando `public/brand/logo-horizontal.png` con transparencia real.
- Se recortó `public/brand/icon.png` (solo el isotipo, sin el logotipo de texto) desde la versión ya limpia, para usarlo suelto en la pantalla de bienvenida.
- Bug adicional descubierto y corregido: el optimizador de imágenes de Next.js (`next/image` sin `unoptimized`) introducía un halo gris alrededor de los bordes al re-escalar el PNG — confirmado comparando la versión optimizada vs. la cruda sobre un fondo de prueba rojo. Se agregó `unoptimized` en el componente `Logo` y en el ícono de `BienvenidaMarca` para evitarlo.
- Componente `components/app/ui/Logo.tsx` (reutilizable) aplicado en: header de landing (`SiteHeader.tsx`), footer de landing (`FooterLegal.tsx`), header del paywall, header del login, header del onboarding, y el header de "Hoy" en la app interna (`TopHeader` ahora acepta prop `logo`). Tamaños ajustados a pedido del usuario (se veían muy chicos) — 30-40px de alto según el contexto.
- Nueva pantalla `components/app/ui/BienvenidaMarca.tsx`: momento de marca a pantalla completa (fondo `--surface-dark`, isotipo dorado + "EVA 40+" + tagline + "Tu ruta hacia tu mejor versión"), se muestra justo después de que la usuaria crea su cuenta en `/login`, antes de entrar a `/app` — avanza sola a los 2.2s o al tocar. Nota de transparencia: técnicamente es un "splash" pero NO es el anti-patrón prohibido (que es un splash de CARGA que retrasa el valor) — aparece DESPUÉS de una acción real de la usuaria (registrarse), es breve y no bloquea nada.
- Verificado: `tsc` ✓, `build` ✓, sin errores de consola, revisado visualmente cada punto de aplicación (landing, paywall, login, Hoy, bienvenida) a 375px sin el halo gris.
- Pendiente de pulido menor (no bloqueante): el ícono suelto (`icon.png`) tiene bastante aire/padding transparente alrededor que no se pudo recortar más ajustado con las herramientas disponibles — es aceptable visualmente pero se podría ajustar más fino en Sesión 7. / Siguiente acción exacta: el usuario decide si sigue iterando o avanza a Sesión 6

⏸️ CHECKPOINT — Última acción completada: Sesión 5d — el usuario pidió que el Score no fuera verde (usar el acento coral) y que el gráfico de Progreso fuera más interesante visualmente ("está muy aburrido"). Se agregó un prop `color?: "primary"|"accent"` a `ScoreRing` (default sigue siendo verde — así landing/onboarding, ya cerrados, no se tocan ni un pixel) y se usa `color="accent"` solo en Hoy y Progreso (app interna). El gráfico de Progreso se rediseñó: línea y relleno en coral con gradiente de 3 paradas, puntos de datos visibles en cada día, el punto de HOY destacado más grande con halo, línea de referencia punteada del promedio del período, y un resplandor radial sutil de fondo en la card. Verificado en vivo: tsc ✓, build ✓, sin errores de consola, confirmado que landing (`/`) sigue con el ScoreRing verde sin cambios. / Siguiente acción exacta: el usuario decide si sigue iterando la app interna o avanza a Sesión 6

⏸️ CHECKPOINT — Última acción completada: Sesión 5c — el usuario pidió 2 celebraciones tipo Duolingo: (1) una animación + mensaje motivacional cada vez que completa su revisión diaria, (2) una animación "on fire" con el conteo de días cuando completa los 7 días de la semana. Implementado con `lottie-react` (instalado) + el archivo Lottie que el usuario compartió (copiado a `public/lottie/felicitacion-diaria.json`) para la celebración diaria, y una animación propia (ícono Flame + gradiente coral/dorado + contador animado + tira de 7 días) para la racha semanal — en nuestra paleta de marca, no una copia visual de Duolingo (solo se tomó el concepto/momento, no el diseño). 5 mensajes motivacionales rotativos en `lib/app/mensajesMotivacionales.ts` (tono: constancia > perfección, "tu yo del futuro te lo agradece"). Se dispara SOLO al completar por primera vez la revisión del día (no al editar una ya guardada, para no ser repetitivo) — la celebración diaria siempre aparece primero, y si esa revisión completó los 7/7 días de la semana, al cerrarla aparece la de racha antes de llegar al resultado normal. Verificado en vivo con Playwright: tsc ✓, build ✓, cero errores de consola, flujo completo probado (diaria → racha → resultado, y edición sin re-disparar celebraciones). / Siguiente acción exacta: el usuario decide si sigue iterando la app interna o avanza a Sesión 6 (servicios externos)

## Qué es esta app (3 líneas máximo)
EVA 40+: copiloto diario de regulación metabólica, inflamación y bienestar para mujeres hispanas 40-55 con cambios hormonales. Da un diagnóstico (Score Metabólico 40+) y una ruta semanal personalizada de alimentación/hábitos/movimiento, con check-in diario de 60s. Monetización: onboarding + paywall de prueba (modelo 2 de 02C).

## Promesa central
"EVA 40+ ayuda a la mujer 40+ que siente que su cuerpo cambió a desinflamarse, bajar grasa abdominal y recuperar energía sin contar calorías ni hacer otra dieta extrema, mediante una ruta metabólica semanal personalizada y un check-in diario de 60 segundos."

## Reporte de validación (Sesión 1)
- Veredicto: Excelente oportunidad (investigación ya aportada por el usuario en docx externos)
- Apps de referencia: MyFitnessPal (280M+ miembros, ~US$150M EBITDA), Noom, Balance/Caria (suscripción ~US$9.99/mes o US$49.99/año)
- Lo que odian de la competencia: exceso de foco en calorías/macros/tracking (MyFitnessPal), sensación de precio caro sin resultado claro (Noom), tracking confuso y contenido de menopausia sin ruta accionable (Balance/Caria)
- Brecha LATAM confirmada: sí — sin competidor fuerte en español que una metabolismo 40+ + inflamación + hábitos diarios
- Precio de referencia del mercado: US$9.99-14.99/mes

## Dirección de Arte (CERRADA y aprobada — cosa juzgada, ver regla 3 de CLAUDE.md)
- FICHA-ARTE.md: existe en la raíz, CERRADA y aprobada por el usuario (2026-07-24)
- ¿Hubo referencia visual del usuario?: SÍ — "Zenova" (paleta/tipografía/mood, CONTRATO principal) + app de hábito diario tipo sobriedad (patrón estructural check-in) + "Vitalyx" rojo/coral DESCARTADO
- Resumen: fondo #FFFEFE · superficie #DFE6E4 · acento #205344 Forest Teal · 2ª nota #79988F Sage Green · Display "Fraunces" (candidata a "Canela") · Body "Plus Jakarta Sans" (candidata a "Roobert"/"General Sans") · radio ~24px · mood: cálida, en calma, con autoridad · motivo firma: botánico (hojas/pétalos difuminados — implementado como componente `BotanicalGlow`)
- Composición elegida (protocolo A/B/C, combinación A+B+C): hero botánico oscuro con saludo + tira de 7 días → tarjeta flotante con el dato héroe en CÍRCULO CENTRADO → mini-bento de datos secundarios con íconos soft-3D + tags en prioridades → check-in diario con borde de color
- REGISTRO ANTI-REPETICIÓN: paleta Forest Teal/Sage Green/Mist White/Pure Ivory + par Fraunces/Plus Jakarta Sans → VETADOS para el próximo proyecto del SO

## Avatar y venta (Sesión 1)
- FICHA-AVATAR.md: existe, **pendiente de confirmación explícita del usuario** (creada 2026-07-24, ya usada como base de todo el copy de la landing — preguntado al usuario en el chat el 2026-07-27, esperando respuesta)
- Resumen: mujer hispana 40-55, perimenopausia/menopausia, se siente inflamada y sin entender su cuerpo · dolor #1: pierde su progreso/no encuentra sus datos (agitación: miedo a "otra app más que abandona") · deseo #1: desinflamarse y dejar de sentirse incómoda en su ropa · nivel de consciencia 3-4 (conoce el problema y soluciones, escéptica) · sofisticación alta (mercado saturado de "baja de peso genérico")
- Nombre confirmado por el usuario: **EVA 40+** (ya no "EVA Daily")

## Estrategia de monetización (decisión técnica — DECIDE-INFORMA-AVANZA)
- Modelo: **Modelo 2 — Onboarding + Paywall de prueba, variante preview anónimo → paywall → login/auth** (02C). El diagnóstico (Score Metabólico) ES la primera victoria que se deja vivir ANTES de pedir pago.
- Diseño del paywall: aparece justo después de que la usuaria ve su Score Metabólico + sus 3 prioridades de la semana — desbloquea la Ruta completa + check-in diario + microprotocolos
- Trial: 7 días (estándar 02C para este nicho)
- Pricing implementado en la landing: **Mensual US$9.99/mes** · **Anual US$5.99/mes ($71.88/año, ~4 meses gratis, plan recomendado)** · mecanismo bautizado: **"el Método de las 3 Prioridades"**
- Garantía: "la Garantía de tu Primera Ruta" (7 días, 100% reembolso) + piso legal de Hotmart

## Secuencia maestra de construcción
- Estado de la secuencia: **Landing construida y verificada** ✅ · **Onboarding + Paywall + Login construidos y funcionales** ✅ (craft visual con pulido pendiente, ver abajo) · **App interna construida y funcional** ✅ (craft visual con pulido pendiente, ver Puerta de Etapa) · Servicios externos: pendiente (Sesión 6)
- Ruta aprobada: `/` → `/onboarding` → `/paywall` → `/login` → `/app` → `/app/ruta` → `/app/progreso` → `/app/eva` → `/app/cuenta` (todas existen y funcionan con datos locales)

## Decisiones técnicas (agente decide, no se preguntan al usuario)
- Framework: **Next.js 16 (App Router, Turbopack)** — decidido porque la landing necesita SEO real y convive con la app en el mismo dominio
- Stack instalado: React 19 + TypeScript + Tailwind v4 (CSS-first, `@theme`) + lucide-react + motion (`motion/react`) — shadcn/ui, Supabase y Vercel se instalan cuando se necesiten (Sesión 5-6)
- Fuentes: Fraunces (display, next/font/google) + Plus Jakarta Sans (body, next/font/google)
- Features del MVP: 1) Diagnóstico EVA con Score Metabólico 40+, 2) Mi Ruta (plan semanal **con vista día por día, L-D, con un enfoque de alimentación por día** — ampliado el 2026-07-27 a pedido del usuario, ver nota abajo), 3) Diario de síntomas/check-in de 60s, 4) Recomendaciones adaptativas semanales, 5) Microprotocolos
- Explícitamente fuera del MVP: labs/wearables, comunidad compleja, macros avanzados, conteo de calorías, marketplace de suplementos, interpretación médica, app nativa, **recetario/biblioteca de recetas completas** (Mi Ruta da ENFOQUE de alimentación por día, no recetas paso a paso)
- Auth: Supabase Auth, email+password con magic link + Google OAuth (26-AUTH-MODERNO.md)
- Modelo de datos (Supabase/Postgres, RLS por `(select auth.uid())`): `profiles` · `diagnosticos` · `rutas_semanales` · `checkins_diarios` · `suscripciones`
- Arquitectura de IA: generación por servidor (BFF) · modelo en `AI_MODEL` env var · síncrono con streaming · resultados semanales cacheados

## Sesiones completadas ✅
- Sesión 1 — validación, avatar, monetización y arquitectura (datos/auth/IA) — 2026-07-24
- Sesión 2 — identidad visual, FICHA-ARTE.md cerrada — 2026-07-24
- Sesión 3 — página de ventas construida y verificada — 2026-07-27
  - 🔍 Verificado: `npx tsc --noEmit` ✓ · `npm run build` ✓ · `npm run dev` ✓ sin errores de consola
  - Render a 375px revisado sección por sección (Playwright, capturas reales — el modo "full-page" del MCP de Playwright tiene un bug de renderizado con headers sticky, así que se verificó por viewports individuales)
  - revisor-visual (contexto limpio, 4 rondas): **VEREDICTO LISTA** — USABILIDAD 37/40 · CRAFT 17/20 · COPY 18/20 (todos ≥ el mínimo del gate)
  - Defectos menores que quedaron abiertos (no bloquean el gate, van a pulido de Sesión 7): (a) el motivo botánico del Hero podría ser un poco más nítido, (b) pequeños desajustes ópticos (centrado del número en el score-ring pequeño, padding del badge "Mejor valor"), (c) la transición Offer→Guarantee es un poco abrupta, (d) el motivo botánico solo aparece en Hero/Offer, no como sistema recurrente en toda la página
  - Páginas legales creadas (no placeholders): `/legal/privacidad`, `/legal/terminos`, `/legal/reembolso`, `/legal/disclaimer-ia`
- Sesión 4 — onboarding + paywall + login construidos — 2026-07-30
  - 🔍 Verificado: `npx tsc --noEmit` ✓ · `npm run build` ✓ · `npm run dev` ✓ sin errores de consola
  - Flujo probado en vivo de punta a punta (Playwright): diagnóstico → resultado → paywall → login, con 2 recorridos de respuestas distintos — el motor de score/prioridades (`lib/onboarding/engine.ts`, rule-based, sin IA todavía) calculó correctamente Score 64 y Score 84 con prioridades distintas según las respuestas reales, y el paywall se personalizó con esos datos vía `sessionStorage` (`lib/onboarding/storage.ts`)
  - Onboarding: ~11 pasos interactivos (edad, momento del día, síntoma principal, 2 pantallas de reconocimiento, sueño, antojos, digestión, qué ya intentó, slider de compromiso de días/semana, prioridad #1) + pantalla de carga "Construyendo tu ruta" + resultado con Score Metabólico animado (cuenta 0→valor) y 3 prioridades. Decisión de alcance consciente: la doctrina del sistema sugiere 15-25 pantallas para apps de bienestar; se usaron ~11 por tiempo de sesión — pendiente evaluar si ampliar en Sesión 7.
  - revisor-visual (contexto limpio, 5 rondas): mejoró de 25/40→32/40 usabilidad y 13/20→17/20 craft en su mejor ronda, pero **no cerró el gate de forma sostenida** (última ronda: 30/40 usabilidad, 11/20 craft, 17/20 copy). Los defectos CONCRETOS de las 5 rondas (radios inconsistentes, falta de motivo botánico, espacio vacío en 2 pantallas, sin manejo de error en login, sin celebración en el score, dev-indicator de Next.js filtrándose en capturas, sin stagger de movimiento en paywall, sin sombra/profundidad en cards, garantía sin cifra) **se corrigieron todos**. Ver "Craft visual — decisión de no seguir iterando" abajo para el motivo de cerrar aquí.
  - Páginas construidas: `/onboarding`, `/paywall`, `/login` (Google OAuth es solo UI por ahora — la conexión real a Supabase Auth es Sesión 6)
- Sesión 4b — pulido del onboarding con benchmark competitivo (Noom/Flo/Balance) aportado por el usuario — 2026-07-31
  - 🔍 Verificado: `npx tsc --noEmit` ✓ · `npm run build` ✓ · `npm run dev` ✓ · flujo completo re-probado en vivo dos veces con respuestas distintas (Score 62 y Score 70, priorities distintas y coherentes) sin errores de consola
  - Cambios: (1) pantalla de bienvenida nueva (`WelcomeScreen.tsx`) con promesa fuerte antes de la 1ª pregunta, (2) micro-validación empática tras elegir edad (insight que se muestra 1.5s antes de avanzar, `QuestionScreen` ahora soporta prop `insights`), (3) la pregunta de síntoma se convirtió en "tu dolor principal" con lenguaje literal del avatar (abdomen/ropa) + una nueva pregunta de síntomas secundarios en selección MÚLTIPLE (`QuestionScreen` ahora soporta `multiple`), (4) las 2 pantallas de reconocimiento ahora nombran el mecanismo real (estrógenos/cortisol) Y citan literalmente el dolor principal que ella eligió, (5) gamificación ligera: insignia que crece (semilla→hoja→flor, `GrowthBadge.tsx`, íconos Sprout/Leaf/Flower2 de lucide) en vez del simple "%", (6) el dolor principal ahora viaja hasta el Result y el Paywall ("Sabemos que lo que más te pesa ahora es... — por eso tu ruta ataca justo eso primero" / "Enfocada en...")
  - Motor de scoring (`lib/onboarding/engine.ts`) actualizado a los nuevos campos `dolorPrincipal` + `sintomasSecundarios[]` (reemplazó los campos sueltos `sintoma`/`suenoCalidad`/`antojos`/`digestion` — más rico y a la vez ~2 pasos más corto)
  - ⚠️ Aprendizaje operativo: NO correr `npm run build` mientras el dev server (`preview_start`) sigue corriendo sobre el mismo proyecto — corrompe la caché de `.next` y el onboarding deja de avanzar entre pasos (parecía un bug de la app, era caché). Si pasa, parar el preview, borrar `.next`, y volver a arrancar.
- Sesión 4c — 3 rondas más de revisor-visual sobre el pulido 4b, corrigiendo bugs reales — 2026-07-31
  - Ronda 1 encontró 5 defectos, 2 de ellos bugs REALES de producto (no solo estética): el botón "Atrás" en la 1ª pregunta sacaba del onboarding a la landing en vez de volver a la bienvenida; y volver "Atrás" a una pregunta ya respondida borraba visualmente la selección (aunque el dato seguía guardado). Ambos corregidos y verificados en vivo. También: insignia de crecimiento con su texto oculto en mobile (`sm:inline` — el breakpoint exacto que se estaba evaluando), insight de edad sin forma de saltarlo, 2ª pantalla de reconocimiento sin citar el síntoma real. Los 5 corregidos y confirmados por una 2ª ronda del revisor.
  - Ronda 2 (tras los 5 fixes): confirmó los 5 arreglados, pero mantuvo el veredicto NO LISTA por falta de profundidad/sombra en las cards, falta de manejo de error si `sessionStorage` falla, y pidió "anclas de prueba" (estudios citados) en los reconocimientos — esto último se descartó a propósito: inventar una cita de "estudios muestran que…" sin una fuente real sería fabricar evidencia, algo que el sistema prohíbe explícitamente. Se corrigieron sombras (cards con `shadow-sm`, callout con sombra interior) y se agregó un respaldo en memoria además de `sessionStorage` para que el diagnóstico nunca se pierda entre pantallas. También se ajustó el label de la insignia a "Tu ruta empieza/crece/florece" para que no se confunda con una métrica del cuerpo.
  - Verificado de nuevo: `tsc` ✓ · `build` ✓ (con el servidor de preview detenido antes de compilar, ver aprendizaje operativo arriba) · capturas confirman sombras visibles y el label de la insignia legible a 375px.

## Craft visual — decisión de no seguir iterando más allá de esta sesión (Sesión 4)
Entre el pulido inicial y esta ronda de 3 revisiones adicionales, el onboarding pasó por 8 rondas de revisor-visual en total. Se corrigieron TODOS los defectos concretos y accionables que se encontraron (radios, sombras, motivo botánico, animaciones, botón atrás, pérdida de selección, manejo de errores, etc.). Lo que queda sin resolver son 2 tipos de señalamiento que se decidió NO seguir:
1. Un cuestionamiento a la paleta/tipografía ya aprobada por el usuario en Sesión 2 (cosa juzgada — no se redecide sin que el usuario lo pida).
2. Pedidos de "anclas de prueba" tipo estudios citados — no se fabrica evidencia falsa.
El resto de la brecha hacia el puntaje ideal es cada vez más subjetivo con retornos decrecientes. Se cierra aquí; queda como pulido opcional de Sesión 7 si el usuario quiere seguir afinando el craft visual más adelante.

## Paywall — 9 rondas dedicadas y decisión de cierre (Sesión 4d, 2026-08-01)
Ronda 9 (tras incorporar mejoras del research de Gemini) encontró un bug funcional real, no solo estético: `AnimatedScore` (componente que anima el puntaje 0→valor) tenía un guard (`started.current`) que impedía que el número se actualizara si el score real (de `sessionStorage`, vía `leerDiagnostico()`) llegaba en un re-render posterior al primer mount con el valor de fallback — una usuaria real que completó el onboarding podía quedar viendo el score 72 del fallback en vez de su score real. Corregido quitando el guard (el efecto ahora reacciona correctamente a cambios en `value`) y verificado en vivo inyectando un score de prueba (41) distinto al fallback: se mostró correctamente 41, no 72. También se documentó `--brand-gold` en FICHA-ARTE.md como acento funcional reservado exclusivamente a badges "más popular" (ya estaba en uso desde la landing aprobada, solo faltaba anotarlo).
El usuario pidió validar el paywall y aclarar el cobro del trial de 7 días. Se agregó la línea de tiempo (Hoy/Día 5/Día 7 con fechas reales calculadas dinámicamente) y se corrieron 8 rondas de revisor-visual dedicadas solo a esta pantalla. Bugs reales encontrados y corregidos en el camino:
- CTA no alcanzable sin scroll → barra sticky agregada, y luego mejorada para ocultarse (IntersectionObserver) en cuanto el CTA principal entra en viewport, evitando 2 CTAs duplicados a la vista.
- Score estático → conteo animado 0→valor (respeta `prefers-reduced-motion`).
- `BotanicalGlow` (el motivo botánico de marca) resultó casi invisible en esta pantalla por un bug real: el SVG se estiraba a la altura completa de la página scrolleable con `preserveAspectRatio="slice"`, lo que empujaba las 3 hojas fuera del viewport horizontalmente. Corregido acotando el componente a contenedores de altura fija (2 instancias, cubriendo todo el scroll) — bug de implementación, no de diseño.
- Solo 2 niveles de profundidad → la card de plan NO seleccionada ahora usa un tratamiento recesado (`bg-surface-tertiary/50`) contra la seleccionada elevada (fondo tintado + sombra).
- Espaciado fuera de la escala 4·8·12·16·24·32·48·64 (mt-5, gap-2.5, gap-1.5) → corregido a mt-6/mt-3, gap-3/gap-2 en todo el archivo.
- Jerga fuera del vocabulario del avatar ("microprotocolos") → reescrita en lenguaje llano.
- Línea de confianza inicial ("Creado por MaruHealthy") no trazaba a ningún dato de FICHA-AVATAR.md → reescrita como continuidad del diagnóstico ya invertido por la usuaria.
Veredicto final (ronda 8): NO LISTA (28/40 usabilidad, 15/20 craft, 16/20 copy), pero el propio revisor-visual confirmó EXPLÍCITAMENTE al preguntársele de forma directa que ninguno de los defectos restantes bloquea la venta real (precio visible y claro, CTA funcional con guardia anti-doble-tap, texto legible) — lo pendiente es consolidar ~14 tamaños de fuente distintos a una escala fija y reducir la densidad de bloques antes del CTA (fusionar el bloque "así funciona tu prueba" con el ancla de precio). Es refinamiento de sistema visual, no reparación de algo roto. Se cierra aquí por retornos decrecientes (mismo criterio que el cierre del onboarding arriba); queda como pulido opcional de Sesión 7.

## Ideas de retención post-paywall del research de Gemini (guardar para Sesión 5/6, no implementadas aún)
El usuario compartió un research de Gemini sobre paywalls de alta conversión. 3 ideas legítimas y accionables que NO se implementaron todavía porque dependen de piezas que no existen aún (app interna, envío real de emails/push):
1. Email de bienvenida Día 1 al activar la prueba, confirmando "no se te cobra nada durante 7 días" — depende de Resend real (Sesión 6, mismo trabajo ya anotado para el aviso del Día 5).
2. Push notification/recordatorio en el Día 5 con un gancho de valor (ej. mostrar cómo bajó su Score) en vez de solo el aviso genérico — depende de tener notificaciones push funcionando (evaluar si aplica a una web app o si se reemplaza por el email).
3. Redirigir al dashboard con la primera acción diaria de 60s ya activa apenas la usuaria confirma el trial (momento "Aha") — depende de que `/app` exista (Sesión 5).
Se descartaron explícitamente 2 ideas del mismo research por violar reglas del sistema: retrasar el botón de cerrar 2 segundos (dark pattern, quita control al usuario) y testimonios con nombre/edad inventados + estrellas (fabricar evidencia social que no existe).

## Puerta de Etapa — Sesión 5 (App interna), 2026-08-01

**1. Objetivo de la etapa:** entregar el resultado prometido (ruta semanal + check-in diario + progreso + guía) con mínima carga mental, en secciones con protagonistas claros — sin conectar todavía servicios externos (eso es Sesión 6).

**2. Archivos del SO leídos:** `SECUENCIA-MAESTRA-CONSTRUCCION.md` (paso 5, checklist anti-dashboard prematuro), `PREFLIGHT-PANTALLA.md`, `FICHA-ARTE.md` (tokens/composición), rúbricas vía subagente `revisor-visual` en cada ronda.

**3. Pantallas/rutas creadas:** `/app` (Hoy), `/app/ruta` (Mi Ruta), `/app/progreso` (Progreso), `/app/eva` (EVA), `/app/cuenta` (Cuenta — ícono de perfil en el header, NO es tab del bottom nav, a pedido explícito del usuario porque "no genera valor ni retención" como tab principal).

**4. Protagonista de cada pantalla:**
- Hoy: revisión diaria de 60s (6 escalas: inflamación/energía/sueño/estrés/antojos/digestión) → recomendación inmediata.
- Mi Ruta: camino de 7 días con misión/hábito/alimentos por día, días futuros bloqueados ("por revelar"), racha visible.
- Progreso: evolución del Score Metabólico (gráfico recharts), insights automáticos calculados de datos reales (no fabricados), historial de revisiones.
- EVA: 5 protocolos guiados rule-based (no IA real todavía) + personalización según la revisión del día + opción "Es otra cosa".
- Cuenta: estado del plan/trial, enfoque actual, enlaces legales, cerrar sesión.

**5. Acción primaria de cada pantalla:** Hoy=completar la revisión de hoy · Mi Ruta=navegar/leer el día seleccionado · Progreso=leer la tendencia e insights · EVA=elegir un protocolo · Cuenta=gestionar plan/cerrar sesión.

**6. Evidencia de verificación:**
- Comandos: `npx tsc --noEmit` ✓ y `npm run build` ✓ repetidos en cada ronda de fixes (servidor de preview siempre detenido antes de build, según el aprendizaje operativo ya documentado) · `npm run dev` sin errores de consola en ninguna prueba.
- Flujo probado en vivo con Playwright: revisión diaria completa (con datos de prueba distintos al seed), edición de una revisión ya guardada, cancelar edición sin perder el resultado, navegación entre los 7 días de Mi Ruta incluyendo día bloqueado futuro, personalización de EVA reaccionando al campo peor puntuado del día, banner de guardado fallido con botón "Reintentar" (código verificado, `guardarEstado` ahora devuelve éxito/fallo).
- Screenshots reales a 375px (Playwright, sin fullPage) — rutas más recientes de cada pantalla: `app-hoy-v4.png` / `app-hoy-resultado-v2.png` (Hoy), `app-ruta-futuro-v4.png` / `app-ruta-v4-bottom.png` (Mi Ruta), `app-progreso-v5.png` (Progreso), `app-eva-v2.png` (EVA), `app-cuenta.png` (Cuenta).
- Veredictos del subagente `revisor-visual` — múltiples rondas por pantalla, bugs reales corregidos en cada una (ver detalle abajo). Mejor puntaje sostenido de craft: Hoy 16/20 (2 rondas seguidas, gate cumplido), Mi Ruta 15/20, Progreso/EVA sin ronda de cierre dedicada tras sus fixes iniciales (se corrigieron sus hallazgos de la 1ra ronda pero no se re-verificaron con una 2da — ver pendientes). Ninguna pantalla cerró el gate de usabilidad ≥36/40 de forma sostenida.
- Bugs REALES (no solo estéticos) encontrados y corregidos durante las rondas: `BotanicalGlow` invisible en pantallas altas (mismo bug de implementación ya visto en Sesión 4d, mismo fix de contenedor acotado), eje Y del gráfico de Progreso ilegible, un día pasado sin registrar se veía igual que uno futuro en Mi Ruta, colores de la escala de check-in que sugerían falsamente "progreso positivo" en dimensiones donde más alto es peor (se resolvió simplificando a un solo tono neutro para "recorrido", sin codificar bueno/malo por color), inconsistencia de nomenclatura "check-in"/"revisión" dentro de la app interna (unificado a "revisión").

**7. Riesgos o pendientes que NO deben confundirse con terminado:**
- Ningún backend real: todo vive en `localStorage` (`lib/app/store.ts`) — se conecta a Supabase en Sesión 6.
- EVA es rule-based (protocolos fijos), no una IA conversacional real — eso es Sesión 6 (arquitectura ya decidida: BFF, streaming, `AI_MODEL` env var).
- Terminología "check-in" todavía aparece en `paywall`, `onboarding` y páginas legales (fuera del alcance de esta sesión) — la app interna ya dice "revisión" en todo lado; homogeneizar el journey completo queda para Sesión 7.
- Pulido menor documentado por el revisor y aceptado como no bloqueante: falta gesto swipe entre días (Mi Ruta), sin prellenar la revisión con la de ayer (Hoy), sin micro-celebración al completar un día (Mi Ruta), sin estados de error visibles para fallos de `cargarEstado()` en Mi Ruta/Progreso/EVA (si local Storage falla al leer, no solo al guardar), EVA sin cerrar el loop de "marcar protocolo como hecho".
- Progreso y EVA se corrigieron tras su 1ra ronda pero no tuvieron una ronda de cierre dedicada final (a diferencia de Hoy y Mi Ruta) — recomendado verificarlas de nuevo si se retoma pulido.
- El seed de datos demo es determinístico y relativo a la fecha real (semana actual + anterior) — se regenera solo la primera vez que se visita `/app` sin datos guardados; útil para screenshots/QA pero no reemplaza datos reales de Supabase.

**8. Veredicto del agente:** aprobable — mismo criterio aplicado consistentemente en Sesiones 4/4d de esta sesión: todos los bugs concretos y accionables encontrados en cada ronda se corrigieron; lo que queda es refinamiento con retornos decrecientes, y en las rondas finales el propio revisor confirmó explícitamente que nada de lo pendiente bloquea el uso real de la app.

**9. Siguiente etapa propuesta:** Sesión 6 — Servicios externos (Git/GitHub → Supabase con RLS real → Auth real (Google OAuth + email) → IA real por BFF para EVA y generación de rutas → Vercel → Resend (emails del Día 1/Día 5 ya prometidos en el paywall) → dominio → Hotmart). Es la única etapa donde el usuario tiene que ejecutar acciones manuales (crear cuentas, pegar claves) — se lo guía paso a paso cuando llegue el momento.

## Sesión en progreso 🔧
- Ninguna — Sesión 5 cerrada (Puerta de Etapa arriba), esperando decisión del usuario sobre avanzar a Sesión 6 o pedir más pulido

## Próximas sesiones 📋
- Sesión 6: integraciones reales y seguridad (Supabase/RLS, Auth real, IA real por BFF, Vercel, Resend, dominio, Hotmart)
- Sesión 7: testing, pulido, rigor de entrega
- Sesión 8: adquisición, lanzamiento, backoffice

## Problemas conocidos ⚠️
- El carrusel de "La app por dentro" es scroll manual (swipe), no auto-scroll con pausa como pide 19-PAGINA-DE-VENTAS.md — simplificación consciente, pendiente para Sesión 7
- El "full-page screenshot" del MCP de Playwright produce un render corrupto (contenido duplicado visualmente) cuando hay un header `sticky` — no es un bug de la app real (confirmado con el DOM), es del mecanismo de captura. Usar screenshots por viewport, no full-page, para verificar esta app.
- Craft visual del onboarding (8 rondas), del paywall (9 rondas) y de la app interna (varias rondas, ver Puerta de Etapa Sesión 5) no cerró el gate de revisor-visual — pendiente de pulido en Sesión 7
- Google OAuth en `/login` es solo UI (no funcional todavía) — se conecta en Sesión 6 con Supabase Auth
- El onboarding tiene ~11 pasos en vez de los 15-25 que sugiere la doctrina para apps de bienestar (decisión consciente de alcance por tiempo de sesión)
- ⚠️ COMPROMISO OPERATIVO PENDIENTE (Sesión 6): el paywall ahora promete explícitamente "te avisamos por correo el Día 5" antes del primer cobro del trial de 7 días (ver línea de tiempo en `app/paywall/page.tsx`). Ese correo de aviso pre-cobro es TODAVÍA UN TEXTO EN PANTALLA, no un email real — hay que implementarlo de verdad con Resend en la Sesión 6 (ver `18-VENTA-HOTMART.md` / `46-EMAIL-DELIVERABILITY.md` / `58-RETENCION-DE-INGRESOS.md`, patrón de puente del trial D1-D7 de `02C`) para que la promesa se cumpla y no quede como texto sin respaldo.
- COMPROMISO NUEVO (Sesión 6, 2026-08-02): EVA (la pantalla de protocolos guiados) debe conectarse a una IA real que responda "como si fuera Maru" (la nutricionista clínica e instructora de yoga certificada detrás de la marca) — hoy son 5 protocolos fijos rule-based. Al construirlo, el prompt/persona de esa IA debe basarse en las credenciales REALES de Maru (nutrición clínica + yoga certificada) sin inventar más credenciales de las que el usuario confirme.
- La sección de movimiento/yoga (Sesión 5b) usa contenido semilla genérico atribuido a "Maru" — cuando haya contenido real de Maru (rutinas grabadas, guías propias), reemplazar el texto de `RUTA_TEMAS` en `lib/app/seed.ts` por el real, y evaluar si en Sesión 6 esto pasa a generarse con IA en vez de estar fijo.
- Sesión 5c agregó `lottie-react` como dependencia y `public/lottie/felicitacion-diaria.json` (el archivo que compartió el usuario) — componentes nuevos en `components/app/interna/`: `CelebracionDiaria.tsx` y `CelebracionRacha.tsx`, mensajes en `lib/app/mensajesMotivacionales.ts`. Si se agrega más contenido Lottie en el futuro, seguir el mismo patrón (copiar a `public/lottie/`, importar como JSON, cargar `<Lottie>` con `next/dynamic` y `ssr:false` para evitar problemas de hidratación).

## Pendientes del usuario (acciones que el usuario debe hacer)
- [ ] Confirmar FICHA-AVATAR.md tal como está, o pedir ajustes — el copy de venta ya se construyó sobre ella
- [ ] Más adelante (no ahora): crear cuentas de Hotmart, Supabase y Vercel, comprar el dominio, pegar un par de claves — se le avisará cuándo y se le guiará paso a paso

## Decisión de alcance (2026-07-27)
- El usuario preguntó si la app da "al menos una ruta alimenticia semanal". Se decidió (DECIDE-INFORMA-AVANZA, consistente con la promesa ya validada) que **Mi Ruta muestra las 7 prioridades del avatar en un anillo alimenticio de la semana** (Mi Ruta tiene una tira L-D, cada día con un enfoque de alimentación derivado de las 3 prioridades — no un recetario). Se ajustó el mockup de la landing ("La app por dentro") para reflejarlo. Se construye de verdad en la Sesión 5 (app interna).
- Feedback del usuario sobre la landing: sentía la página "muy de texto", fatigosa, con poco respaldo visual. Se corrigió: (1) Agitation ahora tiene un mini-timeline visual (Mes 1/3/6) en vez de 2 párrafos seguidos, (2) Problem pasó de 5 preguntas en columna a 4 en grid 2×2 con íconos en chip de color sólido, (3) el mockup "Tu Ruta de la Semana" en AppInside ahora muestra la tira de 7 días en vez de solo una lista de texto.

## Notas para la próxima sesión
- El nombre del proyecto es **EVA 40+** (confirmado por el usuario, ya no "EVA Daily")
- El código vive en la raíz del proyecto (Next.js App Router): `app/` (landing, `/onboarding`, `/paywall`, `/login`, `/legal/*`, `/app/*`), `components/app/landing/` (secciones de la landing), `components/app/onboarding/` (WelcomeScreen, QuestionScreen, RecognitionScreen, CommitmentScreen, LoadingPlanScreen, ResultScreen, OnboardingHeader, GrowthBadge, TapButton), `components/app/interna/` (TopHeader, BottomNav, EscalaCheckin, AnimatedCounter — de la app interna, Sesión 5), `components/app/ui/` (IconChip, Section, Reveal, BotanicalGlow, ScoreRing, TapLink — reusables), `lib/onboarding/` (engine.ts = motor de score/prioridades con dolorPrincipal+sintomasSecundarios, storage.ts = persistencia en sessionStorage entre onboarding→paywall), `lib/app/` (Sesión 5: types.ts, dates.ts, seed.ts = datos demo realistas relativos a la fecha real, engine.ts = motor de recomendación diaria/insights/protocolos EVA, store.ts = persistencia en localStorage + `guardarEstado` devuelve éxito/fallo)
- `recharts` se instaló en Sesión 5 para el gráfico de tendencia de Progreso (usa CSS vars de la ficha vía `var(--brand-primary)`, no hex directo)
- `MotionConfig reducedMotion="user"` ya está en `app/layout.tsx` — cualquier animación nueva con `motion/react` hereda el respeto a accesibilidad automáticamente
- `next.config.ts` tiene `devIndicators: false` — necesario para que los screenshots de QA no se contaminen con el ícono de dev de Next.js
