import type { Checkin, EstadoDia } from "@/lib/app/types";
import { RETOS, obtenerReto, type RetoDef } from "@/lib/app/retos";

const PEOR_ES_ALTO: Record<keyof EstadoDia, boolean> = {
  inflamacion: true,
  estres: true,
  antojos: true,
  energia: false,
  sueno: false,
  digestion: false,
};

/** Qué reto (de la biblioteca disponible) responde mejor a cada indicador — solo mapea a los
 * slugs que existen hoy en `RETOS`; cuando se sumen más retos, este mapa crece con ellos. */
const RETO_POR_INDICADOR: Partial<Record<keyof EstadoDia, string>> = {
  inflamacion: "desinflama-7",
  digestion: "desinflama-7",
  antojos: "desinflama-7",
  estres: "reset-5",
  sueno: "reset-5",
};

const UMBRAL_ALTO = 3.5;
const UMBRAL_BAJO = 2.5;

/** Recomienda un reto según el indicador que viene peor en el promedio de los últimos 7 días
 * REALES de check-in — nunca el mismo reto para todas. Sin historial suficiente (usuaria nueva),
 * recomienda ESCUCHA TU CUERPO primero: no cambia nada, solo la conoce. */
export function recomendarReto(checkinsRecientes: Checkin[]): RetoDef {
  const ultimos = checkinsRecientes.slice(-7);
  if (ultimos.length < 3) return obtenerReto("escucha-tu-cuerpo")!;

  const promedio = (campo: keyof EstadoDia) => ultimos.reduce((s, c) => s + c[campo], 0) / ultimos.length;

  let peorCampo: keyof EstadoDia | null = null;
  let peorDistancia = 0;
  (Object.keys(RETO_POR_INDICADOR) as (keyof EstadoDia)[]).forEach((campo) => {
    const prom = promedio(campo);
    const distancia = PEOR_ES_ALTO[campo] ? prom - UMBRAL_ALTO : UMBRAL_BAJO - prom;
    if (distancia > 0 && distancia > peorDistancia) {
      peorDistancia = distancia;
      peorCampo = campo;
    }
  });

  if (!peorCampo) return obtenerReto("escucha-tu-cuerpo")!;
  return obtenerReto(RETO_POR_INDICADOR[peorCampo]!) ?? obtenerReto("escucha-tu-cuerpo")!;
}

export type ResultadoIndicador = {
  indicador: keyof EstadoDia;
  promedioInicio: number;
  promedioFinal: number;
  cambioPct: number; // positivo siempre significa "mejoró", sin importar si el campo sube o baja
};

/** Compara el PROMEDIO de los primeros días vs. los últimos días del reto (no día 1 contra día 7
 * exacto) — un solo mal día al inicio o al final no debería voltear el veredicto completo. Usa
 * como máximo 3 días de cada lado; si el reto tiene menos de 2 check-ins reales, no compara nada
 * (no inventa una tendencia con 1 solo dato). */
export function compararResultadosReto(
  checkinsDelReto: Checkin[],
  indicadores: (keyof EstadoDia)[],
): ResultadoIndicador[] {
  const ordenados = [...checkinsDelReto].sort((a, b) => a.fecha.localeCompare(b.fecha));
  if (ordenados.length < 2) return [];

  const mitad = Math.max(1, Math.floor(ordenados.length / 2));
  const ventana = Math.min(3, mitad);
  const inicio = ordenados.slice(0, ventana);
  const final = ordenados.slice(ordenados.length - ventana);

  return indicadores.map((campo) => {
    const promInicio = inicio.reduce((s, c) => s + c[campo], 0) / inicio.length;
    const promFinal = final.reduce((s, c) => s + c[campo], 0) / final.length;
    const peorEsAlto = PEOR_ES_ALTO[campo];
    const cambioCrudo = peorEsAlto ? promInicio - promFinal : promFinal - promInicio;
    const base = Math.max(promInicio, 0.5);
    return {
      indicador: campo,
      promedioInicio: promInicio,
      promedioFinal: promFinal,
      cambioPct: (cambioCrudo / base) * 100,
    };
  });
}

export type DecisionReto = "continuar_fuerte" | "repetir_modificar" | "cambiar_reto" | "detener";

export const DECISION_TEXTO: Record<DecisionReto, string> = {
  continuar_fuerte: "Tu cuerpo respondió. Vamos una semana más.",
  repetir_modificar: "Hubo mejora — repite esta semana para consolidarla.",
  cambiar_reto: "Este reto no marcó mucha diferencia para ti — probemos otro.",
  detener: "Algo no vino bien esta semana — pausemos y cambiemos de estrategia.",
};

/** Umbral de "empeoró claramente" deliberadamente más exigente que el de "mejoró mucho" — no
 * queremos alarmar a alguien por ruido normal de un mal día. */
export function decidirSiguientePaso(resultados: ResultadoIndicador[]): DecisionReto {
  if (resultados.length === 0) return "cambiar_reto";
  const promedioGeneral = resultados.reduce((s, r) => s + r.cambioPct, 0) / resultados.length;
  if (promedioGeneral <= -15) return "detener";
  if (promedioGeneral >= 30) return "continuar_fuerte";
  if (promedioGeneral >= 10) return "repetir_modificar";
  return "cambiar_reto";
}

export { RETOS, obtenerReto };
