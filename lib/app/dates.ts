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

/** Grilla de un mes en semanas de lunes a domingo — huecos antes/después del mes se rellenan con
 * `null` para que el calendario mantenga columnas fijas por día de la semana. */
export function mesCalendario(anio: number, mes: number): (Date | null)[] {
  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const offsetInicio = (primerDia.getDay() + 6) % 7; // lunes = 0

  const dias: (Date | null)[] = Array(offsetInicio).fill(null);
  for (let d = 1; d <= ultimoDia.getDate(); d++) dias.push(new Date(anio, mes, d));
  while (dias.length % 7 !== 0) dias.push(null);
  return dias;
}

/** Días de calendario entre dos fechas ISO (b - a), puede ser negativo. */
export function diferenciaDias(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 60 * 60 * 1000));
}

export function nombreMes(anio: number, mes: number): string {
  const texto = new Date(anio, mes, 1).toLocaleDateString("es", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
