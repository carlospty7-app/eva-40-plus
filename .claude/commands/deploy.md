---
description: Publica la app en producción de principio a fin (GitHub + Supabase + Vercel) con pre-vuelo de seguridad
---
PROTOCOLO DE DEPLOY AUTOMÁTICO — publica la app de principio a fin, tú solo
(ÚNICO paso del usuario: conectar GitHub, Supabase y Vercel — vía conectores/MCP o CLIs autenticadas.)

Regla canónica actualizada: aplica primero `docs/sistema/PROMPT-DEPLOY.txt`, especialmente avisar
con ⚠️ lo que requiere cuentas, dominio, claves, costos o riesgos críticos antes de publicar.

Publica esta app en producción de PRINCIPIO A FIN tú solo, usando los conectores de GitHub,
Supabase y Vercel que ya dejé conectados. Si alguno no está conectado o le falta permiso, dime el
clic exacto y sigue avanzando con lo que sí puedas. Si no hay conectores disponibles, hazlo por CLI
(gh, supabase, vercel): maneja primera-vez vs repo/proyecto ya existente por cada servicio, y guíame
con el clic exacto cuando haga falta (crear cuenta, autorizar en el navegador). Resuelve todo lo que
puedas SIN preguntar; agrupa en UN solo mensaje lo poco que necesites de mí. Háblame simple, sin
tecnicismos. Actualiza ESTADO.md al terminar.

━━━ CONTEXTO (dominio deseado, claves que ya tengo, servicio ya creado) ━━━
$ARGUMENTS
(Si viene vacío, deduce el stack y el estado del deploy de ESTADO.md y del código.)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 0 — PRE-VUELO (obligatorio, sin preguntar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- `npx tsc --noEmit` y `npm run build` limpios. Si fallan, corrige la CAUSA RAÍZ con CLAUDE.md.
- Corre la auditoría de docs/sistema/27-REVISION-SEGURIDAD.md (grep de fail-open, npm audit, secretos,
  RLS, IDOR). NO publiques con un hallazgo crítico abierto: corrígelo o avísame en una línea.
- Confirma `.env` en `.gitignore` y que NINGUNA clave sensible esté en el frontend (patrón BFF, archivo 09).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 1 — GITHUB
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Crea el repositorio (PRIVADO por defecto, porque es una app para vender) y sube el código con el
commit "feat: MVP inicial". Si ya existe repo, haz commit y push de lo pendiente.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 2 — SUPABASE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Aplica el esquema/migraciones con el flujo declarativo (docs/sistema/25-BASE-DE-DATOS.md), activa
RLS en TODAS las tablas con `(select auth.uid())` + índice de cada política, y corre `db advisors`
(sin alertas críticas). Deja listas las variables de entorno del servidor.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 3 — VERCEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Importa el repo, detecta el framework, configura las variables de entorno del servidor (las
sensibles NUNCA con prefijo NEXT_PUBLIC_/VITE_) y despliega. Verifica que la URL de producción
carga sin errores en consola.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 4 — LO ÚNICO QUE NECESITO DE TI (pídemelo TODO junto, en un mensaje)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Las claves de las APIs que use la app (Anthropic / Gemini "Nano Banana" / ElevenLabs) y, si vendes
  por Hotmart, el hottok. Tú las pones en el entorno del servidor, NUNCA en el repo.
- Si quieres dominio propio: dime cuál y te doy los registros DNS exactos para pegarlos donde lo compraste.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASO 5 — REPORTE DE CIERRE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Pre-vuelo (build + auditoría 27)   ✅ GitHub [link]   ✅ Supabase [RLS + migraciones]
✅ Vercel [link de producción]   ⚠️ Pendientes míos (si hay)   🚀 App en vivo: [link]

REGLAS: resuelve solo lo que puedas sin preguntar; una sola tanda de preguntas; lenguaje simple;
si algo falla, una línea de qué pasó y cómo lo resuelves; nunca subas secretos al repo.
