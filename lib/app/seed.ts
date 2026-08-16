import { DIA_LABELS, isoFecha, lunesDeEstaSemana, semanaActual } from "@/lib/app/dates";
import type { Checkin, DiaRuta, EstadoApp, EstadoDia, MenuDia, MovimientoDia, PuntoScore } from "@/lib/app/types";
import { calcularAdaptacionSemana, computeScoreDia } from "@/lib/app/engine";

/** Qué tema de `RUTA_TEMAS` (por su índice) mejor le habla a cada métrica cuando viene mal en el
 * promedio real de la semana — reutiliza contenido ya redactado, no inventa uno nuevo. */
const TEMA_POR_METRICA: Partial<Record<keyof EstadoDia, number>> = {
  antojos: 2, // "Corta el antojo de la tarde"
  sueno: 3, // "Prepara tu sueño"
  digestion: 1, // "Calma tu digestión"
  inflamacion: 0, // "Arranca desinflamando la semana"
  estres: 1, // comparte el enfoque de calma/respiración
};

/** Patrón semanal base (Lunes→Domingo) con correlación real intencional: los días de buen sueño
 * bajan la inflamación, los días de alto estrés suben los antojos — así los insights automáticos
 * de `engine.ts` tienen algo genuino que encontrar, no una afirmación vacía. */
const TEMPLATE_SEMANA: EstadoDia[] = [
  { sueno: 2, estres: 4, inflamacion: 4, antojos: 4, energia: 2, digestion: 2 }, // L
  { sueno: 3, estres: 3, inflamacion: 3, antojos: 3, energia: 3, digestion: 3 }, // M
  { sueno: 4, estres: 2, inflamacion: 2, antojos: 2, energia: 4, digestion: 4 }, // X
  { sueno: 4, estres: 2, inflamacion: 2, antojos: 2, energia: 4, digestion: 4 }, // J
  { sueno: 3, estres: 3, inflamacion: 3, antojos: 3, energia: 3, digestion: 3 }, // V
  { sueno: 2, estres: 4, inflamacion: 4, antojos: 5, energia: 2, digestion: 2 }, // S
  { sueno: 3, estres: 3, inflamacion: 3, antojos: 3, energia: 3, digestion: 3 }, // D
];

function clamp15(n: number): number {
  return Math.max(1, Math.min(5, n));
}

/** Semana más reciente ligeramente mejor que el template base — progreso real desde que empezó su ruta. */
function mejorar(e: EstadoDia): EstadoDia {
  return {
    sueno: clamp15(e.sueno + 1),
    estres: clamp15(e.estres - 1),
    inflamacion: clamp15(e.inflamacion - 1),
    antojos: clamp15(e.antojos - 1),
    energia: clamp15(e.energia + 1),
    digestion: clamp15(e.digestion + 1),
  };
}

/** Videos reales de Maru en Supabase Storage (bajados de su Drive con permiso, 2026-08-16) — a
 * diferencia de los links de YouTube de abajo, estos son archivos .mp4 propios, así que la UI los
 * reproduce dentro de la app en vez de abrir una pestaña nueva (ver `esArchivoDeVideo` en
 * `app/app/ruta/page.tsx`). */
export const BASE_VIDEOS_YOGA = "https://tblpjdgshwdxqyruqxmr.supabase.co/storage/v1/object/public/yoga-videos/";

/** Duración real verificada (no estimada) de cada clip — son videos cortos de Maru, no rutinas de
 * varios minutos, así que se muestra la duración exacta para no prometer de más. */
export const BIBLIOTECA_YOGA: { titulo: string; archivo: string; duracion: string }[] = [
  { titulo: "Saludo al sol", archivo: "saludo-al-sol.mp4", duracion: "0:50" },
  { titulo: "Saludo a la luna", archivo: "saludo-a-la-luna.mp4", duracion: "1:30" },
  { titulo: "Guerreros", archivo: "guerreros.mp4", duracion: "0:33" },
  { titulo: "Tablas", archivo: "tablas.mp4", duracion: "1:33" },
  { titulo: "Hombros y cuello", archivo: "hombros-y-cuello.mp4", duracion: "2:32" },
  { titulo: "Espalda baja", archivo: "espalda-baja.mp4", duracion: "2:00" },
];

