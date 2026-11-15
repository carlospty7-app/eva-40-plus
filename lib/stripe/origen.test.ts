import { describe, expect, it } from "vitest";
import { origenSeguro } from "./origen";

const pedido = (origin?: string) =>
  new Request("https://eva40.app/api/stripe/checkout", { headers: origin ? { origin } : {} });

describe("origenSeguro", () => {
  it("acepta producción, previews de Vercel y localhost", () => {
    expect(origenSeguro(pedido("https://eva40.app"))).toBe("https://eva40.app");
    expect(origenSeguro(pedido("https://eva-40-plus-git-desarrollo.vercel.app"))).toBe(
      "https://eva-40-plus-git-desarrollo.vercel.app",
    );
    expect(origenSeguro(pedido("http://localhost:3000"))).toBe("http://localhost:3000");
  });

  it("rechaza orígenes ajenos y vuelve a producción", () => {
    expect(origenSeguro(pedido("https://sitio-malicioso.com"))).toBe("https://eva40.app");
    expect(origenSeguro(pedido("https://eva40.app.malicioso.com"))).toBe("https://eva40.app");
    expect(origenSeguro(pedido("http://eva40.app"))).toBe("https://eva40.app");
  });
});
