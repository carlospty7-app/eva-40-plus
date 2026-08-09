import type { SupabaseClient } from "@supabase/supabase-js";
import { generarRutaSemanaReal } from "@/lib/app/seed";
import { computeScoreDia } from "@/lib/app/engine";
import type { EstadoApp, Checkin, EstadoDia, PerfilUsuaria } from "@/lib/app/types";

type FilaPerfil = {
  id: string;
  nombre: string;
  email: string | null;
  foto_url: string | null;
  meta_label: string;
  dolor_label: string;
  plan: "anual" | "mensual";
  trial_activo: boolean;
  fecha_cobro: string;
  racha_dias: number;
};

type FilaCheckin = {
  fecha: string;
  inflamacion: number;
  energia: number;
  sueno: number;
  estres: number;
  antojos: number;
  digestion: number;
  notas: string | null;
};

function perfilDesdeFila(fila: FilaPerfil): PerfilUsuaria {
  return {
    nombre: fila.nombre,
    email: fila.email ?? undefined,
    fotoUrl: fila.foto_url ?? undefined,
    metaLabel: fila.meta_label,
    dolorLabel: fila.dolor_label,
    plan: fila.plan,
    trialActivo: fila.trial_activo,
    fechaCobro: fila.fecha_cobro,
  };
}

function checkinDesdeFila(fila: FilaCheckin): Checkin {
  return {
    fecha: fila.fecha,
    inflamacion: fila.inflamacion,
    energia: fila.energia,
    sueno: fila.sueno,
    estres: fila.estres,
    antojos: fila.antojos,
    digestion: fila.digestion,
    ...(fila.notas ? { notas: fila.notas } : {}),
  };
}

export async function obtenerPerfil(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ perfil: PerfilUsuaria; rachaDias: number } | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return null;
  const fila = data as FilaPerfil;
  return { perfil: perfilDesdeFila(fila), rachaDias: fila.racha_dias };
}

export async function actualizarPerfil(
  supabase: SupabaseClient,
  userId: string,
  cambios: Partial<{ nombre: string; fotoUrl: string; email: string; metaLabel: string; dolorLabel: string }>,
) {
  const columnas: Record<string, string> = {};
  if (cambios.nombre !== undefined) columnas.nombre = cambios.nombre;
  if (cambios.fotoUrl !== undefined) columnas.foto_url = cambios.fotoUrl;
  if (cambios.email !== undefined) columnas.email = cambios.email;
  if (cambios.metaLabel !== undefined) columnas.meta_label = cambios.metaLabel;
  if (cambios.dolorLabel !== undefined) columnas.dolor_label = cambios.dolorLabel;
  const { error } = await supabase.from("profiles").update(columnas).eq("id", userId);
  return !error;
}

export async function obtenerCheckins(supabase: SupabaseClient, userId: string): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from("checkins_diarios")
    .select("fecha, inflamacion, energia, sueno, estres, antojos, digestion, notas")
    .eq("user_id", userId)
    .order("fecha", { ascending: true });
  if (error || !data) return [];
  return (data as FilaCheckin[]).map(checkinDesdeFila);
}

/** Registra (o edita) el check-in de hoy y devuelve la racha ya recalculada — mismo criterio que
 * la versión local: si AYER no tiene check-in, la racha se reinicia a 1 en vez de seguir sumando. */
export async function registrarCheckinHoy(
  supabase: SupabaseClient,
  userId: string,
  hoy: string,
  valores: EstadoDia,
  notas?: string,
): Promise<{ ok: boolean; rachaDias: number }> {
  const { data: existente } = await supabase
    .from("checkins_diarios")
    .select("fecha")
    .eq("user_id", userId)
    .eq("fecha", hoy)
    .maybeSingle();

  let rachaDias: number;
  if (existente) {
    const { data: perfilActual } = await supabase
      .from("profiles")
      .select("racha_dias")
      .eq("id", userId)
      .single();
    rachaDias = (perfilActual as { racha_dias: number } | null)?.racha_dias ?? 1;
  } else {
    const ayer = new Date(new Date(hoy).getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const { data: checkinAyer } = await supabase
      .from("checkins_diarios")
      .select("fecha")
      .eq("user_id", userId)
      .eq("fecha", ayer)
      .maybeSingle();
    const { data: perfilActual } = await supabase
      .from("profiles")
      .select("racha_dias")
      .eq("id", userId)
      .single();
    const rachaPrevia = (perfilActual as { racha_dias: number } | null)?.racha_dias ?? 0;
    rachaDias = checkinAyer ? rachaPrevia + 1 : 1;
  }

  const { error: errorCheckin } = await supabase.from("checkins_diarios").upsert(
    {
      user_id: userId,
      fecha: hoy,
      inflamacion: valores.inflamacion,
      energia: valores.energia,
      sueno: valores.sueno,
      estres: valores.estres,
      antojos: valores.antojos,
      digestion: valores.digestion,
      notas: notas?.trim() || null,
    },
    { onConflict: "user_id,fecha" },
  );

  const { error: errorPerfil } = await supabase
    .from("profiles")
    .update({ racha_dias: rachaDias })
    .eq("id", userId);

  return { ok: !errorCheckin && !errorPerfil, rachaDias };
}

/** Arma el `EstadoApp` completo (mismo shape que usaba localStorage) a partir de datos reales de
 * Supabase — perfil y checkins de la base, ruta semanal generada del lado del cliente (contenido
 * determinístico por día) con `completado` marcado según checkins reales. */
export async function cargarEstadoSupabase(supabase: SupabaseClient, userId: string): Promise<EstadoApp | null> {
  const [perfilResult, checkins] = await Promise.all([
    obtenerPerfil(supabase, userId),
    obtenerCheckins(supabase, userId),
  ]);
  if (!perfilResult) return null;

  return {
    perfil: perfilResult.perfil,
    rutaSemana: generarRutaSemanaReal(checkins),
    checkins,
    scoreHistorial: checkins.map((c) => ({ fecha: c.fecha, score: computeScoreDia(c) })),
    rachaDias: perfilResult.rachaDias,
  };
}
