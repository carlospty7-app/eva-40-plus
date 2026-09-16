/** Plantillas de correo transaccional de EVA 40+. Voz derivada de FICHA-AVATAR.md: kinestésica
 * (sentir, sentirse, ligera, incómoda), palabras permitidas (inflamación, hormonas, metabolismo,
 * ruta, prioridad, desinflamarte, energía), prohibidas (dieta extrema, calorías, macros, jerga
 * médica). Un solo CTA por correo, sin urgencia falsa. */

const VERDE = "#205344";
const ORO = "#e0c178";
const FONDO = "#fffefe";
const TEXTO = "#1a2e27";
const TEXTO_SUAVE = "#5b6b64";

function envoltura(preheader: string, cuerpoHtml: string): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${FONDO};font-family:Georgia,'Times New Roman',serif;">
  <span style="display:none;font-size:0;color:${FONDO};line-height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${FONDO};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:480px;" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding-bottom:28px;">
          <img src="https://eva40.app/brand/logo-horizontal.png" alt="EVA 40+" width="150" style="display:block;width:150px;height:auto;border:0;" />
        </td></tr>
        <tr><td style="background:#ffffff;border-radius:20px;padding:32px 28px;border:1px solid #ece7de;">
          ${cuerpoHtml}
        </td></tr>
        <tr><td align="center" style="padding-top:24px;">
          <p style="font-family:Arial,sans-serif;font-size:11.5px;color:${TEXTO_SUAVE};margin:0;">
            EVA 40+ · Creado por MaruHealthy · <a href="https://eva40.app/legal/privacidad" style="color:${TEXTO_SUAVE};">Privacidad</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function boton(texto: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:${VERDE};color:#ffffff;font-family:Arial,sans-serif;font-size:14.5px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:999px;">${texto}</a>`;
}

function parrafo(texto: string): string {
  return `<p style="font-family:Arial,sans-serif;font-size:14.5px;line-height:1.6;color:${TEXTO};margin:0 0 16px;">${texto}</p>`;
}

function titulo(texto: string): string {
  return `<h1 style="font-family:Georgia,serif;font-size:21px;font-weight:600;color:${TEXTO};margin:0 0 14px;line-height:1.3;">${texto}</h1>`;
}

const PLAN_LABEL: Record<string, string> = { anual: "anual ($79/año)", mensual: "mensual ($9.99/mes)" };

// A1 — Bienvenida / confirmación de pago (el más crítico: confirma que el cobro fue real y qué sigue)
export function correoBienvenida(plan: string, oferta: "pagado" | "gratis" = "pagado", variante: "A" | "B" = "A") {
  const esGratis = oferta === "gratis";
  const asunto =
    variante === "A" ? "Tu acceso a EVA 40+ ya está activo 🌿" : "Listo — tu ruta ya te está esperando";
  const preheader = esGratis
    ? "Tus 7 días gratis ya empezaron — sin ningún cobro."
    : "Tu pago se procesó y ya puedes entrar a tu ruta.";
  const cuerpo =
    titulo("Ya eres parte de EVA 40+") +
    parrafo(
      esGratis
        ? "Tus 7 días completamente gratis ya empezaron — no se te cobró nada. Tu plan " +
            (PLAN_LABEL[plan] ?? "") +
            " se activa solo al terminar tu prueba, y puedes cancelar antes si quieres."
        : "Tu pago se procesó sin problema y tu plan " +
            (PLAN_LABEL[plan] ?? "") +
            " ya está activo. Nada de cobros confusos ni sorpresas — esto es justo lo que aceptaste.",
    ) +
    parrafo(
      "Lo que sigue es simple: entra, haz tu revisión de 60 segundos, y deja que tu Ruta se ajuste a lo que tu cuerpo te está diciendo esta semana.",
    ) +
    `<div style="text-align:center;margin:24px 0 8px;">${boton("Entrar a mi cuenta", "https://eva40.app/app")}</div>` +
    parrafo(
      "<span style='color:" +
        TEXTO_SUAVE +
        ";font-size:13px;'>" +
        (esGratis
          ? "¿Alguna duda sobre tu prueba? Escríbenos a hola@eva40.app."
          : "¿Algo no cuadra con el cobro? Escríbenos a hola@eva40.app, sin preguntas.") +
        "</span>",
    );
  return { asunto, html: envoltura(preheader, cuerpo) };
}

// A — recuperación de acceso ya existe vía Supabase Auth (no se duplica aquí)

