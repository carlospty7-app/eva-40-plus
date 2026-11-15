import type { MetadataRoute } from "next";

const BASE = "https://eva40.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const rutas = [
    { ruta: "", prioridad: 1 },
    { ruta: "/onboarding", prioridad: 0.8 },
    { ruta: "/legal/privacidad", prioridad: 0.3 },
    { ruta: "/legal/terminos", prioridad: 0.3 },
    { ruta: "/legal/reembolso", prioridad: 0.3 },
    { ruta: "/legal/disclaimer-ia", prioridad: 0.3 },
  ];
  return rutas.map(({ ruta, prioridad }) => ({ url: BASE + ruta, priority: prioridad }));
}
