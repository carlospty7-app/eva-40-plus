import { crearClienteAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Un solo conteo agregado y real (nunca datos de otra usuaria en particular) para que Hoy no se
 * sienta como una isla — cuántas mujeres ya hicieron su revisión hoy, en toda la app. Público a
 * propósito: no expone nada identificable, es un número, igual que "cuántos vieron esto" en
 * cualquier app. Si algún día hace falta, se puede exigir sesión sin cambiar el contrato. */
export async function GET() {
  const hoy = new Date().toISOString().slice(0, 10);
  const admin = crearClienteAdmin();
  const { count } = await admin
    .from("checkins_diarios")
    .select("id", { count: "exact", head: true })
    .eq("fecha", hoy);

  return Response.json({ checkinsHoy: count ?? 0 });
}
