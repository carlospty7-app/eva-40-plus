import { crearClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

type SuscripcionJSON = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

/** Guarda (o actualiza) la suscripción push de la usuaria autenticada — RLS garantiza que solo
 * puede escribir su propia fila. */
export async function POST(req: Request) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response(null, { status: 401 });

  let body: SuscripcionJSON;
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }

  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return new Response("Faltan datos de la suscripción", { status: 400 });
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
    },
    { onConflict: "endpoint" },
  );

  if (error) return new Response("No se pudo guardar", { status: 500 });
  return new Response(null, { status: 204 });
}
