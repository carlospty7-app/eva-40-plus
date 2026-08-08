#!/usr/bin/env bash
# Stop hook — guardián de cierre: no declarar terminado con tsc roto ni con ESTADO.md desactualizado.
# Robusto: tolera proyectos sin package.json/tsconfig/git.

INPUT=$(cat)

# Anti-loop: si este hook ya bloqueó y el agente está respondiendo a eso, dejarlo terminar.
STOP_ACTIVE=$(printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print('true' if data.get('stop_hook_active') else 'false')
except Exception:
    print('false')
" 2>/dev/null)
[ "$STOP_ACTIVE" = "true" ] && exit 0

# 1) TypeScript debe estar limpio antes de cerrar.
if [ -f "tsconfig.json" ] && [ -d "node_modules" ]; then
  if ! npx tsc --noEmit >/dev/null 2>&1; then
    echo "⚠️ No declares esto terminado: tsc reporta errores. Corrígelos o anótalos como pendiente en ESTADO.md" >&2
    exit 2
  fi
fi

# 2) ESTADO.md desactualizado (>2h) con trabajo sin commitear en src/ o app/.
if [ -f "ESTADO.md" ] && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  NOW=$(date +%s)
  if [ "$(uname)" = "Darwin" ]; then
    MTIME=$(stat -f %m ESTADO.md 2>/dev/null || echo "$NOW")
  else
    MTIME=$(stat -c %Y ESTADO.md 2>/dev/null || echo "$NOW")
  fi
  AGE=$((NOW - MTIME))
  if [ "$AGE" -gt 7200 ]; then
    DIRTY=$(git status --porcelain -- src app 2>/dev/null)
    if [ -n "$DIRTY" ]; then
      echo "⚠️ Hay cambios sin commitear en src/ o app/ y ESTADO.md lleva más de 2 horas sin actualizarse. ESTADO.md es tu memoria (Regla de Oro 3): actualízalo (fase, decisiones, pendientes) antes de cerrar." >&2
      exit 2
    fi
  fi
fi

exit 0
