import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/app", "/admin", "/api", "/activando", "/cuenta-desactivada"] }],
    sitemap: "https://eva40.app/sitemap.xml",
  };
}
