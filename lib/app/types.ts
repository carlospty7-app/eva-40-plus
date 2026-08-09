import type { DiaLabel } from "@/lib/app/dates";

/** Escala 1-5. Para inflamacion/estres/antojos: 1=nada, 5=mucho (más alto = peor).
 * Para energia/sueno/digestion: 1=muy mal, 5=excelente (más alto = mejor). */
export type EstadoDia = {
  inflamacion: number;
  energia: number;
  sueno: number;
  estres: number;
  antojos: number;
  digestion: number;
};

export type Checkin = EstadoDia & {
  fecha: string; // ISO yyyy-mm-dd
  /** Lo que la usuaria escribió (o dictó) libremente sobre cómo se siente y qué quiere lograr. */
  notas?: string;
};

export type MenuDia = {
  desayuno: string;
  almuerzo: string;
  cena: string;
};

export type MovimientoDia = {
  titulo: string;
  duracionMin: number;
  tipo: "yoga" | "caminata" | "movilidad";
  descripcion: string;
  /** Video real de Maru en YouTube, cuando existe — si no hay, la usuaria solo ve la descripción. */
  videoUrl?: string;
};

export type DiaRuta = {
  dia: DiaLabel;
  fecha: string; // ISO yyyy-mm-dd
  mision: string;
  alimentosRecomendados: string[];
  alimentosLimitar: string[];
  habitoPrioritario: string;
  menu: MenuDia;
  movimiento: MovimientoDia;
  completado: boolean;
};

export type PuntoScore = {
  fecha: string; // ISO
  score: number;
};

export const SINTOMAS_CICLO = [
  { id: "calor_subito", label: "Calor súbito" },
  { id: "cambios_animo", label: "Cambios de ánimo" },
  { id: "niebla_mental", label: "Niebla mental" },
  { id: "dolor_articular", label: "Dolor articular" },
  { id: "sensibilidad_mamaria", label: "Sensibilidad" },
] as const;
export type SintomaCicloId = (typeof SINTOMAS_CICLO)[number]["id"];

/** Registro libre, no un calendario predictivo — a los 40+ el ciclo suele ser irregular por
 * perimenopausia, así que no se asume un patrón de 28 días ni se le pide a la usuaria predecir
 * nada, solo contar lo que nota ese día. */
export type RegistroCiclo = {
  fecha: string; // ISO yyyy-mm-dd
  sangrado: boolean;
  intensidad?: 1 | 2 | 3; // 1 ligero, 2 medio, 3 abundante — solo aplica si sangrado=true
  sintomas: SintomaCicloId[];
  notas?: string;
};

export type PerfilUsuaria = {
  nombre: string;
  email?: string;
  /** Foto de perfil como data URL (base64) — se guarda local hasta que haya storage real. */
  fotoUrl?: string;
  metaLabel: string;
  dolorLabel: string;
  plan: "anual" | "mensual";
  trialActivo: boolean;
  fechaCobro: string; // ISO — cuándo se activa el cobro si sigue en trial
};

export type EstadoApp = {
  perfil: PerfilUsuaria;
  rutaSemana: DiaRuta[];
  checkins: Checkin[];
  scoreHistorial: PuntoScore[];
  rachaDias: number;
};
