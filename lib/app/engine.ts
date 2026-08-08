import type { Checkin, DiaRuta, EstadoDia } from "@/lib/app/types";

/** Junta los alimentos recomendados de los 7 días de la ruta en una sola lista, sin repetidos. */
export function listaDeComprasSemana(rutaSemana: DiaRuta[]): string[] {
  const vistos = new Set<string>();
  const lista: string[] = [];
  rutaSemana.forEach((dia) => {
    dia.alimentosRecomendados.forEach((item) => {
      const clave = item.toLowerCase();
      if (!vistos.has(clave)) {
        vistos.add(clave);
        lista.push(item);
      }
    });
  });
  return lista;
}

/** Composición interna de demo (no es una fórmula clínica): estima un Score 0-100 a partir del
 * check-in del día, en la misma escala y buckets que `lib/onboarding/engine.ts`. */
export function computeScoreDia(e: EstadoDia): number {
  let s = 60;
  s += (e.sueno - 3) * 5;
  s += (e.energia - 3) * 4;
  s += (e.digestion - 3) * 3;
  s -= (e.inflamacion - 3) * 6;
  s -= (e.estres - 3) * 4;
  s -= (e.antojos - 3) * 3;
  return Math.max(35, Math.min(95, Math.round(s)));
}

const CAMPO_LABEL: Record<keyof EstadoDia, string> = {
  inflamacion: "inflamación",
  energia: "energía",
  sueno: "sueño",
  estres: "estrés",
  antojos: "antojos",
  digestion: "digestión",
};

/** true si un valor ALTO en este campo es un problema (inflamación/estrés/antojos), false si un
 * valor alto es bueno (energía/sueño/digestión). */
const PEOR_ES_ALTO: Record<keyof EstadoDia, boolean> = {
  inflamacion: true,
  estres: true,
  antojos: true,
  energia: false,
  sueno: false,
  digestion: false,
};

export type RecomendacionCheckin = {
  campoClave: keyof EstadoDia;
  accionPrincipal: string;
  recomendacionInmediata: string;
};

const ACCIONES: Record<keyof EstadoDia, RecomendacionCheckin> = {
  inflamacion: {
    campoClave: "inflamacion",
    accionPrincipal: "2 min de respiración antes de tu próxima comida",
    recomendacionInmediata:
      "La inflamación alta casi siempre baja con respiración lenta antes de comer — te calma el cortisol antes de que se sume a lo que ya sientes.",
  },
  estres: {
    campoClave: "estres",
    accionPrincipal: "Camina 10 min al aire libre hoy",
    recomendacionInmediata:
      "El estrés alto sube tu cortisol y eso agrava la hinchazón — una caminata corta corta ese ciclo mejor que quedarte quieta.",
  },
  antojos: {
    campoClave: "antojos",
    accionPrincipal: "Snack proteico a media tarde",
    recomendacionInmediata:
      "Los antojos fuertes casi siempre son una señal de que te faltó proteína — un snack con proteína corta el pico antes de que llegue.",
  },
  sueno: {
    campoClave: "sueno",
    accionPrincipal: "Magnesio + rutina de sueño esta noche",
    recomendacionInmediata:
      "Dormir mal sube tu cortisol al día siguiente — prioriza tu rutina de sueño hoy para cortar la racha.",
  },
  energia: {
    campoClave: "energia",
    accionPrincipal: "10 min de luz solar al despertar mañana",
    recomendacionInmediata:
      "La energía baja suele venir de un ritmo hormonal desregulado — la luz solar temprano ayuda a reordenarlo.",
  },
  digestion: {
    campoClave: "digestion",
    accionPrincipal: "Fibra + hidratación en tu próxima comida",
    recomendacionInmediata:
      "La digestión pesada mejora rápido con fibra e hidratación — es tu prioridad para la próxima comida de hoy.",
  },
};

/** Encuentra el campo peor puntuado del check-in y devuelve la acción/recomendación asociada —
 * determinístico, igual que `computePriorities` del onboarding. */
export function recomendacionParaCheckin(estado: EstadoDia): RecomendacionCheckin {
  let peorCampo: keyof EstadoDia = "inflamacion";
  let peorSeveridad = -1;
  (Object.keys(estado) as (keyof EstadoDia)[]).forEach((campo) => {
    const valor = estado[campo];
    const severidad = PEOR_ES_ALTO[campo] ? valor : 6 - valor;
    if (severidad > peorSeveridad) {
      peorSeveridad = severidad;
      peorCampo = campo;
    }
  });
  return ACCIONES[peorCampo];
}

