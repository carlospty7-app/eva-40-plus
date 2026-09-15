import { Resend } from "resend";

/** Cliente de Resend para el servidor — nunca se importa desde un componente cliente. Falla fuerte
 * si falta la clave (mismo patrón que `lib/stripe/server.ts`), para no mandar correos a medias. */
export function crearClienteResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Falta RESEND_API_KEY en las variables de entorno del servidor.");
  return new Resend(apiKey);
}

export function remitente(): string {
  return process.env.RESEND_FROM || "EVA 40+ <hola@eva40.app>";
}

/** Envía un correo — nunca lanza (un correo que falla no debe tumbar el webhook de Stripe ni
 * ningún otro flujo crítico). Devuelve `true`/`false` para que quien llama decida si loguearlo. */
export async function enviarCorreo(destinatario: string, asunto: string, html: string): Promise<boolean> {
  try {
    const resend = crearClienteResend();
    const { error } = await resend.emails.send({
      from: remitente(),
      to: destinatario,
      subject: asunto,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}
