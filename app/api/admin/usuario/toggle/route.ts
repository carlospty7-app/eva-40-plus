import { crearClienteAdmin, esCorreoAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Activa o desactiva una cuenta — cuando queda desactivada, `proxy.ts` le bloquea el acceso a
 * `/app` en el siguiente request (no basta con ocultarlo en la UI). Pensado para el caso que
 * describe 21-BACKOFFICE.md: el webhook de pago falló y hay que apagar el acceso a mano. */
export async function POST(req: Request) {
  const supabaseUsuario = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseUsuario.auth.getUser();

  if (!esCorreoAdmin(user?.email)) {
    return new Response(null, { status: 403 });
  }

  let body: { userId?: string; activo?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }

  if (!body.userId || typeof body.activo !== "boolean") {
    return new Response("Faltan datos", { status: 400 });
  }

  const admin = crearClienteAdmin();
  const { error } = await admin.from("profiles").update({ activo: body.activo }).eq("id", body.userId);

  if (error) return new Response("No se pudo actualizar", { status: 500 });
  return new Response(null, { status: 204 });
}