const RUTA_TEMAS: Array<{
  mision: string;
  alimentosRecomendados: string[];
  alimentosLimitar: string[];
  habitoPrioritario: string;
  menu: MenuDia;
  movimiento: MovimientoDia;
}> = [
  {
    mision: "Arranca desinflamando la semana",
    alimentosRecomendados: ["Huevo o yogur griego en el desayuno", "Vegetales de hoja verde", "Palta", "Quinoa"],
    alimentosLimitar: ["Pan blanco en la cena", "Frituras"],
    habitoPrioritario: "Camina 15 min después de comer",
    menu: {
      desayuno: "Huevos revueltos con espinaca y palta",
      almuerzo: "Pollo a la plancha con quinoa y vegetales asados",
      cena: "Sopa de vegetales con proteína ligera (pollo o tofu)",
    },
    movimiento: {
      titulo: "Yoga funcional",
      duracionMin: 31,
      tipo: "yoga",
      descripcion:
        "Ejercicios funcionales para mejorar la movilidad y bajar la inflamación en general — ideal para arrancar la semana.",
      videoUrl: "https://www.youtube.com/watch?v=K0qhem-OYK0",
    },
  },
  {
    mision: "Calma tu digestión",
    alimentosRecomendados: ["Avena o chía con fruta", "Legumbres al almuerzo", "Calabaza", "Semillas"],
    alimentosLimitar: ["Frituras", "Comidas muy copiosas de noche"],
    habitoPrioritario: "2 min de respiración antes de comer",
    menu: {
      desayuno: "Avena con chía, canela y fruta",
      almuerzo: "Lentejas con vegetales de hoja verde y aceite de oliva",
      cena: "Crema de calabaza con semillas",
    },
    movimiento: {
      titulo: "Yoga: desbloqueo articular y auto masaje",
      duracionMin: 21,
      tipo: "movilidad",
      descripcion:
        "Para bajar niveles de estrés y aumentar la relajación — mueve suave las articulaciones y ayuda a activar el tránsito digestivo.",
      videoUrl: "https://www.youtube.com/watch?v=h_8uau6y4VE",
    },
  },
  {
    mision: "Corta el antojo de la tarde",
    alimentosRecomendados: ["Snack proteico a las 4pm (nueces, yogur)", "Proteína en cada comida", "Arroz integral"],
    alimentosLimitar: ["Azúcar refinada", "Snacks ultraprocesados"],
    habitoPrioritario: "Snack proteico a media tarde",
    menu: {
      desayuno: "Yogur griego con nueces y fruta",
      almuerzo: "Pescado o pollo con arroz integral y ensalada",
      cena: "Tortilla de vegetales con ensalada verde",
    },
    movimiento: {
      titulo: "Caminata post-antojo",
      duracionMin: 15,
      tipo: "caminata",
      descripcion:
        "15 minutos a paso ligero justo después de almorzar (no hace falta ropa deportiva ni salir de casa — sirve caminar en el patio o subir y bajar escaleras). Ayuda a regular el azúcar en sangre y baja el antojo de la tarde antes de que aparezca.",
    },
  },
  {
    mision: "Prepara tu sueño",
    alimentosRecomendados: ["Magnesio antes de dormir", "Cenas ligeras con vegetales", "Almendras"],
    alimentosLimitar: ["Cafeína después de las 3pm", "Pantallas 30 min antes de dormir"],
    habitoPrioritario: "Rutina de sueño + magnesio",
    menu: {
      desayuno: "Tostada integral con palta y huevo",
      almuerzo: "Pavo o pollo con vegetales salteados",
      cena: "Vegetales al vapor con proteína ligera y almendras",
    },
    movimiento: {
      titulo: "Yoga para dormir",
      duracionMin: 21,
      tipo: "yoga",
      descripcion:
        "Posturas suaves de liberación que bajan el sistema nervioso antes de dormir — ideal para la noche.",
      videoUrl: "https://www.youtube.com/watch?v=B06mBT4eWzc",
    },
  },
  {
    mision: "Aligera hacia el fin de semana",
    alimentosRecomendados: ["Vegetales de hoja verde", "Pescado o proteína magra", "Proteína en polvo (opcional)"],
    alimentosLimitar: ["Alcohol", "Ultraprocesados"],
    habitoPrioritario: "Camina después de la cena",
    menu: {
      desayuno: "Batido verde con proteína",
      almuerzo: "Pescado a la plancha con vegetales de hoja verde",
      cena: "Ensalada completa con proteína magra",
    },
    movimiento: {
      titulo: "Caminata de cierre de semana",
      duracionMin: 20,
      tipo: "caminata",
      descripcion:
        "20 minutos al aire libre a paso constante, sin pausas ni revisar el celular — solo caminar y respirar. Es la manera más simple de soltar la tensión que se acumuló en la semana antes del fin de semana.",
    },
  },
  {
    mision: "Sostén tu ritmo el sábado",
    alimentosRecomendados: ["Desayuno con proteína aunque sea fin de semana", "Fruta entera"],
    alimentosLimitar: ["Comer muy tarde en la noche", "Exceso de sal"],
    habitoPrioritario: "10 min de luz solar al despertar",
    menu: {
      desayuno: "Huevos con fruta entera",
      almuerzo: "Tu opción favorita, con proteína y vegetales de base",
      cena: "Cena ligera, evitando comer muy tarde",
    },
    movimiento: {
      titulo: "Yoga desde tu cama",
      duracionMin: 1,
      tipo: "yoga",
      descripcion:
        "Ejercicios rápidos de estiramiento en cama para reducir el estrés y el cortisol — ideal cuando tienes poco tiempo.",
      videoUrl: "https://www.youtube.com/watch?v=4TnCRxg-404",
    },
  },
  {
    mision: "Reinicia con calma el domingo",
    alimentosRecomendados: ["Comidas simples e hidratación", "Vegetales de temporada", "Yogur", "Semillas"],
    alimentosLimitar: ["Exceso de sal", "Dejar todo para improvisar el lunes"],
    habitoPrioritario: "Prepara 1-2 comidas para la semana",
    menu: {
      desayuno: "Fruta con yogur y semillas",
      almuerzo: "Comida simple con vegetales de temporada",
      cena: "Sopa ligera o vegetales al vapor",
    },
    movimiento: {
      titulo: "Movilidad de caderas",
      duracionMin: 1,
      tipo: "movilidad",
      descripcion:
        "Clip corto de Maru (26 seg) para soltar las caderas antes de cerrar la semana — repítelo 2-3 veces seguidas si quieres más tiempo. Sin salto ni impacto, no hace falta esterilla ni ropa especial.",
      videoUrl: `${BASE_VIDEOS_YOGA}movilidad-de-caderas.mp4`,
    },
  },
];

