import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EVA 40+",
    short_name: "EVA 40+",
    description: "Tu ruta metabólica semanal para sentirte más ligera después de los 40.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#fffefe",
    theme_color: "#205344",
    lang: "es",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
