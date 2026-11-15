import { describe, expect, it } from "vitest";
import { computeScoreDia, insightsAutomaticos, listaDeComprasSemana } from "./engine";
import type { Checkin, DiaRuta } from "./types";

const checkin = (fecha: string, valores: Partial<Checkin>): Checkin => ({
  fecha,
  inflamacion: 3,
  energia: 3,
  sueno: 3,
  estres: 3,
  antojos: 3,
  digestion: 3,
  ...valores,
});

describe("computeScoreDia", () => {
  it("un día neutro da 60 y siempre queda entre 35 y 95", () => {
    expect(computeScoreDia({ inflamacion: 3, energia: 3, sueno: 3, estres: 3, antojos: 3, digestion: 3 })).toBe(60);
    expect(computeScoreDia({ inflamacion: 1, energia: 5, sueno: 5, estres: 1, antojos: 1, digestion: 5 })).toBeLessThanOrEqual(95);
    expect(computeScoreDia({ inflamacion: 5, energia: 1, sueno: 1, estres: 5, antojos: 5, digestion: 1 })).toBeGreaterThanOrEqual(35);
  });
});

describe("insightsAutomaticos", () => {
  it("con pocos días no inventa patrones, solo anima a seguir registrando", () => {
    const resultado = insightsAutomaticos([checkin("2026-01-01", {}), checkin("2026-01-02", {})]);
    expect(resultado).toEqual([]);
  });

  it("detecta que se inflama menos cuando duerme mejor, con el número de puntos", () => {
    const dias = [
      checkin("2026-01-01", { sueno: 5, inflamacion: 1 }),
      checkin("2026-01-02", { sueno: 4, inflamacion: 2 }),
      checkin("2026-01-03", { sueno: 1, inflamacion: 5 }),
      checkin("2026-01-04", { sueno: 2, inflamacion: 4 }),
    ];
    const [primero] = insightsAutomaticos(dias);
    expect(primero).toMatch(/duermes mejor/);
    expect(primero).toMatch(/\d+ puntos/);
  });
});

describe("listaDeComprasSemana", () => {
  it("junta los alimentos de la semana sin repetir", () => {
    const semana = [
      { alimentosRecomendados: ["Palta", "Quinoa"] },
      { alimentosRecomendados: ["palta", "Semillas"] },
    ] as unknown as DiaRuta[];
    expect(listaDeComprasSemana(semana)).toEqual(["Palta", "Quinoa", "Semillas"]);
  });
});
