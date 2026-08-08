export type Answers = {
  edad?: "40-45" | "46-50" | "51-55" | "otra";
  momento?: "despertar" | "comer" | "tarde" | "dormir";
  /** El dolor físico dominante — la respuesta que más pesa en el Score y en el copy de reconocimiento. */
  dolorPrincipal?: "hinchazon_progresiva" | "pesadez_constante" | "ropa_apretada";
  /** Síntomas secundarios — selección múltiple. */
  sintomasSecundarios?: string[];
  yaIntento?: string;
  diasCompromiso?: number;
  prioridad?: "desinflamar" | "grasa" | "dormir" | "energia";
};

export type Priority = { title: string; detail: string; tag: string };

const DOLOR_LABELS: Record<NonNullable<Answers["dolorPrincipal"]>, string> = {
  hinchazon_progresiva: "la inflamación que aumenta a lo largo del día",
  pesadez_constante: "la pesadez y distensión abdominal constante",
  ropa_apretada: "la sensación de que la ropa ya no te cierra igual",
};

export function dolorPrincipalLabel(d?: Answers["dolorPrincipal"]): string {
  return d ? DOLOR_LABELS[d] : "lo que sientes en tu cuerpo ahora mismo";
}

const SINTOMA_LABELS: Record<string, string> = {
  antojos_tarde: "esos antojos de la tarde",
  insomnio_madrugada: "esos despertares de madrugada",
  niebla_mental: "esa niebla mental",
  rigidez_articular: "esa rigidez al despertar",
};

/** Convierte los síntomas secundarios elegidos en una frase natural para el copy de reconocimiento. */
export function sintomasSecundariosLabel(sintomas?: string[]): string {
  const labels = (sintomas ?? []).map((s) => SINTOMA_LABELS[s]).filter(Boolean);
  if (labels.length === 0) return "lo que tu cuerpo te está mostrando";
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
}

/** Score rule-based (no IA todavía — la generación con IA real llega en Sesión 6, ver ESTADO.md). */
export function computeScore(a: Answers): number {
  let score = 92;
  if (a.dolorPrincipal === "pesadez_constante") score -= 12;
  if (a.dolorPrincipal === "hinchazon_progresiva") score -= 8;
  if (a.dolorPrincipal === "ropa_apretada") score -= 6;

  const sintomas = a.sintomasSecundarios ?? [];
  if (sintomas.includes("antojos_tarde")) score -= 8;
  if (sintomas.includes("insomnio_madrugada")) score -= 10;
  if (sintomas.includes("niebla_mental")) score -= 6;
  if (sintomas.includes("rigidez_articular")) score -= 6;

  if (a.momento === "despertar") score -= 4;

  return Math.max(45, Math.min(94, Math.round(score)));
}

const POOL: Record<string, Priority> = {
  proteina: {
    title: "Sube proteína en el desayuno",
    detail: "Ayuda a estabilizar tu energía y reduce antojos de media tarde",
    tag: "Base",
  },
  pan: {
    title: "Limita el pan blanco en la cena",
    detail: "Uno de tus detonantes de inflamación nocturna",
    tag: "Detonante",
  },
  caminar: {
    title: "Camina 15 min después de comer",
    detail: "Mejora tu digestión y baja la hinchazón",
    tag: "Hábito",
  },
  magnesio: {
    title: "Prioriza magnesio antes de dormir",
    detail: "Ayuda a la calidad de tu sueño y baja el cortisol nocturno",
    tag: "Sueño",
  },
  snack: {
    title: "Ten un snack proteico a media tarde",
    detail: "Corta el pico de antojos antes de que aparezca",
    tag: "Antojos",
  },
  fibra: {
    title: "Suma fibra e hidratación en el almuerzo",
    detail: "Ayuda a tu digestión y a la pesadez después de comer",
    tag: "Digestión",
  },
  respiracion: {
    title: "2 minutos de respiración antes de comer",
    detail: "Baja el cortisol que agrava la inflamación abdominal",
    tag: "Cortisol",
  },
  claridad: {
    title: "10 min de luz solar al despertar",
    detail: "Ayuda a tu claridad mental y regula tu ritmo hormonal",
    tag: "Niebla mental",
  },
};

/** Selecciona 3 prioridades según las respuestas peor puntuadas — determinístico, no aleatorio. */
export function computePriorities(a: Answers): Priority[] {
  const picks: string[] = [];
  const sintomas = a.sintomasSecundarios ?? [];

  if (a.dolorPrincipal === "pesadez_constante") picks.push("fibra");
  if (a.dolorPrincipal === "hinchazon_progresiva") picks.push("respiracion");
  if (a.dolorPrincipal === "ropa_apretada") picks.push("caminar");

  if (sintomas.includes("antojos_tarde")) picks.push("snack");
  if (sintomas.includes("insomnio_madrugada")) picks.push("magnesio");
  if (sintomas.includes("niebla_mental")) picks.push("claridad");
  if (sintomas.includes("rigidez_articular")) picks.push("respiracion");

  if (!picks.includes("proteina")) picks.unshift("proteina");
  if (picks.length < 3) picks.push("pan");
  if (picks.length < 3) picks.push("caminar");

  const unique = Array.from(new Set(picks)).slice(0, 3);
  return unique.map((key) => POOL[key]);
}

export function scoreLabel(score: number): string {
  if (score >= 80) return "Buen punto de partida";
  if (score >= 65) return "Inflamación leve · buen margen de mejora";
  if (score >= 50) return "Inflamación moderada · buen margen de mejora";
  return "Inflamación alta · tu ruta se enfoca en bajarla primero";
}
