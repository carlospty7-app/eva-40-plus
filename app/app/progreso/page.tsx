"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";
import { Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { TopHeader } from "@/components/app/interna/TopHeader";
import { ScoreRing } from "@/components/app/ui/ScoreRing";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { computeScoreDia, insightsAutomaticos, labelCampo, recomendacionParaCheckin } from "@/lib/app/engine";
import { formatoCorto } from "@/lib/app/dates";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cargarEstadoSupabase } from "@/lib/supabase/queries";
import type { EstadoApp } from "@/lib/app/types";

/** Punto del gráfico: el último día (hoy) se destaca más grande con un halo, el resto son
 * puntos pequeños con contorno — para que se lea como datos reales, no solo una curva abstracta. */
function PuntoDelDia(props: unknown, esUltimo: boolean) {
  const { cx, cy, index } = props as { cx: number; cy: number; index: number };
  if (esUltimo) {
    return (
      <g key={`punto-${index}`}>
        <circle cx={cx} cy={cy} r={8} fill="var(--brand-accent)" fillOpacity={0.18} />
        <circle cx={cx} cy={cy} r={4} fill="var(--brand-accent)" stroke="var(--surface-primary)" strokeWidth={2} />
      </g>
    );
  }
  return (
    <circle
      key={`punto-${index}`}
      cx={cx}
      cy={cy}
      r={2.5}
      fill="var(--surface-primary)"
      stroke="var(--brand-accent)"
      strokeWidth={1.5}
    />
  );
}

export default function ProgresoPage() {
  const [estado, setEstado] = useState<EstadoApp | null>(null);

  useEffect(() => {
    const supabase = crearClienteNavegador();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const cargado = await cargarEstadoSupabase(supabase, data.user.id);
      if (cargado) setEstado(cargado);
    });
  }, []);

  const chartData = useMemo(() => {
    if (!estado) return [];
    return estado.scoreHistorial.map((p) => ({
      fecha: formatoCorto(new Date(p.fecha)),
      score: p.score,
    }));
  }, [estado]);

  const insights = useMemo(() => (estado ? insightsAutomaticos(estado.checkins) : []), [estado]);
  const promedio = useMemo(() => {
    if (chartData.length === 0) return 0;
    return Math.round(chartData.reduce((acc, p) => acc + p.score, 0) / chartData.length);
  }, [chartData]);

  if (!estado) {
    return (
      <div className="relative min-h-dvh">
        <TopHeader titulo="Progreso" />
        <div className="mt-6 space-y-3 px-4">
          <div className="h-40 animate-pulse rounded-xl bg-surface-tertiary/50" />
          <div className="h-32 animate-pulse rounded-xl bg-surface-tertiary/50" />
        </div>
      </div>
    );
  }

  const scoreActual = estado.scoreHistorial.at(-1)?.score ?? 60;
  const scoreHaceUnaSemana = estado.scoreHistorial.at(-8)?.score;
  const delta = scoreHaceUnaSemana != null ? scoreActual - scoreHaceUnaSemana : null;

  const historialReciente = [...estado.checkins].reverse().slice(0, 6);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <TopHeader titulo="Progreso" />

      <div className="relative mt-2 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[19px] font-medium leading-[1.2] text-txt-primary"
        >
          Cómo va tu cuerpo
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-5 flex items-center gap-5 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm"
        >
          <ScoreRing value={scoreActual} size={92} thickness={10} color="accent" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
              Score Metabólico 40+
            </p>
            {delta != null && (
              <p
                className={`mt-1 flex items-center gap-1 text-[13px] font-medium ${
                  delta >= 0 ? "text-status-success" : "text-status-warning"
                }`}
              >
                {delta >= 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {delta >= 0 ? "+" : ""}
                {delta} pts vs. hace 7 días
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mt-4 overflow-hidden rounded-xl border border-border-default/60 bg-surface-primary p-3 pr-1 shadow-sm"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-brand-accent/10 blur-3xl"
          />
          <div className="relative flex items-center justify-between px-1">
            <p className="text-[11px] text-txt-tertiary">Últimos {chartData.length} días</p>
            <p className="flex items-center gap-1.5 text-[11px] text-txt-tertiary">
              <span className="h-1.5 w-4 rounded-full border border-dashed border-border-strong" />
              Promedio {promedio}
            </p>
          </div>
          <div className="relative h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-accent)" stopOpacity={0.38} />
                    <stop offset="55%" stopColor="var(--brand-accent)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="var(--brand-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.max(0, Math.ceil(chartData.length / 4) - 1)}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "var(--text-tertiary)" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                  domain={[30, 100]}
                  ticks={[30, 100]}
                />
                <ReferenceLine y={promedio} stroke="var(--border-strong)" strokeDasharray="4 4" />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 12,
                    border: "1px solid var(--border-default)",
                    background: "var(--surface-primary)",
                  }}
                  labelStyle={{ color: "var(--text-tertiary)" }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="var(--brand-accent)"
                  strokeWidth={2.75}
                  fill="url(#scoreFill)"
                  dot={(props: unknown) => PuntoDelDia(props, (props as { index: number }).index === chartData.length - 1)}
                  activeDot={{ r: 5, fill: "var(--brand-accent)", stroke: "var(--surface-primary)", strokeWidth: 2 }}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4 space-y-2"
          >
            {insights.map((texto) => (
              <div
                key={texto}
                className="flex items-start gap-2.5 rounded-xl bg-brand-primary-soft p-3.5"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <p className="text-[13px] leading-relaxed text-txt-primary">{texto}</p>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
            Historial de tus revisiones
          </p>
          <ul className="mt-2 divide-y divide-border-default/60">
            {historialReciente.map((c) => {
              const rec = recomendacionParaCheckin(c);
              return (
                <li key={c.fecha} className="flex items-center justify-between py-2.5">
                  <span className="text-[13px] text-txt-secondary">{formatoCorto(new Date(c.fecha))}</span>
                  <span className="flex items-center gap-2 text-[12.5px] text-txt-tertiary">
                    <span className="font-semibold text-txt-primary">{computeScoreDia(c)}</span>
                    · {labelCampo(rec.campoClave)}
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
