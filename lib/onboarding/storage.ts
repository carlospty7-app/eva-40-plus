import type { Priority } from "@/lib/onboarding/engine";

const KEY = "eva40_diagnostico";

export type DiagnosticoGuardado = {
  score: number;
  scoreLabel: string;
  priorities: Priority[];
  metaLabel: string;
  dolorLabel?: string;
};

/** Respaldo en memoria: la navegación de /onboarding a /paywall es client-side (App Router),
 * así que esto sobrevive aunque sessionStorage falle (modo privado, cuotas, etc). */
let memoriaRespaldo: DiagnosticoGuardado | null = null;

export function guardarDiagnostico(data: DiagnosticoGuardado) {
  memoriaRespaldo = data;
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    console.warn("EVA 40+: no se pudo guardar el diagnóstico en sessionStorage — se usa el respaldo en memoria.");
  }
}

export function leerDiagnostico(): DiagnosticoGuardado | null {
  if (typeof window === "undefined") return memoriaRespaldo;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as DiagnosticoGuardado;
  } catch {
    // sigue al respaldo en memoria
  }
  return memoriaRespaldo;
}
