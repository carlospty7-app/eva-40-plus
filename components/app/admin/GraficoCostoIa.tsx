"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PuntoSerie } from "@/lib/supabase/admin-queries";

export function GraficoCostoIa({ datos }: { datos: PuntoSerie[] }) {
  const hayDatos = datos.some((p) => p.total > 0);

  return (
    <div className="rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">
        Gasto de IA — últimos 14 días
      </p>

      <div className="relative mt-3 h-[200px]">
        {!hayDatos && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-[12.5px] text-txt-tertiary">Todavía no hay llamadas a la IA registradas.</p>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datos} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border-default)" />
            <XAxis
              dataKey="etiqueta"
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={(v: number) => `US$${v}`}
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
              formatter={(value) => [`US$ ${Number(value).toFixed(4)}`, "costo"]}
            />
            <Bar dataKey="total" fill="var(--brand-primary)" radius={[5, 5, 0, 0]} maxBarSize={22} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
