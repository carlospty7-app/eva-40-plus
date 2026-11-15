import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteStripe } from "@/lib/stripe/server";
import { origenSeguro } from "@/lib/stripe/origen";

export const runtime = "nodejs";

/** Abre el portal de cliente de Stripe (cancelar, cambiar plan, actualizar tarjeta, ver facturas)
 * para la usuaria autenticada y devuelve la URL a la que hay que mandarla. */
export async function POST(req: Request) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  const { data: perfil } = await supabase.from("profiles").select("stripe_customer_id").eq("id", user.id).single();
  if (!perfil?.stripe_customer_id) {
    return Response.json({ error: "sin_suscripcion" }, { status: 404 });
  }

  try {
    const stripe = crearClienteStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: perfil.stripe_customer_id,
      return_url: `${origenSeguro(req)}/app/cuenta`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("No se pudo abrir el portal de Stripe", err);
    return Response.json({ error: "portal_no_disponible" }, { status: 502 });
  }
}
