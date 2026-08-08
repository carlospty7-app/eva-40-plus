import { DIA_LABELS, isoFecha, lunesDeEstaSemana, semanaActual } from "@/lib/app/dates";
import type { Checkin, DiaRuta, EstadoApp, EstadoDia, MenuDia, MovimientoDia, PuntoScore } from "@/lib/app/types";
import { computeScoreDia } from "@/lib/app/engine";

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
        "Una caminata corta a paso ligero después del almuerzo ayuda a regular el azúcar en sangre y baja el antojo de la tarde.",
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
      descripcion: "Camina al aire libre a paso constante — ayuda a soltar la tensión acumulada de la semana.",
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
      titulo: "Movilidad de reinicio",
      duracionMin: 10,
      tipo: "movilidad",
      descripcion: "Estiramientos suaves de cuerpo completo para cerrar la semana y prepararte para la que viene.",
    },
  },
];

/** Tema de contenido (misión/menú/movimiento/etc.) para un día de la semana por índice L=0..D=6 —
 * usado también por `store.ts` para reparar registros guardados de un esquema anterior sin borrar
 * el progreso real de la usuaria (ver `repararRutaSemana`). */
export function temaPorIndiceDia(indice: number) {
  return RUTA_TEMAS[indice];
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
