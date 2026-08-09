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
  activo: boolean;
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

  // Negocio (LTV/CAC) — quedan en null hasta que haya ingresos reales de Hotmart; el gasto por
  // canal sí es real desde que el dueño lo carga a mano (no viene de ningún webhook).
  gastoAdquisicionTotal: number;
  gastoPorCanal: GastoCanal[];

  // Costo de IA — real desde la primera llamada a /api/eva (se loguea en `ai_calls`).
  costoIaEsteMes: number;
  llamadasIaEsteMes: number;
  costoIaPorUsuarioActivo: number | null;
  costoIaPorModelo: { model: string; llamadas: number; costoUsd: number }[];
  costoIaUltimos14Dias: PuntoSerie[];

  // Churn — real desde que existe el interruptor activar/desactivar de la pestaña Usuarios (no
  // depende de Hotmart). null si todavía no hay base sobre la que medirlo (nadie existía antes
  // de este mes).
  bajasEsteMes: number;
  churnEsteMesPct: number | null;
};

export type GastoCanal = {
  id: string;
  channel: string;
  amountUsd: number;
  periodStart: string;
  periodEnd: string;
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

/** Serie de costo de IA de los últimos N días (por fecha de creación de la llamada, no de fecha de
 * check-in) — mismo criterio de "incluir los días en 0" que las otras series. */
function agruparCostoPorDia(llamadas: { created_at: string; costo_usd: number }[], dias: number): PuntoSerie[] {
  const conteo = new Map<string, number>();
  for (const l of llamadas) {
    const iso = l.created_at.slice(0, 10);
    conteo.set(iso, (conteo.get(iso) ?? 0) + l.costo_usd);
  }

  const puntos: PuntoSerie[] = [];
  for (let i = dias - 1; i >= 0; i--) {
    const fecha = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const iso = fecha.toISOString().slice(0, 10);
    puntos.push({
      etiqueta: `${DIAS_CORTOS[fecha.getDay()]} ${fecha.getDate()}`,
      total: Math.round((conteo.get(iso) ?? 0) * 10000) / 10000,
    });
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

  const [{ data: perfiles }, { data: checkins }, { data: errores }, { data: gastos }, { data: llamadasIa }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, nombre, email, plan, trial_activo, fecha_cobro, racha_dias, created_at, activo, desactivado_en")
        .order("created_at", { ascending: false }),
      supabase.from("checkins_diarios").select("user_id, fecha").order("fecha", { ascending: false }),
      supabase
        .from("error_log")
        .select("id, message, context, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("acquisition_spend").select("id, channel, amount_usd, period_start, period_end").order("period_start", { ascending: false }),
      supabase.from("ai_calls").select("model, input_tokens, output_tokens, costo_usd, created_at").order("created_at", { ascending: false }),
    ]);

  const filasPerfiles = perfiles ?? [];
  const filasCheckins = checkins ?? [];
  const filasErrores = errores ?? [];
  const filasGastos = gastos ?? [];
  const filasIa = llamadasIa ?? [];

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
    activo: p.activo,
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

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const llamadasEsteMes = filasIa.filter((l) => l.created_at >= inicioMes);
  const costoIaEsteMes = llamadasEsteMes.reduce((suma, l) => suma + l.costo_usd, 0);
  const activasMes = usuariosActivos(hace30);

  const costoPorModeloMap = new Map<string, { llamadas: number; costoUsd: number }>();
  for (const l of llamadasEsteMes) {
    const actual = costoPorModeloMap.get(l.model) ?? { llamadas: 0, costoUsd: 0 };
    costoPorModeloMap.set(l.model, { llamadas: actual.llamadas + 1, costoUsd: actual.costoUsd + l.costo_usd });
  }

  // Churn = cuentas que desactivaste este mes ÷ cuentas que ya existían al empezar el mes. Se
  // apoya en `desactivado_en` (real desde el interruptor de Usuarios), no en pagos de Hotmart —
  // por eso es "desactivación de cuenta", no necesariamente "cancelación de pago".
  const bajasEsteMes = filasPerfiles.filter((p) => p.desactivado_en && p.desactivado_en >= inicioMes).length;
  const baseChurn = filasPerfiles.filter((p) => p.created_at < inicioMes).length;

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
    activasMes,
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

    gastoAdquisicionTotal: filasGastos.reduce((suma, g) => suma + g.amount_usd, 0),
    gastoPorCanal: filasGastos.map((g) => ({
      id: g.id,
      channel: g.channel,
      amountUsd: g.amount_usd,
      periodStart: g.period_start,
      periodEnd: g.period_end,
    })),

    costoIaEsteMes,
    llamadasIaEsteMes: llamadasEsteMes.length,
    costoIaPorUsuarioActivo: activasMes > 0 ? costoIaEsteMes / activasMes : null,
    costoIaPorModelo: Array.from(costoPorModeloMap.entries())
      .map(([model, v]) => ({ model, llamadas: v.llamadas, costoUsd: v.costoUsd }))
      .sort((a, b) => b.costoUsd - a.costoUsd),
    costoIaUltimos14Dias: agruparCostoPorDia(filasIa, 14),

    bajasEsteMes,
    churnEsteMesPct: baseChurn > 0 ? (bajasEsteMes / baseChurn) * 100 : null,
  };
}