export function labelCampo(campo: keyof EstadoDia): string {
  return CAMPO_LABEL[campo];
}

/** Insight automático: solo lo emite si hay suficientes días en ambos grupos para comparar —
 * si no hay datos suficientes, no inventa una correlación. */
export function insightsAutomaticos(checkins: Checkin[]): string[] {
  const insights: string[] = [];
  if (checkins.length < 4) return insights;

  const promedio = (arr: Checkin[], campo: keyof EstadoDia) =>
    arr.reduce((acc, c) => acc + c[campo], 0) / arr.length;

  const buenSueno = checkins.filter((c) => c.sueno >= 4);
  const malSueno = checkins.filter((c) => c.sueno <= 2);
  if (buenSueno.length >= 2 && malSueno.length >= 2) {
    const diff = promedio(malSueno, "inflamacion") - promedio(buenSueno, "inflamacion");
    if (diff >= 0.8) {
      insights.push("Tu inflamación baja notablemente los días que duermes mejor.");
    }
  }

  const altoEstres = checkins.filter((c) => c.estres >= 4);
  const bajoEstres = checkins.filter((c) => c.estres <= 2);
  if (altoEstres.length >= 2 && bajoEstres.length >= 2) {
    const diff = promedio(altoEstres, "antojos") - promedio(bajoEstres, "antojos");
    if (diff >= 0.8) {
      insights.push("Tus antojos suben cuando reportas más estrés en el día.");
    }
  }

  if (insights.length === 0) {
    insights.push("Sigue registrando tu check-in diario — en unos días te mostramos tus patrones.");
  }

  return insights;
}

export type ProtocoloEva = {
  id: string;
  pregunta: string;
  pasos: string[];
};

export const PROTOCOLOS_EVA: ProtocoloEva[] = [
  {
    id: "inflamada",
    pregunta: "Estoy inflamada, ¿qué hago?",
    pasos: [
      "Respira lento 2 minutos: 4 segundos inhalando, 6 exhalando — baja el cortisol que agrava la hinchazón.",
      "Toma agua tibia con limón si la tienes a mano.",
      "Evita el pan blanco y los fritos en tu próxima comida de hoy.",
      "Camina 10-15 min después de comer, aunque sea corto.",
    ],
  },
  {
    id: "dormi-mal",
    pregunta: "Dormí mal, ajusta mi día",
    pasos: [
      "Hoy prioriza proteína en el desayuno para estabilizar tu energía sin cafeína extra.",
      "Si puedes, toma 10 min de luz solar al despertar — ayuda a reordenar tu ritmo.",
      "Evita decisiones grandes de comida improvisadas: ten un snack proteico a mano para la tarde.",
      "Esta noche, magnesio + pantallas fuera 30 min antes de dormir.",
    ],
  },
  {
    id: "antojos",
    pregunta: "Tengo antojos",
    pasos: [
      "Antes de comer algo, toma un vaso de agua y espera 5 minutos — a veces el antojo es sed.",
      "Si sigue, ve por un snack con proteína (huevo, yogur griego, un puñado de nueces).",
      "El antojo casi siempre baja solo en 15-20 minutos una vez que comes algo con proteína.",
      "No te juzgues por el antojo — es una señal de tu cuerpo, no una falta de voluntad.",
    ],
  },
  {
    id: "no-se-que-cenar",
    pregunta: "No sé qué cenar",
    pasos: [
      "Base simple: proteína (pollo, pescado, huevo o legumbre) + vegetales + una grasa buena.",
      "Evita el pan blanco y los ultraprocesados en la cena — son tu detonante nocturno más común.",
      "Si tienes poco tiempo: un salteado de vegetales con proteína en 15 minutos alcanza.",
      "Cena al menos 2-3 horas antes de dormir si puedes.",
    ],
  },
  {
    id: "sin-energia",
    pregunta: "Me siento sin energía",
    pasos: [
      "Revisa tu última comida: ¿tenía proteína? Si no, prioriza proteína en la siguiente.",
      "10 min de luz solar o aire libre ayudan más que otro café.",
      "Un vaso de agua — la fatiga leve muchas veces es deshidratación.",
      "Si la energía baja es constante esta semana, es señal de que tu prioridad #1 debería ser sueño.",
    ],
  },
];
