import Stripe from "stripe";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteStripe } from "@/lib/stripe/server";

export const runtime = "nodejs";

/** Borra por completo la cuenta de la usuaria autenticada (derecho de supresión de datos): primero
 * cancela su suscripción en Stripe para que nunca se le vuelva a cobrar, luego borra su foto y su
 * usuario — el resto de sus datos (check-ins, ciclo, retos, etc.) se elimina en cascada. Si la
 * suscripción no se puede cancelar, NO se borra nada (mejor fallar que dejar un cobro vivo). */
export async function POST(req: Request) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  let body: { confirmar?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }
  if (body.confirmar !== true) return new Response("Falta la confirmación", { status: 400 });

  const { data: perfil } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const subscriptionId = perfil?.stripe_subscription_id;
  if (subscriptionId) {
    try {
      const stripe = crearClienteStripe();
      const suscripcion = await stripe.subscriptions.retrieve(subscriptionId);
      if (suscripcion.status !== "canceled") await stripe.subscriptions.cancel(subscriptionId);
    } catch (err) {
      const noExiste = err instanceof Stripe.errors.StripeError && err.code === "resource_missing";
      if (!noExiste) {
        console.error("No se pudo cancelar la suscripción al borrar la cuenta", err);
        return new Response("No pudimos cancelar tu suscripción — escríbenos a hola@eva40.app", { status: 502 });
      }
    }
  }

  const admin = crearClienteAdmin();
  const { data: archivos } = await admin.storage.from("avatars").list(user.id);
  if (archivos && archivos.length > 0) {
    await admin.storage.from("avatars").remove(archivos.map((a) => `${user.id}/${a.name}`));
  }

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("No se pudo borrar el usuario", error);
    return new Response("No pudimos borrar tu cuenta — escríbenos a hola@eva40.app", { status: 500 });
  }

  return new Response(null, { status: 204 });
}
