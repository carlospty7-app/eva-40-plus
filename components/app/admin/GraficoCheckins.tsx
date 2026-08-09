"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PuntoSerie } from "@/lib/supabase/admin-queries";

export function GraficoCheckins({ porDia, porMes }: { porDia: PuntoSerie[]; porMes: PuntoSerie[] }) {
  const [vista, setVista] = useState<"dia" | "mes">("dia");
  const datos = vista === "dia" ? porDia : porMes;
  const hayDatos = datos.some((p) => p.total > 0);

  return (
    <div className="rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">
            Check-ins registrados
          </p>
          <p className="mt-0.5 text-[12px] text-txt-secondary">
            {vista === "dia" ? "Últimos 30 días" : "Últimos 12 meses"}
          </p>
        </div>
        <div className="flex rounded-full bg-surface-secondary p-0.5">
          <button
            type="button"
            onClick={() => setVista("dia")}
            className={`h-7 rounded-full px-3 text-[12px] font-medium transition-colors ${
              vista === "dia" ? "bg-surface-primary text-brand-primary shadow-sm" : "text-txt-tertiary"
            }`}
          >
            Por día
          </button>
          <button
            type="button"
            onClick={() => setVista("mes")}
            className={`h-7 rounded-full px-3 text-[12px] font-medium transition-colors ${
              vista === "mes" ? "bg-surface-primary text-brand-primary shadow-sm" : "text-txt-tertiary"
            }`}
          >
            Por mes
          </button>
        </div>
      </div>

      <div className="relative mt-3 h-[220px]">
        {!hayDatos && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-[12.5px] text-txt-tertiary">
              Todavía no hay check-ins para graficar — aparecerán aquí en cuanto haya actividad real.
            </p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-default)" />
            <XAxis
              dataKey="etiqueta"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              interval={vista === "dia" ? 3 : 0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              cursor={{ fill: "var(--brand-primary-soft)" }}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid var(--border-default)",
                fontSize: 12.5,
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "var(--text-primary)", fontWeight: 600 }}
              formatter={(value) => [`${value}`, "check-ins"]}
            />
            <Bar dataKey="total" fill="var(--brand-accent)" radius={[5, 5, 0, 0]} maxBarSize={vista === "dia" ? 14 : 28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
