/** Mensajes rotativos para el recordatorio de racha — tono motivador y juguetón (caritas, no
 * culpa ni urgencia falsa). Se elige uno al azar cada vez para que no se sienta repetitivo. */
export const MENSAJES_RACHA: { titulo: string; cuerpo: (racha: number) => string }[] = [
  {
    titulo: "😳 Tu racha te está esperando",
    cuerpo: (r) => `Llevas ${r} días seguidos — no dejes que hoy sea el que la corte. Toma 60 segundos.`,
  },
  {
    titulo: "🔥 No dejes que se apague",
    cuerpo: (r) => `${r} días de racha y contando... hoy todavía no hiciste tu revisión.`,
  },
  {
    titulo: "👀 EVA te está buscando",
    cuerpo: () => "Todavía no hiciste tu check-in de hoy — te toma menos de un minuto.",
  },
  {
    titulo: "😅 Casi se te escapa el día",
    cuerpo: (r) => `Faltan pocas horas — no pierdas tus ${r} días seguidos por hoy.`,
  },
  {
    titulo: "💪 Tu cuerpo quiere saber de ti",
    cuerpo: () => "Un check-in rápido y seguimos con tu ruta de hoy.",
  },
];

export function mensajeRachaAleatorio(rachaDias: number) {
  const elegido = MENSAJES_RACHA[Math.floor(Math.random() * MENSAJES_RACHA.length)];
  return { titulo: elegido.titulo, cuerpo: elegido.cuerpo(rachaDias) };
}
