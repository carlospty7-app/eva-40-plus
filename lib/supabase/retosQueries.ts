import type { SupabaseClient } from "@supabase/supabase-js";
import { isoFecha } from "@/lib/app/dates";
import type { Checkin } from "@/lib/app/types";

export type EstadoRetoDb = "activo" | "completado" | "extendido" | "abandonado";

export type RetoActivoRow = {
  id: string;
  retoSlug: string;
  fechaInicio: string;
  fechaFin: string;
  estado: EstadoRetoDb;
  ciclo: number;
};

type FilaRetoActivo = {
  id: string;
  reto_slug: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoRetoDb;
  ciclo: number;
};

function desdeFila(f: FilaRetoActivo): RetoActivoRow {
  return { id: f.id, retoSlug: f.reto_slug, fechaInicio: f.fecha_inicio, fechaFin: f.fecha_fin, estado: f.estado, ciclo: f.ciclo };
}

export async function obtenerRetoActivo(supabase: SupabaseClient, userId: string): Promise<RetoActivoRow | null> {
  const { data } = await supabase
    .from("reto_activo")
    .select("id, reto_slug, fecha_inicio, fecha_fin, estado, ciclo")
    .eq("user_id", userId)
    .eq("estado", "activo")
    .maybeSingle();
  return data ? desdeFila(data as FilaRetoActivo) : null;
}

export async function historialRetos(supabase: SupabaseClient, userId: string): Promise<RetoActivoRow[]> {
  const { data } = await supabase
    .from("reto_activo")
    .select("id, reto_slug, fecha_inicio, fecha_fin, estado, ciclo")
    .eq("user_id", userId)
    .order("fecha_inicio", { ascending: false });
  return (data ?? []).map((f) => desdeFila(f as FilaRetoActivo));
}

export async function iniciarReto(
  supabase: SupabaseClient,
  userId: string,
  retoSlug: string,
  duracionDias: number,
  ciclo = 1,
): Promise<RetoActivoRow | null> {
  const inicio = new Date();
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + duracionDias - 1);

  const { data, error } = await supabase
    .from("reto_activo")
    .insert({
      user_id: userId,
      reto_slug: retoSlug,
      fecha_inicio: isoFecha(inicio),
      fecha_fin: isoFecha(fin),
      estado: "activo",
      ciclo,
    })
    .select("id, reto_slug, fecha_inicio, fecha_fin, estado, ciclo")
    .single();

  if (error || !data) return null;
  return desdeFila(data as FilaRetoActivo);
}

export async function cerrarReto(supabase: SupabaseClient, retoActivoId: string, estado: EstadoRetoDb): Promise<boolean> {
  const { error } = await supabase.from("reto_activo").update({ estado }).eq("id", retoActivoId);
  return !error;
}

/** Cierra el ciclo actual como "extendido" y abre uno nuevo del mismo reto — así "Sigamos 7 días
 * más" queda registrado como continuidad, no como un reto distinto desde cero. */
export async function extenderReto(
  supabase: SupabaseClient,
  userId: string,
  retoActivoAnteriorId: string,
  retoSlug: string,
  duracionDias: number,
  cicloAnterior: number,
): Promise<RetoActivoRow | null> {
  await cerrarReto(supabase, retoActivoAnteriorId, "extendido");
  return iniciarReto(supabase, userId, retoSlug, duracionDias, cicloAnterior + 1);
}

export type CumplimientoReto = "lo_hice" | "parcial" | "no_lo_hice";

export async function registrarCumplimientoReto(
  supabase: SupabaseClient,
  userId: string,
  retoActivoId: string,
  fecha: string,
  cumplimiento: CumplimientoReto,
): Promise<boolean> {
  const { error } = await supabase.from("registros_reto").upsert(
    { user_id: userId, reto_activo_id: retoActivoId, fecha, cumplimiento },
    { onConflict: "reto_activo_id,fecha" },
  );
  return !error;
}

export async function obtenerRegistrosReto(
  supabase: SupabaseClient,
  retoActivoId: string,
): Promise<{ fecha: string; cumplimiento: CumplimientoReto }[]> {
  const { data } = await supabase
    .from("registros_reto")
    .select("fecha, cumplimiento")
    .eq("reto_activo_id", retoActivoId)
    .order("fecha", { ascending: true });
  return data ?? [];
}

/** Trae los check-ins diarios REALES (ya existentes) dentro del rango de fechas del reto — es lo
 * que alimenta la comparación "Tu cuerpo respondió", en vez de duplicar el registro de síntomas
 * dentro del reto. */
export async function obtenerCheckinsEnRango(
  supabase: SupabaseClient,
  userId: string,
  fechaInicio: string,
  fechaFin: string,
): Promise<Checkin[]> {
  const { data } = await supabase
    .from("checkins_diarios")
    .select("fecha, inflamacion, energia, sueno, estres, antojos, digestion, notas")
    .eq("user_id", userId)
    .gte("fecha", fechaInicio)
    .lte("fecha", fechaFin)
    .order("fecha", { ascending: true });
  return (data ?? []).map((c) => ({
    fecha: c.fecha,
    inflamacion: c.inflamacion,
    energia: c.energia,
    sueno: c.sueno,
    estres: c.estres,
    antojos: c.antojos,
    digestion: c.digestion,
    ...(c.notas ? { notas: c.notas } : {}),
  }));
}

export async function registrarMedida(
  supabase: SupabaseClient,
  userId: string,
  fecha: string,
  datos: { pesoKg?: number; cinturaCm?: number },
): Promise<boolean> {
  const { error } = await supabase.from("medidas").upsert(
    { user_id: userId, fecha, peso_kg: datos.pesoKg ?? null, cintura_cm: datos.cinturaCm ?? null },
    { onConflict: "user_id,fecha" },
  );
  return !error;
}

export async function obtenerMedidas(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ fecha: string; pesoKg: number | null; cinturaCm: number | null }[]> {
  const { data } = await supabase
    .from("medidas")
    .select("fecha, peso_kg, cintura_cm")
    .eq("user_id", userId)
    .order("fecha", { ascending: true });
  return (data ?? []).map((m) => ({ fecha: m.fecha, pesoKg: m.peso_kg, cinturaCm: m.cintura_cm }));
}

export type FlagsSalud = {
  diabetesGlucosa: boolean;
  condicionRenalCardiaca: boolean;
  historialTrastornoAlimenticio: boolean;
};

export async function obtenerFlagsSalud(
  supabase: SupabaseClient,
  userId: string,
): Promise<(FlagsSalud & { completado: boolean }) | null> {
  const { data } = await supabase
    .from("profiles")
    .select("diabetes_glucosa, condicion_renal_cardiaca, historial_trastorno_alimenticio, salud_cuestionario_completado")
    .eq("id", userId)
    .single();
  if (!data) return null;
  return {
    diabetesGlucosa: data.diabetes_glucosa,
    condicionRenalCardiaca: data.condicion_renal_cardiaca,
    historialTrastornoAlimenticio: data.historial_trastorno_alimenticio,
    completado: data.salud_cuestionario_completado,
  };
}

export async function guardarFlagsSalud(supabase: SupabaseClient, userId: string, flags: FlagsSalud): Promise<boolean> {
  const { error } = await supabase
    .from("profiles")
    .update({
      diabetes_glucosa: flags.diabetesGlucosa,
      condicion_renal_cardiaca: flags.condicionRenalCardiaca,
      historial_trastorno_alimenticio: flags.historialTrastornoAlimenticio,
      salud_cuestionario_completado: true,
    })
    .eq("id", userId);
  return !error;
}
