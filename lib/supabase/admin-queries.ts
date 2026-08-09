import { crearClienteAdmin } from "@/lib/supabase/admin";

export type UsuarioAdmin = {
  id: string;
  nombre: string;
  email: string | null;
  plan: "anual" | "mensual";
  trialActivo: boolean;
  fechaCobro: string;
  rachaDias: number;
  createdAt: string;
  ultimoCheckin: string | null;
};

export type ErrorReciente = {
  id: string;
  message: string;
  context: string;
  createdAt: string;
};

export type PuntoSerie = { etiqueta: string; total: number };

export type PanelAdminData = {
  usuarios: UsuarioAdmin[];
  totalUsuarios: number;
  nuevasEstaSemana: number;
  enTrial: number;
  trialVencido: number;
  planAnual: number;
  planMensual: number;
  activasHoy: number;
  activasSemana: number;
  activasMes: number;
  usuariasConAlgunCheckin: number;
  totalCheckins: number;
  checkinsUltimos7Dias: number;
  checkinsPorDia: PuntoSerie[];
  checkinsPorMes: PuntoSerie[];
  erroresRecientes: ErrorReciente[];
  erroresPorContexto: { context: string; total: number }[];
  erroresUltimas24h: number;
};

const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES_CORTOS = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];

/** Serie de los últimos 30 días — incluye los días sin check-ins en 0, para que la gráfica no
 * "salte" fechas y se vea el hueco real. */
function agruparPorDia(checkins: { fecha: string }[]): PuntoSerie[] {
  const conteo = new Map<string, number>();
  for (const c of checkins) conteo.set(c.fecha, (conteo.get(c.fecha) ?? 0) + 1);

  const puntos: PuntoSerie[] = [];
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const iso = fecha.toISOString().slice(0, 10);
    const dia = fecha.getDate();
    puntos.push({ etiqueta: `${DIAS_CORTOS[fecha.getDay()]} ${dia}`, total: conteo.get(iso) ?? 0 });
  }
  return puntos;
}

/** Serie de los últimos 12 meses — mismo criterio, meses sin actividad se muestran en 0. */
function agruparPorMes(checkins: { fecha: string }[]): PuntoSerie[] {
  const conteo = new Map<string, number>();
  for (const c of checkins) {
    const clave = c.fecha.slice(0, 7); // yyyy-mm
    conteo.set(clave, (conteo.get(clave) ?? 0) + 1);
  }

  const puntos: PuntoSerie[] = [];
  const ahora = new Date();
  for (let i = 11; i >= 0; i--) {
    const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
    const clave = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`;
    puntos.push({ etiqueta: MESES_CORTOS[fecha.getMonth()], total: conteo.get(clave) ?? 0 });
  }
  return puntos;
}

function haceNDias(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

/** Reúne todo lo que el panel de admin necesita en una sola pasada — usa el cliente de servicio
 * (salta RLS) porque ya está gateado por el guard de /admin en proxy.ts. Todo lo que no tiene
 * fuente de datos real todavía (ventas de Hotmart, costo de IA) se marca como "no medido" en la
 * UI en vez de inventarse aquí. */
export async function obtenerDatosPanelAdmin(): Promise<PanelAdminData> {
  const supabase = crearClienteAdmin();

  const [{ data: perfiles }, { data: checkins }, { data: errores }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, nombre, email, plan, trial_activo, fecha_cobro, racha_dias, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("checkins_diarios").select("user_id, fecha").order("fecha", { ascending: false }),
    supabase
      .from("error_log")
      .select("id, message, context, created_at")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const filasPerfiles = perfiles ?? [];
  const filasCheckins = checkins ?? [];
  const filasErrores = errores ?? [];

  const ultimoCheckinPorUsuario = new Map<string, string>();
  for (const c of filasCheckins) {
    if (!ultimoCheckinPorUsuario.has(c.user_id)) ultimoCheckinPorUsuario.set(c.user_id, c.fecha);
  }

  const usuarios: UsuarioAdmin[] = filasPerfiles.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    email: p.email,
    plan: p.plan,
    trialActivo: p.trial_activo,
    fechaCobro: p.fecha_cobro,
    rachaDias: p.racha_dias,
    createdAt: p.created_at,
    ultimoCheckin: ultimoCheckinPorUsuario.get(p.id) ?? null,
  }));

  const hoy = new Date().toISOString().slice(0, 10);
  const hace7 = haceNDias(7).slice(0, 10);
  const hace30 = haceNDias(30).slice(0, 10);

  const usuariosActivos = (desde: string) =>
    new Set(filasCheckins.filter((c) => c.fecha >= desde).map((c) => c.user_id)).size;

  const erroresPorContextoMap = new Map<string, number>();
  for (const e of filasErrores) {
    erroresPorContextoMap.set(e.context, (erroresPorContextoMap.get(e.context) ?? 0) + 1);
  }

  return {
    usuarios,
    totalUsuarios: filasPerfiles.length,
    nuevasEstaSemana: filasPerfiles.filter((p) => p.created_at >= haceNDias(7)).length,
    enTrial: filasPerfiles.filter((p) => p.trial_activo).length,
    trialVencido: filasPerfiles.filter((p) => !p.trial_activo).length,
    planAnual: filasPerfiles.filter((p) => p.plan === "anual").length,
    planMensual: filasPerfiles.filter((p) => p.plan === "mensual").length,
    activasHoy: usuariosActivos(hoy),
    activasSemana: usuariosActivos(hace7),
    activasMes: usuariosActivos(hace30),
    usuariasConAlgunCheckin: new Set(filasCheckins.map((c) => c.user_id)).size,
    totalCheckins: filasCheckins.length,
    checkinsUltimos7Dias: filasCheckins.filter((c) => c.fecha >= hace7).length,
    checkinsPorDia: agruparPorDia(filasCheckins),
    checkinsPorMes: agruparPorMes(filasCheckins),
    erroresRecientes: filasErrores.slice(0, 10).map((e) => ({
      id: e.id,
      message: e.message,
      context: e.context,
      createdAt: e.created_at,
    })),
    erroresPorContexto: Array.from(erroresPorContextoMap.entries())
      .map(([context, total]) => ({ context, total }))
      .sort((a, b) => b.total - a.total),
    erroresUltimas24h: filasErrores.filter((e) => e.created_at >= haceNDias(1)).length,
  };
}
