---
description: Instrumenta la analítica de la app (funnel canónico, atribución ?src=, conversión server-side, D1/D7/D30) y la conecta al backoffice
---
ANALÍTICA — instrumenta la app para saber QUÉ pasa de verdad (funnel, retención, atribución)

Regla canónica: aplica primero `docs/sistema/PROMPT-ANALITICA.txt`, especialmente la taxonomía
del 36, la regla "solo se mide lo que responde una decisión" y la verificación de que cada
evento LLEGA de verdad.

Instrumenta esta app para que las decisiones se tomen con DATOS, no con sensaciones: qué hace la
gente, dónde se cae el funnel, de dónde vienen los que compran, y si vuelven. Un evento que nadie
va a mirar es deuda, no dato. Primero auditoría y plan, y ESPERA MI OK antes de tocar código.

━━━ CONTEXTO (la pregunta que te quita el sueño, herramienta actual si existe) ━━━
$ARGUMENTS

Si viene vacío, dedúcelo del código y cubre el funnel completo.

LEE PRIMERO: 36-ANALITICA-Y-EVENTOS (la taxonomía canónica y el diccionario — es LA referencia),
24-GAMIFICACION (sus eventos van en inglés — la excepción), 21-BACKOFFICE (donde estos números
se miran) y 02B-ONBOARDING-Y-PAYWALL (los pasos del funnel a medir).

FASE 1 — AUDITAR QUÉ SE MIDE HOY (solo lectura): eventos existentes vs diccionario del 36,
duplicados/rotos/huérfanos, ¿existe atribución?, ¿la conversión se registra en el servidor o
solo en el navegador (donde los adblockers la borran)?

FASE 2 — PLAN DE EVENTOS FALTANTES Y DETENTE (espera mi OK). Tabla:
| Evento | ¿Existe? | Qué decisión responde | Prioridad | — con estas reglas como ley:
  • Taxonomía snake_case en español; EXCEPCIÓN: los de gamificación del 24 en inglés.
  • FUNNEL CANÓNICO completo: app_abierta → onboarding → aha → paywall_visto → plan_actualizado.
  • MOMENTOS: momento_mostrado, logro_compartido.
  • ATRIBUCIÓN: ?src= de cada link viaja hasta profiles.source (qué canal trae COMPRADORES).
  • CONVERSIÓN SERVER-SIDE: la compra se registra desde el webhook de Hotmart, anti-adblock.
  • RETENCIÓN: lo mínimo para las curvas D1/D7/D30.
Cada evento propuesto dice QUÉ DECISIÓN responde; si no responde ninguna, no va.

FASE 3 — (tras mi OK) INSTRUMENTAR según el 36 (nombres, propiedades, dónde se disparan). Tras
cada bloque: tsc + build + dev limpios. Sin datos personales sensibles en las propiedades.

FASE 4 — VERIFICAR QUE CADA EVENTO LLEGA: dispara cada evento nuevo haciendo la acción como
usuario y confírmalo en el panel/tabla de destino con sus propiedades. Prueba la atribución
end-to-end (?src=prueba → registro → profiles.source = "prueba"). Un evento no verificado no existe.

FASE 5 — DASHBOARD MÍNIMO: conecta funnel con % de caída, ventas por fuente y D1/D7/D30 al
backoffice (21). Si el backoffice no existe, deja las consultas listas y anota que el botón
siguiente es /backoffice.

CIERRE: ESTADO.md actualizado (diccionario vivo de eventos, qué decisión responde cada grupo,
qué mirar en /operacion-mensual) + reporte con evidencia (✅ eventos implementados y VERIFICADOS ·
🔍 tsc ✓ build ✓ dev ✓ · ⚠️ pendientes). Empieza con la Fase 1.
