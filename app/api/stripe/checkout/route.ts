import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteStripe, priceIdAcceso7Dias, priceIdDelPlan, type PlanEva } from "@/lib/stripe/server";
import { origenSeguro } from "@/lib/stripe/origen";

export const runtime = "nodejs";

type CuerpoCheckout = { plan?: string; oferta?: string };

/** Crea una sesión de pago de Stripe para la usuaria autenticada y devuelve la URL a la que hay
 * que redirigirla. Soporta 2 ofertas, controladas por `oferta` (viene del paywall vía `?oferta=`):
 * - "pagado" (por defecto): cobra $1 de una vez por los primeros 7 días de acceso (línea de precio
 *   único) y, en paralelo, arranca la suscripción del plan elegido con 7 días de prueba.
 * - "gratis": arranca la MISMA suscripción con 7 días de prueba, pero SIN el cobro de $1 — 7 días
 *   totalmente gratis, sin ningún cargo hasta que Stripe cobre sola el plan completo al día 7. */
export async function POST(req: Request) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return new Response(null, { status: 401 });

  let body: CuerpoCheckout;
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }

  const plan: PlanEva = body.plan === "anual" ? "anual" : "mensual";
  const esOfertaGratis = body.oferta === "gratis";

  const origin = origenSeguro(req);
  const stripe = crearClienteStripe();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("stripe_customer_id, activo")
    .eq("id", user.id)
    .single();

  // Ya tiene acceso activo: no se le abre otro cobro (evitaría una suscripción duplicada).
  if (perfil?.activo === true) return Response.json({ ya_activa: true }, { status: 409 });

  let customerId = perfil?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    // Con el cliente de servicio: las usuarias ya no pueden escribir sus columnas de pago.
    const { error: errorGuardar } = await crearClienteAdmin()
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
    if (errorGuardar) console.error("No se pudo guardar el cliente de Stripe", errorGuardar);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [
      ...(esOfertaGratis ? [] : [{ price: priceIdAcceso7Dias(), quantity: 1 }]),
      { price: priceIdDelPlan(plan), quantity: 1 },
    ],
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: user.id, plan, oferta: esOfertaGratis ? "gratis" : "pagado" },
    },
    metadata: { user_id: user.id, plan },
    success_url: `${origin}/activando`,
    cancel_url: `${origin}/paywall`,
  });

  if (!session.url) return new Response("No se pudo crear la sesión de pago", { status: 500 });
  return Response.json({ url: session.url });
}
