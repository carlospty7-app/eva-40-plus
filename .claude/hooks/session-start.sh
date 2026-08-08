#!/usr/bin/env bash
# SessionStart hook — inyecta CONTENIDO (no solo recordatorios) al arrancar, retomar
# o tras una compactación de contexto. Siempre exit 0 (informa, no bloquea).
#
# Doctrina: las decisiones de diseño deben estar EN el contexto de cada sesión,
# no depender de que el agente obedezca "lee el archivo X". Por eso este hook
# inyecta FICHA-ARTE.md y el PREFLIGHT completos.

echo "=== SO APPS · CONTEXTO DE ARRANQUE ==="

# 1) Estado del proyecto
if [ -f "ESTADO.md" ]; then
  echo "→ Existe ESTADO.md: LÉELO ANTES de cualquier cosa (es tu memoria persistente)."
  CHECKPOINT=$(grep -i -m1 "checkpoint" ESTADO.md 2>/dev/null || true)
  [ -n "$CHECKPOINT" ] && echo "  Último checkpoint anotado: $CHECKPOINT"
else
  echo "→ No hay ESTADO.md: proyecto nuevo → lee docs/sistema/INICIO.md y sigue sus FLUJOS A/B/C."
fi

# 2) FICHA DE DIRECCIÓN DE ARTE — inyección completa (sobrevive compactaciones)
if [ -f "FICHA-ARTE.md" ]; then
  echo ""
  echo "── FICHA DE DIRECCIÓN DE ARTE (contrato visual vigente — NO redecidir nada de esto) ──"
  head -70 FICHA-ARTE.md
  echo "── fin de la ficha ──"
elif [ -f "ESTADO.md" ]; then
  echo ""
  echo "⚠️ Hay ESTADO.md pero NO hay FICHA-ARTE.md. Si ya se decidió identidad visual, migra esas"
  echo "   decisiones a FICHA-ARTE.md (plantilla: docs/sistema/PLANTILLA-FICHA-ARTE.md) ANTES de"
  echo "   construir más UI. Si aún no hay identidad: se define en la sesión de identidad (16)."
fi

# 2b) FICHA DE AVATAR — el cliente ideal del que se deriva TODO el copy de venta
if [ -f "FICHA-AVATAR.md" ]; then
  echo ""
  echo "── FICHA DE AVATAR (cliente ideal — TODO copy de venta se DERIVA de aquí, no se inventa) ──"
  head -80 FICHA-AVATAR.md
  echo "── fin de la ficha de avatar ──"
elif [ -f "ESTADO.md" ]; then
  echo ""
  echo "⚠️ Hay ESTADO.md pero NO hay FICHA-AVATAR.md. PROHIBIDO escribir página de ventas, onboarding"
  echo "   o paywall sin ella (57-AVATAR-Y-CONSCIENCIA.md; plantilla: PLANTILLA-FICHA-AVATAR.md)."
fi

# 3) PREFLIGHT — la tarjeta que se relee antes de CADA pantalla
if [ -f "docs/sistema/PREFLIGHT-PANTALLA.md" ]; then
  echo ""
  echo "── PREFLIGHT DE PANTALLA (releer antes de construir CADA pantalla) ──"
  cat docs/sistema/PREFLIGHT-PANTALLA.md
  echo "── fin del preflight ──"
fi

# 4) Reglas de oro (resumen)
echo ""
echo "LAS 7 REGLAS DE ORO (completas en CLAUDE.md):"
echo "1. CONSULTA ANTES DE ACTUAR (tabla de ruteo) · 2. NUNCA 'LISTO' SIN CHECKLIST"
echo "3. ESTADO.md + FICHA-ARTE.md + FICHA-AVATAR.md son tu memoria · 4. UNA CAPA A LA VEZ, verificando"
echo "5. NO te saltes fases · 6. DEFINE ANTES DE CONSTRUIR: loop (24), auth (26), datos+RLS (25), IA (30)"
echo "7. PRODUCTO ENRIQUECIDO — render REAL a 375px; puntúa el subagente revisor-visual, NO tú."
echo ""
echo "Si el usuario dio una IMAGEN DE REFERENCIA visual: es un CONTRATO (16, protocolo obligatorio)."
echo "El copy de venta (landing/onboarding/paywall) se DERIVA de FICHA-AVATAR.md (57) — sin ficha, no hay copy."
echo "La landing sigue SIEMPRE la ESTRUCTURA CANÓNICA de 10 secciones del 19 — no se reordena ni se recorta."
echo "El cierre de toda pantalla lo puntúa el subagente 'revisor-visual' (.claude/agents/) con el"
echo "screenshot real — autoevaluarse la rúbrica está prohibido."

exit 0
