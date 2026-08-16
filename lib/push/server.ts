import webPush from "web-push";
import { crearClienteAdmin } from "@/lib/supabase/admin";

let vapidConfigurado = false;

function asegurarVapid() {
  if (vapidConfigurado) return;
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hola@eva40.app",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  vapidConfigurado = true;
}

/** Manda un push a TODAS las suscripciones activas de una usuaria (puede tener más de un
 * dispositivo/navegador). Si una suscripción ya no es válida (410/404 — desinstaló, revocó
 * permiso), la borra sola en vez de seguir intentando por siempre. */
export async function enviarPushAUsuario(userId: string, titulo: string, cuerpo: string, url = "/app") {
  asegurarVapid();
  const admin = crearClienteAdmin();
  const { data: suscripciones } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!suscripciones || suscripciones.length === 0) return;

  await Promise.all(
    suscripciones.map(async (s) => {
      try {
        await webPush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify({ titulo, cuerpo, url }),
        );
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          await admin.from("push_subscriptions").delete().eq("id", s.id);
        }
      }
    }),
  );
}
