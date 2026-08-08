---
description: Construye el panel de admin del dueño (ventas, ganancia real, usuarios, costo de IA, avisos) con plan previo y tu OK
---
PANEL DE ADMIN (BACKOFFICE) — el panel del dueño: ventas, usuarios, métricas y costo de IA
(Útil cuando la app ya tiene clientes.)

Regla canónica actualizada: aplica primero `docs/sistema/PROMPT-BACKOFFICE.txt`, especialmente
las preguntas simples sobre el número principal, datos reales y quién puede entrar.

Constrúyeme el panel de administración de esta app (solo para mí, el dueño). Primero dame el plan de
secciones y ESPERA MI OK; luego constrúyelo con código real y protegido.

━━━ CONTEXTO (qué métricas me importan más, si ya hay event_log/ai_calls) ━━━
$ARGUMENTS

Si el contexto de arriba viene vacío o incompleto, dedúcelo de ESTADO.md (modelo de negocio, stack,
si hay IA/afiliados) y del código antes de proponer el plan.

LEE PRIMERO: docs/sistema/21-BACKOFFICE.md (secciones, event_log, logEvent, métricas, GANANCIA REAL
+ AVISOS al dueño), 09-SEGURIDAD.md + 26-AUTH-MODERNO.md (acceso solo-admin verificado en el
servidor + RLS), 31-EVALS-OBSERVABILIDAD-OPERACION.md (costo real de IA desde la tabla ai_calls),
40-UNIT-ECONOMICS.md (el modelo de margen que el panel muestra REAL), 36-ANALITICA-Y-EVENTOS.md (el
event_log es la fuente; PostHog NO se duplica) y 17-VISUALIZACION-DATOS.md (gráficos con specs Tufte).

INCLUYE:
 • VENTAS: ingresos, compras, cancelaciones, churn (separar voluntario vs involuntario), MRR (webhook/18).
 • GANANCIA REAL: lo que QUEDA tras costos (ingresos − Hotmart − afiliados − impuestos − IA de ai_calls
   − infra − email) + % de margen. "Facturaste $X y te quedaron $Y limpios". Es lo que más le importa al dueño.
 • USUARIOS: activación, retención D1/D7/D30, total y activos.
 • USO: acción principal y eventos del event_log (contrato de 24); funnel del onboarding.
 • NEGOCIO: LTV, CAC y ganancia POR CANAL (usando profiles.source), ratio LTV:CAC (≥3:1), payback.
 • IA (si aplica): costo real por feature y por usuario desde ai_calls; gasto del día.
 • AVISOS AUTOMÁTICOS al dueño (banner arriba, lenguaje simple, qué pasó→por qué importa→qué hacer):
   IA cara (>20% de ingresos), webhook fallando, churn involuntario alto, canal que pierde dinero,
   margen negativo. Si todo bien: "✅ Todo en orden este mes".
 • ERRORES: resumen de Sentry/logs; alertas abiertas.

REGLAS: acceso restringido a admin verificado EN EL SERVIDOR (no solo ocultando la ruta — eso es IDOR);
RLS que impida que un usuario normal lea estos datos; lenguaje claro, no técnico, con números que el
dueño entienda de un vistazo. Verifica tsc + build + dev al cerrar cada capa · mejora lo que exista,
no reescribas sin avisar · cero features nuevas (a ESTADO.md) · causa raíz, no parches · actualiza ESTADO.md.
