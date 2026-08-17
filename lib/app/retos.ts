import type { EstadoDia } from "@/lib/app/types";

export type FamiliaReto = "nutre" | "activa" | "regula" | "recupera";

export type FlagSalud = "diabetes_glucosa" | "condicion_renal_cardiaca" | "historial_trastorno_alimenticio";

export type MenuRetoDia = {
  desayuno: string;
  almuerzo: string;
  cena: string;
  snack: string;
  fotos?: { desayuno: string; almuerzo: string; cena: string; snack: string };
};

const BASE_FOTOS_RETO = "https://tblpjdgshwdxqyruqxmr.supabase.co/storage/v1/object/public/reto-recetas/";

/** Fotos reales de los platos (subidas por Maru, 2026-08-16) — un set de 4 por día. */
function fotosDia(retoSlug: string, dia: number) {
  return {
    desayuno: `${BASE_FOTOS_RETO}${retoSlug}/desayuno-dia-${dia}.jpg`,
    almuerzo: `${BASE_FOTOS_RETO}${retoSlug}/almuerzo-dia-${dia}.jpg`,
    cena: `${BASE_FOTOS_RETO}${retoSlug}/cena-dia-${dia}.jpg`,
    snack: `${BASE_FOTOS_RETO}${retoSlug}/snack-dia-${dia}.jpg`,
  };
}

export type MovimientoReto = {
  mañana: string[];
  yoga: string[];
  duranteElDia: string[];
  noche: string[];
};

export type GrupoCompra = { categoria: string; items: string[] };

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
  /** Contenido real de Maru (opcional — no todos los retos lo tienen todavía). */
  menuDias?: MenuRetoDia[];
  listaCompras?: GrupoCompra[];
  movimiento?: MovimientoReto;
  bebidas?: string;
  grasasPrincipales?: string;
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
    bebidas: "Agua, agua con limón, infusiones y café/té sin azúcar.",
    grasasPrincipales: "Aguacate, aceite de oliva extra virgen, aceitunas, coco, nueces y semillas.",
    menuDias: [
      {
        desayuno: "2 huevos revueltos con espinaca + aguacate + frutos rojos",
        almuerzo: "Pollo a la plancha + ensalada grande de hojas verdes, pepino, tomate y aguacate + camote asado",
        cena: "Salmón al horno + brócoli + zucchini salteado",
        snack: "Manzana + 1 cda de mantequilla de almendras",
        fotos: fotosDia("desinflama-7", 1),
      },
      {
        desayuno: "Omelette de 2-3 huevos con champiñones, espinaca y aguacate",
        almuerzo: "Carne magra salteada + yuca hervida + ensalada de repollo y zanahoria",
        cena: "Pechuga de pollo con hierbas + puré de coliflor + espárragos",
        snack: "Frutos rojos + nueces",
        fotos: fotosDia("desinflama-7", 2),
      },
      {
        desayuno: "Pudín de chía con leche de coco sin azúcar + frutos rojos + semillas de calabaza",
        almuerzo: "Pescado blanco + plátano maduro al horno + ensalada verde con aceite de oliva",
        cena: "Carne molida magra con zucchini, pimentón y champiñones + aguacate",
        snack: "Pera + almendras",
        fotos: fotosDia("desinflama-7", 3),
      },
      {
        desayuno: "Huevos pochados/revueltos + aguacate + tomate + papaya",
        almuerzo: "Pollo al curry con leche de coco + brócoli + camote",
        cena: "Salmón + ensalada de rúcula, pepino y aguacate + vegetales asados",
        snack: "Coco natural + nueces",
        fotos: fotosDia("desinflama-7", 4),
      },
      {
        desayuno: "Hash de camote con huevo, espinaca y aguacate",
        almuerzo: "Carne magra a la plancha + yuca + ensalada de hojas verdes",
        cena: "Pollo al horno + coliflor + zucchini + ensalada",
        snack: "Frutos rojos + semillas",
        fotos: fotosDia("desinflama-7", 5),
      },
      {
        desayuno: "Omelette con vegetales + aguacate + papaya",
        almuerzo: "Bowl de salmón: salmón + camote + hojas verdes + pepino + aguacate",
        cena: "Hamburguesa casera de carne sin pan + vegetales al horno + ensalada",
        snack: "Manzana + mantequilla de almendras",
        fotos: fotosDia("desinflama-7", 6),
      },
      {
        desayuno: "Huevos con aguacate + frutos rojos + semillas de calabaza",
        almuerzo: "Pollo asado con hierbas + plátano al horno + ensalada grande",
        cena: "Sopa de pollo con vegetales, zucchini, zanahoria y apio + aguacate",
        snack: "Kiwi o frutos rojos + nueces",
        fotos: fotosDia("desinflama-7", 7),
      },
    ],
    listaCompras: [
      { categoria: "Proteínas", items: ["Huevos: 18-24 unidades", "Pechuga/muslos de pollo: 1.5-2 kg", "Salmón: 700-900 g", "Pescado blanco: 500-700 g", "Carne magra: 700-900 g"] },
      { categoria: "Vegetales", items: ["Espinaca", "Rúcula/mezcla de hojas verdes", "Brócoli", "Coliflor", "Zucchini", "Espárragos", "Pepino", "Tomate", "Pimentón", "Champiñones", "Repollo", "Zanahoria", "Apio"] },
      { categoria: "Tubérculos y frutas", items: ["Camote", "Yuca", "Plátano", "Aguacates", "Frutos rojos", "Papaya", "Manzanas", "Peras", "Kiwi", "Limones"] },
      { categoria: "Grasas y semillas", items: ["Aceite de oliva extra virgen", "Leche de coco sin azúcar", "Semillas de chía", "Semillas de calabaza", "Almendras", "Nueces", "Mantequilla de almendras 100%"] },
      { categoria: "Hierbas y condimentos", items: ["Cúrcuma", "Jengibre", "Canela", "Romero", "Orégano", "Pimienta", "Ajo"] },
    ],
    movimiento: {
      mañana: [
        "Marcha rápida en el sitio — 30 segundos",
        "Sentadillas suaves — 10 repeticiones",
        "Elevaciones de talones — 15 repeticiones",
        "Elevación alternada de rodillas — 10 por lado",
        "Balanceo de brazos — 30 segundos",
        "Repetir 2-3 rondas (5-7 min en total)",
      ],
      yoga: [
        "Gato-vaca × 6",
        "Postura del niño × 5 respiraciones",
        "Perro boca abajo suave × 5 respiraciones",
        "Estocada baja × 5 respiraciones por lado",
        "Torsión suave sentada × 5 respiraciones por lado",
        "Mariposa × 8 respiraciones",
        "Piernas arriba de la pared × 2-3 min",
        "Respiración nasal lenta × 2 min",
      ],
      duranteElDia: [
        "5-10 minutos de caminata después de 1-2 comidas",
        "Levántate y muévete 2-5 minutos cada hora si pasas mucho tiempo sentada",
      ],
      noche: ["5 minutos de respiración diafragmática: inhala por la nariz 4 segundos y exhala lento 6 segundos"],
    },
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
