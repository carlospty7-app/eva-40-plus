#!/usr/bin/env bash
# PostToolUse hook (Edit|Write) — linter mecánico de diseño sobre EL ARCHIVO editado.
# Detecta las huellas del diseño genérico en el momento en que se escriben
# (complementa scripts/audit-diseno.sh, que audita el proyecto entero).
# Robusto: sin python3 o sin file_path → exit 0 silencioso.

INPUT=$(cat)

FILE_PATH=$(printf '%s' "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_input', {}).get('file_path', ''))
except Exception:
    pass
" 2>/dev/null)

[ -z "$FILE_PATH" ] && exit 0
[ -f "$FILE_PATH" ] || exit 0

# Solo archivos de UI.
case "$FILE_PATH" in
  *.tsx|*.jsx|*.css) ;;
  *) exit 0 ;;
esac

# Archivos donde los hex y fuentes SÍ son legítimos (tokens/config/tema).
BASENAME=$(basename "$FILE_PATH")
case "$BASENAME" in
  globals.css|tailwind.config.*|theme*|tokens*|*design*|fonts*) exit 0 ;;
esac

FINDINGS=""

# 1. Hex hardcodeado fuera de tokens (regla 17 de UX — todo color es token).
HEX=$(grep -nE '#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b' "$FILE_PATH" 2>/dev/null | grep -v 'currentColor' | head -5)
[ -n "$HEX" ] && FINDINGS="$FINDINGS
❌ Hex directo fuera de tokens (usa var(--...) o clases de tokens — archivo 10):
$HEX"

# 2. transition: all (prohibido — DESIGN-CORE §2).
TALL=$(grep -nE 'transition:\s*all|transition-all' "$FILE_PATH" 2>/dev/null | head -3)
[ -n "$TALL" ] && FINDINGS="$FINDINGS
❌ 'transition: all' / transition-all (anima propiedades explícitas: transform/opacity/color):
$TALL"

# 3. Fuentes prohibidas como marca (huella del diseño genérico).
FONTS=$(grep -nE "font-family[^;]*(Inter|Roboto|system-ui)|['\"](Inter|Roboto)['\"]" "$FILE_PATH" 2>/dev/null | head -3)
[ -n "$FONTS" ] && FINDINGS="$FINDINGS
❌ Inter/Roboto/system-ui como fuente (usa las fuentes de FICHA-ARTE.md — 16/29):
$FONTS"

# 4. min-h-full en shells (produce el vacío muerto bajo la nav — Regla de Oro 7).
MHF=$(grep -nE 'min-h-full' "$FILE_PATH" 2>/dev/null | head -3)
[ -n "$MHF" ] && FINDINGS="$FINDINGS
❌ min-h-full (el shell de pantalla usa min-h-dvh — archivo 32):
$MHF"

# 5. Valores arbitrarios fuera de la escala 4·8·12·16·24·32·48·64.
ARB=$(grep -nE '\b[a-z]+-\[[0-9]+px\]' "$FILE_PATH" 2>/dev/null \
      | grep -vE '\[(4|8|12|16|24|32|48|64)px\]' | head -5)
[ -n "$ARB" ] && FINDINGS="$FINDINGS
⚠️ Valores arbitrarios fuera de la escala 4·8·12·16·24·32·48·64 (archivo 14):
$ARB"

if [ -n "$FINDINGS" ]; then
  {
    echo "🎨 LINTER DE DISEÑO — huellas de diseño genérico en $BASENAME:"
    echo "$FINDINGS"
    echo ""
    echo "Corrige AHORA (causa raíz, no supresión). Los valores válidos viven en FICHA-ARTE.md y globals.css."
  } >&2
  exit 2
fi

exit 0
