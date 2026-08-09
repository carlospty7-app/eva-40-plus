import { crearClienteAdmin, esCorreoAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CuerpoCrear = { email?: string; password?: string; nombre?: string; plan?: "anual" | "mensual" };

/** Crea una cuenta real manualmente (ej: alguien pagó por fuera de Hotmart, o el webhook falló al
 * dar de alta) — usa la API de administración de Supabase para crear el usuario ya confirmado
 * (sin pasar por el correo de verificación), y el trigger `on_auth_user_created` arma su fila de
 * `profiles`; después se ajustan nombre/plan encima de esos valores por defecto. */
export async function POST(req: Request) {
  const supabaseUsuario = await crearClienteServidor();
  const {
    data: { user },
  } = await supabaseUsuario.auth.getUser();

  if (!esCorreoAdmin(user?.email)) {
    return new Response(null, { status: 403 });
  }

  let body: CuerpoCrear;
  try {
    body = await req.json();
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }

  const email = (body.email || "").trim().toLowerCase();
  const password = body.password || "";
  const nombre = (body.nombre || "").trim();
  const plan = body.plan === "mensual" ? "mensual" : "anual";

  if (!EMAIL_RE.test(email)) return new Response("Correo inválido", { status: 400 });
  if (password.length < 6) return new Response("La contraseña necesita al menos 6 caracteres", { status: 400 });

  const admin = crearClienteAdmin();
  const { data: creado, error: errorCrear } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (errorCrear || !creado.user) {
    return new Response(errorCrear?.message || "No se pudo crear la cuenta", { status: 400 });
  }

  if (nombre || plan) {
    await admin
      .from("profiles")
      .update({ ...(nombre ? { nombre } : {}), plan, trial_activo: false })
      .eq("id", creado.user.id);
  }

  return new Response(null, { status: 204 });
}