/** Tema de contenido (misión/menú/movimiento/etc.) para un día de la semana por índice L=0..D=6 —
 * usado también por `store.ts` para reparar registros guardados de un esquema anterior sin borrar
 * el progreso real de la usuaria (ver `repararRutaSemana`). */
export function temaPorIndiceDia(indice: number) {
  return RUTA_TEMAS[indice];
}

/** Genera los 7 días de la ruta de la semana actual — el contenido por día-de-semana es la base,
 * pero el día de HOY se ajusta con lo que de verdad viene pasando en los check-ins recientes de la
 * usuaria (`calcularAdaptacionSemana`): si sus antojos o su sueño vienen mal en promedio, hoy
 * prioriza eso en vez de repetir siempre el mismo tema fijo. Marca `completado` según checkins
 * REALES — para usar con datos de Supabase en vez del historial de demo. */
export function generarRutaSemanaReal(checkinsReales: Checkin[]): DiaRuta[] {
  const fechasConCheckin = new Set(checkinsReales.map((c) => c.fecha));
  const hoyIso = isoFecha(new Date());
  const adaptacion = calcularAdaptacionSemana(checkinsReales);
  const temaAdaptado = adaptacion ? TEMA_POR_METRICA[adaptacion.metrica] : undefined;

  return semanaActual(new Date()).map((fecha, i) => {
    const fechaIso = isoFecha(fecha);
    const base: DiaRuta = {
      dia: DIA_LABELS[i],
      fecha: fechaIso,
      ...RUTA_TEMAS[i],
      completado: fechasConCheckin.has(fechaIso),
    };

    if (fechaIso === hoyIso && adaptacion && temaAdaptado !== undefined) {
      const tema = RUTA_TEMAS[temaAdaptado];
      return {
        ...base,
        mision: adaptacion.mensaje,
        alimentosRecomendados: tema.alimentosRecomendados,
        alimentosLimitar: tema.alimentosLimitar,
        habitoPrioritario: tema.habitoPrioritario,
      };
    }

    return base;
  });
}

export function generarSeed(): EstadoApp {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const lunesEstaSemana = lunesDeEstaSemana(hoy);
  const lunesSemanaAnterior = new Date(lunesEstaSemana);
  lunesSemanaAnterior.setDate(lunesEstaSemana.getDate() - 7);
  const fechasSemanaAnterior = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunesSemanaAnterior);
    d.setDate(lunesSemanaAnterior.getDate() + i);
    return d;
  });
  const fechasSemanaActual = semanaActual(hoy);

  const checkins: Checkin[] = [];

  fechasSemanaAnterior.forEach((fecha, i) => {
    checkins.push({ fecha: isoFecha(fecha), ...TEMPLATE_SEMANA[i] });
  });

  fechasSemanaActual.forEach((fecha, i) => {
    if (fecha.getTime() < hoy.getTime()) {
      checkins.push({ fecha: isoFecha(fecha), ...mejorar(TEMPLATE_SEMANA[i]) });
    }
  });

  const scoreHistorial: PuntoScore[] = checkins.map((c) => ({
    fecha: c.fecha,
    score: computeScoreDia(c),
  }));

  const rutaSemana: DiaRuta[] = fechasSemanaActual.map((fecha, i) => ({
    dia: DIA_LABELS[i],
    fecha: isoFecha(fecha),
    ...RUTA_TEMAS[i],
    completado: fecha.getTime() < hoy.getTime(),
  }));

  const fechaCobro = new Date(hoy);
  fechaCobro.setDate(hoy.getDate() + 4);

  return {
    perfil: {
      nombre: "tu cuenta",
      metaLabel: "sentirte mejor",
      dolorLabel: "la sensación de que la ropa ya no te cierra igual",
      plan: "anual",
      trialActivo: true,
      fechaCobro: isoFecha(fechaCobro),
    },
    rutaSemana,
    checkins,
    scoreHistorial,
    rachaDias: checkins.length,
  };
}
