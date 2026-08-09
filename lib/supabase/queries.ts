import type { SupabaseClient } from "@supabase/supabase-js";
import { generarRutaSemanaReal } from "@/lib/app/seed";
import { computeScoreDia } from "@/lib/app/engine";
import type { EstadoApp, Checkin, EstadoDia, PerfilUsuaria, RegistroCiclo, SintomaCicloId } from "@/lib/app/types";

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

/** Sube una foto de perfil al bucket público `avatars` (carpeta = user id, así RLS de Storage
 * puede verificar dueño) y devuelve su URL pública — reemplaza guardar la imagen como base64
 * directo en la fila del perfil. */
export async function subirFotoPerfil(
  supabase: SupabaseClient,
  userId: string,
  archivo: File,
): Promise<string | null> {
  const extension = archivo.name.split(".").pop() || "jpg";
  const ruta = `${userId}/foto.${extension}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(ruta, archivo, { upsert: true, cacheControl: "3600" });
  if (error) return null;
  const { data } = supabase.storage.from("avatars").getPublicUrl(ruta);
  // Cache-bust: sin esto, una foto nueva con el mismo nombre de archivo sigue mostrando la vieja
  // porque el navegador (o un CDN) cachea la URL pública tal cual.
  return `${data.publicUrl}?v=${Date.now()}`;
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

  // Alimenta `event_log` con la acción principal de la app — el backoffice la usa para medir
  // activación y uso (Sección "Uso" de /admin) sin depender de una herramienta externa.
  if (!errorCheckin) {
    await supabase.from("event_log").insert({
      tipo: existente ? "checkin_editado" : "checkin_creado",
      user_id: userId,
      metadata: { racha_dias: rachaDias },
    });
  }

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

type FilaCiclo = {
  fecha: string;
  sangrado: boolean;
  intensidad: 1 | 2 | 3 | null;
  sintomas: string[];
  notas: string | null;
};

function registroCicloDesdeFila(fila: FilaCiclo): RegistroCiclo {
  return {
    fecha: fila.fecha,
    sangrado: fila.sangrado,
    ...(fila.intensidad ? { intensidad: fila.intensidad } : {}),
    sintomas: fila.sintomas as SintomaCicloId[],
    ...(fila.notas ? { notas: fila.notas } : {}),
  };
}

/** Registro libre del ciclo — sin tabla separada por "período", cada día es su propia fila (igual
 * que el check-in diario), así no hace falta ningún cálculo de fecha de inicio/fin. */
export async function obtenerRegistrosCiclo(supabase: SupabaseClient, userId: string): Promise<RegistroCiclo[]> {
  const { data, error } = await supabase
    .from("registros_ciclo")
    .select("fecha, sangrado, intensidad, sintomas, notas")
    .eq("user_id", userId)
    .order("fecha", { ascending: true });
  if (error || !data) return [];
  return (data as FilaCiclo[]).map(registroCicloDesdeFila);
}

export async function registrarCiclo(
  supabase: SupabaseClient,
  userId: string,
  fecha: string,
  datos: { sangrado: boolean; intensidad?: 1 | 2 | 3; sintomas: SintomaCicloId[]; notas?: string },
): Promise<boolean> {
  const { error } = await supabase.from("registros_ciclo").upsert(
    {
      user_id: userId,
      fecha,
      sangrado: datos.sangrado,
      intensidad: datos.sangrado ? (datos.intensidad ?? null) : null,
      sintomas: datos.sintomas,
      notas: datos.notas?.trim() || null,
    },
    { onConflict: "user_id,fecha" },
  );
  return !error;
}
