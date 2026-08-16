function base64UrlAUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export function pushSoportado(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

/** true si la usuaria ya dio (o negó) el permiso — para no volver a preguntar si ya respondió. */
export function permisoYaDecidido(): boolean {
  return pushSoportado() && Notification.permission !== "default";
}

/** Pide permiso, registra el service worker, se suscribe, y guarda la suscripción en el servidor.
 * Devuelve false sin lanzar error si algo no está disponible — nunca debe romper la pantalla que
 * lo llama. */
export async function activarRecordatorios(): Promise<boolean> {
  if (!pushSoportado()) return false;

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return false;

  const registro = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidPublicKey) return false;

  const suscripcion = await registro.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlAUint8Array(vapidPublicKey),
  });

  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(suscripcion.toJSON()),
  });

  return res.ok;
}
