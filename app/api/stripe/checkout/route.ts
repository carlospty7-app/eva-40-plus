import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteStripe, priceIdDelPlan, type PlanEva } from "@/lib/stripe/server";

export const runtime = "nodejs";

type CuerpoCheckout = { plan?: string };

/** Crea una sesión de pago de Stripe (7 días gratis, luego cobro automático) para la usuaria
 * autenticada y devuelve la URL a la que hay que redirigirla. */
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

  const plan: PlanEva = body.plan === "mensual" ? "mensual" : "anual";

  const origin = req.headers.get("origin") || new URL(req.url).origin;
  const stripe = crearClienteStripe();

  const { data: perfil } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  let customerId = perfil?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceIdDelPlan(plan), quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { user_id: user.id, plan },
    },
    metadata: { user_id: user.id, plan },
    success_url: `${origin}/app?checkout=success`,
    cancel_url: `${origin}/paywall`,
  });

  if (!session.url) return new Response("No se pudo crear la sesión de pago", { status: 500 });
  return Response.json({ url: session.url });
}
