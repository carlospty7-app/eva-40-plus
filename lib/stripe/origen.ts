const ORIGEN_PRODUCCION = "https://eva40.app";

/** Solo se aceptan orígenes propios (producción, previews de Vercel y localhost) — el header
 * `Origin` lo controla quien llama, así que nunca se usa tal cual para armar las URLs de retorno. */
export function origenSeguro(req: Request): string {
  const candidato = req.headers.get("origin") || new URL(req.url).origin;
  try {
    const { protocol, hostname, origin } = new URL(candidato);
    const esLocal = hostname === "localhost" || hostname === "127.0.0.1";
    const esPropio = hostname === "eva40.app" || hostname.endsWith(".vercel.app");
    if ((protocol === "https:" && esPropio) || (protocol === "http:" && esLocal)) return origin;
  } catch {
    // cae al valor seguro de abajo
  }
  return ORIGEN_PRODUCCION;
}
