#!/usr/bin/env bash
# PostToolUse hook (Edit|Write) — typecheck automático tras editar .ts/.tsx.
# Robusto: si no hay python3, tsconfig o node_modules, sale limpio sin molestar.

INPUT=$(cat)

FILE_PATH=$(printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except Exception:
    pass
" 2>/dev/null)

# Sin file_path detectable → no bloquear nada.
[ -z "$FILE_PATH" ] && exit 0

# Solo TypeScript.
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# Solo si el proyecto realmente es TS con dependencias instaladas.
[ -f "tsconfig.json" ] || exit 0
[ -d "node_modules" ] || exit 0

TSC_OUT=$(npx tsc --noEmit --pretty false 2>&1 | head -40)
if [ -n "$TSC_OUT" ] && printf '%s' "$TSC_OUT" | grep -q "error TS"; then
  {
    echo "⚠️ tsc reporta errores tras editar $FILE_PATH (Regla de Oro 4: una capa a la vez, verificando):"
    echo "$TSC_OUT"
    echo "Corrige la CAUSA RAÍZ antes de seguir (no @ts-ignore, no any)."
  } >&2
  exit 2
fi

exit 0
