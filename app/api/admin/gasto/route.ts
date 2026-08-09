import { crearClienteAdmin, esCorreoAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

type CuerpoGasto = { channel?: string; amountUsd?: number; periodStart?: string; periodEnd?: string };

/** Registra un gasto de adquisición (ads/afiliados/UGC) por canal — lo carga el dueño a mano desde
 * la pestaña "Negocio" del panel, porque Hotmart no reporta ese gasto. Gateado por el mismo correo
 * admin que protege /admin (el guard de la ruta no alcanza a un POST de API, hay que repetirlo). */
export async function POST(req: Request) {
  const supabaseUsuario = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseUsuario.auth.getUser();

  if (!esCorreoAdmin(user?.email)) {
    return new Response(null, { status: 403 });
  }

  let body: CuerpoGasto;
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }

  const channel = (body.channel || "").trim().slice(0, 60);
  const amountUsd = Number(body.amountUsd);
  const periodStart = body.periodStart;
  const periodEnd = body.periodEnd;

  if (!channel) return new Response("Falta el nombre del canal", { status: 400 });
  if (!Number.isFinite(amountUsd) || amountUsd < 0) return new Response("Monto inválido", { status: 400 });
  if (!periodStart || !periodEnd) return new Response("Faltan las fechas del período", { status: 400 });

  const admin = crearClienteAdmin();
  const { error } = await admin
    .from("acquisition_spend")
    .insert({ channel, amount_usd: amountUsd, period_start: periodStart, period_end: periodEnd });

  if (error) return new Response("No se pudo guardar", { status: 500 });
  return new Response(null, { status: 204 });
}
