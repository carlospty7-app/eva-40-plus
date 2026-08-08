export const DIA_LABELS = ["L", "M", "X", "J", "V", "S", "D"] as const;
export type DiaLabel = (typeof DIA_LABELS)[number];

const DIA_NOMBRE: Record<DiaLabel, string> = {
  L: "Lunes",
  M: "Martes",
  X: "Miércoles",
  J: "Jueves",
  V: "Viernes",
  S: "Sábado",
  D: "Domingo",
};

export function nombreDia(d: DiaLabel): string {
  return DIA_NOMBRE[d];
}

export function lunesDeEstaSemana(base = new Date()): Date {
  const d = new Date(base);
  const dia = d.getDay(); // 0 domingo ... 6 sábado
  const diff = dia === 0 ? -6 : 1 - dia;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function semanaActual(base = new Date()): Date[] {
  const lunes = lunesDeEstaSemana(base);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(lunes);
    d.setDate(lunes.getDate() + i);
    return d;
  });
}

export function mismodDia(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function formatoCorto(d: Date): string {
  return d.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export function isoFecha(d: Date): string {
  return d.toISOString().slice(0, 10);
}
