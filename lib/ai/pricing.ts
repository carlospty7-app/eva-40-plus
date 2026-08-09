/** Precios públicos de Anthropic en USD por millón de tokens — se usan para ESTIMAR el costo real
 * de cada llamada (no es la factura exacta: no incluye descuentos de caché en detalle fino, ni
 * cambios de precio recientes que no se hayan actualizado aquí). Actualiza esta tabla si cambia el
 * modelo en `AI_MODEL` o si Anthropic ajusta precios. */
const PRECIOS_POR_MILLON: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
  "claude-sonnet-4-5": { input: 3, output: 15 },
  "claude-opus-4-5": { input: 15, output: 75 },
};

const PRECIO_DEFECTO = { input: 3, output: 15 }; // fallback conservador (nivel Sonnet) si el modelo no está en la tabla

export function estimarCostoUsd(model: string, inputTokens: number, outputTokens: number): number {
  const precio = PRECIOS_POR_MILLON[model] ?? PRECIO_DEFECTO;
  return (inputTokens * precio.input) / 1_000_000 + (outputTokens * precio.output) / 1_000_000;
}
