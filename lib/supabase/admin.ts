import { createClient } from "@supabase/supabase-js";

/** Cliente de Supabase con la clave de servicio (service role) — SALTA RLS por completo.
 * Solo se importa desde código de servidor ya protegido por el guard de admin (proxy.ts +
 * verificación de email en cada acción de servidor) — jamás desde un componente cliente. */
export function crearClienteAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/** Lista de correos autorizados a entrar a /admin, leída del servidor. */
export function correosAdmin(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function esCorreoAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return correosAdmin().includes(email.toLowerCase());
}
