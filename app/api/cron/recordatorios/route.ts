import { crearClienteAdmin } from "@/lib/supabase/admin";
import { enviarPushAUsuario } from "@/lib/push/server";
import { mensajeRachaAleatorio } from "@/lib/push/mensajes";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Corre por Vercel Cron (ver vercel.json) unas horas antes de medianoche — le avisa solo a
 * quienes YA tienen una racha real que perder y que todavía no hicieron su check-in de hoy. A
 * nadie con racha en 0 (no hay nada que "salvar" ahí, sería spam sin sentido). */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(null, { status: 401 });
  }

  const admin = crearClienteAdmin();
  const hoy = new Date().toISOString().slice(0, 10);

  const { data: perfiles } = await admin
    .from("profiles")
    .select("id, racha_dias")
    .eq("activo", true)
    .gt("racha_dias", 0);

  if (!perfiles || perfiles.length === 0) return Response.json({ avisadas: 0 });

  const { data: checkinsHoy } = await admin.from("checkins_diarios").select("user_id").eq("fecha", hoy);
  const yaHicieronCheckin = new Set((checkinsHoy ?? []).map((c) => c.user_id));

  const pendientes = perfiles.filter((p) => !yaHicieronCheckin.has(p.id));

  await Promise.all(
    pendientes.map((p) => {
      const { titulo, cuerpo } = mensajeRachaAleatorio(p.racha_dias);
      return enviarPushAUsuario(p.id, titulo, cuerpo, "/app");
    }),
  );

  return Response.json({ avisadas: pendientes.length });
}
