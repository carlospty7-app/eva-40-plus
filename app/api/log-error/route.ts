import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

const MAX_MESSAGE_CHARS = 500;
const MAX_CONTEXT_CHARS = 120;
const LIMITE_VENTANA_MS = 5 * 60 * 1000;
const LIMITE_REQUESTS = 30;
const requestsPorIp = new Map<string, number[]>();

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const previos = (requestsPorIp.get(ip) ?? []).filter((t) => ahora - t < LIMITE_VENTANA_MS);
  previos.push(ahora);
  requestsPorIp.set(ip, previos);
  return previos.length > LIMITE_REQUESTS;
}

/** Recibe errores del Error Boundary del cliente y los guarda en `error_log` con el cliente de
 * servicio (el navegador nunca tiene acceso directo a esa tabla — solo puede reportar por aquí,
 * con límite de tasa por IP). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocida";
  if (excedeLimite(ip)) return new Response(null, { status: 429 });

  let body: { message?: string; context?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const message = (body.message || "Error sin descripción").slice(0, MAX_MESSAGE_CHARS);
  const context = (body.context || "desconocido").slice(0, MAX_CONTEXT_CHARS);

  const supabaseUsuario = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseUsuario.auth.getUser();

  const admin = crearClienteAdmin();
  await admin.from("error_log").insert({ message, context, user_id: user?.id ?? null });

  return new Response(null, { status: 204 });
}
