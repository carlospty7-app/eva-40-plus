import Stripe from "stripe";

/** Cliente de Stripe para el servidor — nunca se importa desde un componente cliente. Falla fuerte
 * si falta la clave en vez de arrancar en un estado inseguro/a medias. */
export function crearClienteStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno del servidor.");
  return new Stripe(secretKey);
}

export type PlanEva = "anual" | "mensual";

/** Mapea nuestro identificador interno de plan al Price ID real de Stripe (configurado en env). */
export function priceIdDelPlan(plan: PlanEva): string {
  const priceId = plan === "anual" ? process.env.STRIPE_PRICE_ANUAL : process.env.STRIPE_PRICE_MENSUAL;
  if (!priceId) throw new Error(`Falta STRIPE_PRICE_${plan.toUpperCase()} en las variables de entorno del servidor.`);
  return priceId;
}

/** Camino inverso: de un Price ID de Stripe a nuestro plan interno — usado por el webhook para
 * saber qué guardar en `profiles.plan` a partir de la suscripción real que Stripe reporta. */
export function planDelPriceId(priceId: string | undefined | null): PlanEva {
  if (priceId && priceId === process.env.STRIPE_PRICE_MENSUAL) return "mensual";
  return "anual";
}
