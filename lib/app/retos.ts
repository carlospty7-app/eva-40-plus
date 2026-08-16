import type { EstadoDia } from "@/lib/app/types";

export type FamiliaReto = "nutre" | "activa" | "regula" | "recupera";

export type FlagSalud = "diabetes_glucosa" | "condicion_renal_cardiaca" | "historial_trastorno_alimenticio";

export type RetoDef = {
  slug: string;
  nombre: string;
  familia: FamiliaReto;
  emoji: string;
  /** Texto genérico de "por qué" — EVA lo personaliza mencionando el indicador real detectado. */
  porQue: string;
  mision: string;
  /** Qué campos del check-in diario (ya existente) mide este reto para el resultado del día 7. */
  indicadoresClave: (keyof EstadoDia)[];
  duracionDias: number;
  /** Si tiene alguno de estos flags de salud en true, se le muestra una advertencia antes de empezar. */
  advertenciaSi?: FlagSalud[];
};

/** Biblioteca inicial de EVA — 3 retos (Fase 1). No son "dietas": microexperimentos de 7 días
 * para que la usuaria observe cómo responde SU cuerpo, no un protocolo genérico para todas. */
export const RETOS: RetoDef[] = [
  {
    slug: "desinflama-7",
    nombre: "DESINFLAMA 7",
    familia: "nutre",
    emoji: "🥗",
    porQue:
      "Notamos que tu inflamación y tu digestión han estado más pesadas de lo normal esta semana.",
    mision:
      "Durante 7 días, prioriza vegetales, frutas enteras, proteína (pescado, huevo, carnes magras o proteína vegetal), frutos secos y aceite de oliva o aguacate — y reduce ultraprocesados, harinas refinadas, azúcar añadida y alcohol. No es eliminar ningún grupo de alimentos para siempre: es simplificar 7 días para observar qué pasa.",
    indicadoresClave: ["inflamacion", "digestion", "antojos", "energia"],
    duracionDias: 7,
  },
  {
    slug: "reset-5",
    nombre: "RESET 5",
    familia: "regula",
    emoji: "🌬️",
    porQue: "Notamos que tu estrés ha estado más alto de lo normal esta semana.",
    mision:
      "5 minutos al día de respiración lenta: inhala 4 segundos, exhala lento 6 segundos. Elige un momento que puedas sostener los 7 días — al despertar, a mitad del día, o antes de dormir.",
    indicadoresClave: ["estres", "sueno", "energia"],
    duracionDias: 7,
  },
  {
    slug: "escucha-tu-cuerpo",
    nombre: "ESCUCHA TU CUERPO",
    familia: "recupera",
    emoji: "🔍",
    porQue: "Todavía no tenemos suficiente historial tuyo — este reto no cambia nada, solo te conoce.",
    mision:
      "No cambies nada esta semana. Solo sigue haciendo tu revisión diaria con honestidad — al día 7 te mostramos los patrones reales que encontramos en tus propios datos.",
    indicadoresClave: ["inflamacion", "energia", "sueno", "estres", "antojos", "digestion"],
    duracionDias: 7,
  },
];

export function obtenerReto(slug: string): RetoDef | undefined {
  return RETOS.find((r) => r.slug === slug);
}

export const FAMILIA_LABEL: Record<FamiliaReto, string> = {
  nutre: "Nutre",
  activa: "Activa",
  regula: "Regula",
  recupera: "Recupera",
};
