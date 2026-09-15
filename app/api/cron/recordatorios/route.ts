import { crearClienteAdmin } from "@/lib/supabase/admin";
import { enviarPushAUsuario } from "@/lib/push/server";
import { mensajeRachaAleatorio } from "@/lib/push/mensajes";
import { enviarCorreo } from "@/lib/email/resend";
import { correoActivacionD1 } from "@/lib/email/plantillas";

export const runtime = "nodejs";
export const maxDuration = 60;

const PRECIO_PLAN: Record<string, string> = { anual: "$79", mensual: "$9.99" };

/** Corre por Vercel Cron (ver vercel.json) unas horas antes de medianoche.
 * 1) Avisa a quienes YA tienen una racha real que perder y todavía no hicieron su check-in de hoy
 *    (a nadie con racha en 0 — no hay nada que "salvar" ahí, sería spam sin sentido).
 * 2) Avisa 1 día antes de que se le haga el primer cobro automático (fin de los 7 días de $1),
 *    para que nadie se sorprenda con el cargo.
 * 3) Le manda UN correo de activación a quien se registró AYER y todavía no hizo ni una sola
 *    revisión — nunca más de uno (se manda solo el día siguiente al registro, no se repite). */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response(null, { status: 401 });
  }

  const admin = crearClienteAdmin();
  const hoy = new Date().toISOString().slice(0, 10);
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const mananaIso = manana.toISOString().slice(0, 10);
  const ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);
  const ayerInicioIso = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate()).toISOString();
  const hoyInicioIso = new Date().toISOString().slice(0, 10) + "T00:00:00.000Z";

  const [{ data: perfilesConRacha }, { data: perfilesPorCobrar }, { data: perfilesNuevosAyer }] = await Promise.all([
    admin.from("profiles").select("id, racha_dias").eq("activo", true).gt("racha_dias", 0),
    admin.from("profiles").select("id, plan").eq("trial_activo", true).eq("fecha_cobro", mananaIso),
    admin
      .from("profiles")
      .select("id, email")
      .eq("activo", true)
      .gte("created_at", ayerInicioIso)
      .lt("created_at", hoyInicioIso),
  ]);

  const { data: checkinsHoy } = await admin.from("checkins_diarios").select("user_id").eq("fecha", hoy);
  const yaHicieronCheckin = new Set((checkinsHoy ?? []).map((c) => c.user_id));
  const pendientesRacha = (perfilesConRacha ?? []).filter((p) => !yaHicieronCheckin.has(p.id));

  let pendientesActivacion: { id: string; email: string | null }[] = [];
  if (perfilesNuevosAyer && perfilesNuevosAyer.length > 0) {
    const { data: algunCheckin } = await admin
      .from("checkins_diarios")
      .select("user_id")
      .in("user_id", perfilesNuevosAyer.map((p) => p.id));
    const yaHicieronAlgunCheckin = new Set((algunCheckin ?? []).map((c) => c.user_id));
    pendientesActivacion = perfilesNuevosAyer.filter((p) => !yaHicieronAlgunCheckin.has(p.id));
  }

  await Promise.all([
    ...pendientesRacha.map((p) => {
      const { titulo, cuerpo } = mensajeRachaAleatorio(p.racha_dias);
      return enviarPushAUsuario(p.id, titulo, cuerpo, "/app");
    }),
    ...(perfilesPorCobrar ?? []).map((p) => {
      const precio = PRECIO_PLAN[p.plan] ?? PRECIO_PLAN.anual;
      return enviarPushAUsuario(
        p.id,
        "Mañana se activa tu plan 💚",
        `Mañana se hace tu primer cobro de ${precio} (${p.plan}). Si quieres cancelar antes, hazlo desde Cuenta.`,
        "/app/cuenta",
      );
    }),
    ...pendientesActivacion
      .filter((p): p is { id: string; email: string } => !!p.email)
      .map((p) => {
        const { asunto, html } = correoActivacionD1();
        return enviarCorreo(p.email, asunto, html);
      }),
  ]);

  return Response.json({
    avisadasRacha: pendientesRacha.length,
    avisadasCobro: (perfilesPorCobrar ?? []).length,
    avisadasActivacion: pendientesActivacion.length,
  });
}