// B — Carrito abandonado (checkout.session.expired)
export function correoCarritoAbandonado() {
  const asunto = "¿Te quedaste a medias con tu diagnóstico?";
  const preheader = "Tu Score Metabólico sigue guardado, por si quieres retomarlo.";
  const cuerpo =
    titulo("Tu ruta te sigue esperando") +
    parrafo(
      "Empezaste tu diagnóstico pero no llegaste a activar tu acceso. No pasa nada — tu Score Metabólico y tu primera Ruta siguen guardados, listos para cuando quieras retomarlos.",
    ) +
    parrafo(
      "Sabemos que ya intentaste dietas, retos y suplementos que no calzaron con tu etapa. Esto no es otra dieta — es entender por qué tu cuerpo cambió, con una ruta hecha para ti.",
    ) +
    `<div style="text-align:center;margin:24px 0 8px;">${boton("Retomar mi ruta", "https://eva40.app/paywall")}</div>`;
  return { asunto, html: envoltura(preheader, cuerpo) };
}

// C1 — Pago fallido (dunning)
export function correoPagoFallido() {
  const asunto = "No pudimos procesar tu cobro — sin problema, se puede arreglar";
  const preheader = "Actualiza tu método de pago para no perder tu acceso.";
  const cuerpo =
    titulo("Tu tarjeta no dejó pasar el cobro") +
    parrafo(
      "Intentamos cobrar tu plan y no se pudo procesar — pasa seguido, casi siempre es la fecha de vencimiento o el límite de la tarjeta. Tu acceso sigue activo por ahora, pero vale la pena resolverlo pronto para no perder tu racha.",
    ) +
    `<div style="text-align:center;margin:24px 0 8px;">${boton("Actualizar mi método de pago", "https://eva40.app/app/cuenta")}</div>` +
    parrafo(
      "<span style='color:" +
        TEXTO_SUAVE +
        ";font-size:13px;'>Si necesitas ayuda, escríbenos a hola@eva40.app.</span>",
    );
  return { asunto, html: envoltura(preheader, cuerpo) };
}

// C2 — Cancelación (confirmación + puerta abierta para volver)
export function correoCancelacion() {
  const asunto = "Confirmamos tu cancelación";
  const preheader = "Tu acceso se mantiene activo hasta el final del período ya pagado.";
  const cuerpo =
    titulo("Tu plan quedó cancelado") +
    parrafo(
      "Confirmamos que no se te va a volver a cobrar. Tu acceso se mantiene activo hasta el final del período que ya pagaste.",
    ) +
    parrafo(
      "Si te vas porque algo no funcionó para ti, nos encantaría saber qué — a veces basta un ajuste chico. Y si quieres volver más adelante, tu cuenta va a seguir aquí.",
    ) +
    `<div style="text-align:center;margin:24px 0 8px;">${boton("Contarnos qué pasó", "mailto:hola@eva40.app")}</div>`;
  return { asunto, html: envoltura(preheader, cuerpo) };
}

// C3 — Reembolso
export function correoReembolso() {
  const asunto = "Tu reembolso ya se procesó";
  const preheader = "El 100% de lo pagado, sin preguntas — como prometimos.";
  const cuerpo =
    titulo("Reembolso confirmado") +
    parrafo(
      "Ya procesamos el reembolso del 100% de lo pagado, tal como lo prometimos. Puede tardar unos días hábiles en reflejarse en tu estado de cuenta, según tu banco.",
    ) +
    parrafo(
      "Gracias por darle una oportunidad a EVA 40+. Si algún día quieres volver a intentarlo, la puerta sigue abierta.",
    );
  return { asunto, html: envoltura(preheader, cuerpo) };
}

// D — Bienvenida/activación día 1 sin check-in (reutiliza el cron diario existente)
export function correoActivacionD1() {
  const asunto = "Tu primera revisión toma 60 segundos";
  const preheader = "Un paso chico para que tu Ruta empiece a ajustarse a ti.";
  const cuerpo =
    titulo("Falta tu primer paso") +
    parrafo(
      "Ayer activaste tu cuenta pero todavía no hiciste tu primera revisión — sin eso, tu Ruta no puede empezar a ajustarse a lo que tu cuerpo necesita esta semana.",
    ) +
    parrafo("Son 60 segundos: cómo te sientes hoy, y listo.") +
    `<div style="text-align:center;margin:24px 0 8px;">${boton("Hacer mi revisión de hoy", "https://eva40.app/app")}</div>`;
  return { asunto, html: envoltura(preheader, cuerpo) };
}
