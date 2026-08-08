/** Mensajes de refuerzo tras completar la revisión diaria — tono cálido, sin jerga clínica,
 * conectados a la idea de constancia (no perfección) y al beneficio futuro. */
export const MENSAJES_DIARIOS: { titulo: string; texto: string }[] = [
  {
    titulo: "Lo estás haciendo muy bien",
    texto: "Tu constancia de hoy es justo lo que tu cuerpo va a agradecer mañana.",
  },
  {
    titulo: "Un día más enfocada en ti",
    texto: "Tu yo del futuro te lo va a agradecer — sigue así.",
  },
  {
    titulo: "Esto es lo que hace la diferencia",
    texto: "No es la perfección, es la constancia. Y hoy sumaste otro día.",
  },
  {
    titulo: "Hoy te elegiste a ti",
    texto: "Cada revisión es una señal de que te estás escuchando.",
  },
  {
    titulo: "Vas por buen camino",
    texto: "Pequeños pasos, cada día — así se transforma de verdad tu cuerpo.",
  },
];

export function mensajeDiarioAleatorio() {
  return MENSAJES_DIARIOS[Math.floor(Math.random() * MENSAJES_DIARIOS.length)];
}
