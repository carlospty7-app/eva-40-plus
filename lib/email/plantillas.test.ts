import { describe, expect, it } from "vitest";
import { correoBienvenida } from "./plantillas";

const fechaCobro = new Date("2026-11-22T12:00:00Z");

describe("correoBienvenida", () => {
  it("con la oferta de $1 dice que se pagó $1 y cuándo se cobra el plan, sin decir que el plan ya se pagó", () => {
    const { html } = correoBienvenida("anual", "pagado", fechaCobro);
    expect(html).toContain("Tu pago de $1");
    expect(html).toContain("22 de noviembre");
    expect(html).toContain("primer cobro");
    expect(html).toContain("cancelar cuando quieras");
    expect(html).not.toContain("ya está activo. Nada de cobros");
  });

  it("con la oferta gratis dice que no se cobró nada", () => {
    const { html } = correoBienvenida("mensual", "gratis", fechaCobro);
    expect(html).toContain("no se te cobró nada");
    expect(html).not.toContain("Tu pago de $1");
  });

  it("sin fecha igual explica que el primer cobro llega al terminar los 7 días", () => {
    const { html } = correoBienvenida("anual", "pagado");
    expect(html).toContain("Al terminar tus 7 días");
  });
});
