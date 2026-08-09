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
