import Stripe from "stripe";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteStripe, planDelPriceId } from "@/lib/stripe/server";

export const runtime = "nodejs";

/** Traduce el estado real de la suscripción en Stripe a nuestros 2 campos de acceso. */
function accesoDesdeEstado(estado: Stripe.Subscription.Status): { activo: boolean; trialActivo: boolean } {
  switch (estado) {
    case "trialing":
      return { activo: true, trialActivo: true };
    case "active":
    case "past_due":
      // "past_due" (falló el cobro) se deja activa un margen — el manejo de reintentos/avisos
      // (dunning) es un paso aparte, todavía no construido; por ahora no se le corta el acceso
      // de golpe por un solo cobro fallido.
      return { activo: true, trialActivo: false };
    default:
      // canceled, unpaid, incomplete, incomplete_expired
      return { activo: false, trialActivo: false };
  }
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
}

/** Recibe los avisos automáticos de Stripe (pagó, canceló, falló un cobro) y actualiza la cuenta
 * sola — con la firma verificada (nadie más que Stripe puede llamarlo de verdad) y a prueba de
 * duplicados (Stripe puede reenviar el mismo aviso más de una vez). */
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
        await aplicarSuscripcion(subscription);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await aplicarSuscripcion(event.data.object as Stripe.Subscription);
      break;
    }
    default:
      break;
  }

  return new Response(null, { status: 200 });
}
