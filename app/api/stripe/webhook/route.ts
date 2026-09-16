import Stripe from "stripe";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteStripe, planDelPriceId } from "@/lib/stripe/server";
import { enviarCorreo } from "@/lib/email/resend";
import {
  correoBienvenida,
  correoCancelacion,
  correoCarritoAbandonado,
  correoPagoFallido,
  correoReembolso,
} from "@/lib/email/plantillas";

export const runtime = "nodejs";

/** Traduce el estado real de la suscripción en Stripe a nuestros 2 campos de acceso. */
function accesoDesdeEstado(estado: Stripe.Subscription.Status): { activo: boolean; trialActivo: boolean } {
  switch (estado) {
    case "trialing":
      return { activo: true, trialActivo: true };
    case "active":
    case "past_due":
      // "past_due" (falló el cobro) se deja activa un margen — se le avisa por correo, pero no se
      // le corta el acceso de golpe por un solo cobro fallido.
      return { activo: true, trialActivo: false };
    default:
      // canceled, unpaid, incomplete, incomplete_expired
      return { activo: false, trialActivo: false };
  }
}

async function emailDeUsuario(userId: string): Promise<string | null> {
  const supabaseAdmin = crearClienteAdmin();
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

async function aplicarSuscripcion(subscription: Stripe.Subscription) {
  const supabaseAdmin = crearClienteAdmin();
  const userId = subscription.metadata?.user_id;
  if (!userId) return;

  const priceId = subscription.items.data[0]?.price?.id;
  const plan = planDelPriceId(priceId);
  const { activo, trialActivo } = accesoDesdeEstado(subscription.status);
  const finPeriodo = subscription.items.data[0]?.current_period_end;

  await supabaseAdmin
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      plan,
      activo,
      trial_activo: trialActivo,
      ...(finPeriodo ? { fecha_cobro: new Date(finPeriodo * 1000).toISOString().slice(0, 10) } : {}),
    })
    .eq("id", userId);

  return { userId, plan };
}

/** Recibe los avisos automáticos de Stripe (pagó, canceló, falló un cobro, pidió reembolso) y
 * actualiza la cuenta + manda el correo correspondiente sola — con la firma verificada (nadie más
 * que Stripe puede llamarlo de verdad) y a prueba de duplicados (Stripe puede reenviar el mismo
 * aviso más de una vez). Un correo que falla nunca tumba el resto del procesamiento. */
export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) return new Response(null, { status: 400 });

  const rawBody = await req.text();
  const stripe = crearClienteStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return new Response("Firma inválida", { status: 400 });
  }

  const supabaseAdmin = crearClienteAdmin();
  const { error: yaProcesado } = await supabaseAdmin.from("webhook_events").insert({ id: event.id });
  if (yaProcesado) {
    // Clave duplicada = este evento ya se procesó antes (Stripe reintenta envíos) — no repetirlo.
    return new Response(null, { status: 200 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        const resultado = await aplicarSuscripcion(subscription);
        const destinatario = session.customer_details?.email ?? (resultado ? await emailDeUsuario(resultado.userId) : null);
        if (destinatario && resultado) {
          const oferta = subscription.metadata?.oferta === "gratis" ? "gratis" : "pagado";
          const { asunto, html } = correoBienvenida(resultado.plan, oferta);
          await enviarCorreo(destinatario, asunto, html);
        }
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const destinatario = session.customer_details?.email;
      if (destinatario) {
        const { asunto, html } = correoCarritoAbandonado();
        await enviarCorreo(destinatario, asunto, html);
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const elStatusCambioEnEsteEvento = !!event.data.previous_attributes && "status" in event.data.previous_attributes;
      const nuevoEsPastDue = subscription.status === "past_due";
      const resultado = await aplicarSuscripcion(subscription);

      // Solo avisamos en el momento en que SE VUELVE past_due (el status cambió Y el nuevo valor
      // es past_due) — no en cada actualización menor de una suscripción que ya estaba así.
      if (nuevoEsPastDue && elStatusCambioEnEsteEvento && resultado) {
        const destinatario = await emailDeUsuario(resultado.userId);
        if (destinatario) {
          const { asunto, html } = correoPagoFallido();
          await enviarCorreo(destinatario, asunto, html);
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const resultado = await aplicarSuscripcion(subscription);
      if (resultado) {
        const destinatario = await emailDeUsuario(resultado.userId);
        if (destinatario) {
          const { asunto, html } = correoCancelacion();
          await enviarCorreo(destinatario, asunto, html);
        }
      }
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const destinatario =
        typeof charge.billing_details?.email === "string" ? charge.billing_details.email : null;
      if (destinatario) {
        const { asunto, html } = correoReembolso();
        await enviarCorreo(destinatario, asunto, html);
      }
      break;
    }
    default:
      break;
  }

  return new Response(null, { status: 200 });
}
