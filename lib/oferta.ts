export type Oferta = "pagado" | "gratis";

const CLAVE = "eva:oferta";

/** Qué oferta aplica a quien está navegando: la que venga en la URL (`?oferta=gratis`) manda y se
 * recuerda en el navegador (así sobrevive landing → onboarding → paywall); sin parámetro, la última
 * recordada; por defecto, la de $1. Solo se llama desde el navegador. */
export function leerOferta(): Oferta {
  try {
    const enUrl = new URLSearchParams(window.location.search).get("oferta");
    if (enUrl === "gratis" || enUrl === "pagado") {
      localStorage.setItem(CLAVE, enUrl);
      return enUrl;
    }
    return localStorage.getItem(CLAVE) === "gratis" ? "gratis" : "pagado";
  } catch {
    return "pagado";
  }
}
