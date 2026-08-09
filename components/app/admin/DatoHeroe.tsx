import type { ComponentType, ReactNode } from "react";
import { InfoTooltip } from "@/components/app/admin/InfoTooltip";

const COLORES = {
  teal: { chip: "bg-brand-primary-soft text-brand-primary", barra: "bg-brand-primary" },
  sage: { chip: "bg-brand-secondary/15 text-brand-secondary", barra: "bg-brand-secondary" },
  gold: { chip: "bg-brand-gold/20 text-[#8a6d1f]", barra: "bg-brand-gold" },
  coral: { chip: "bg-brand-accent-soft text-brand-accent", barra: "bg-brand-accent" },
  neutral: { chip: "bg-surface-tertiary text-txt-secondary", barra: "bg-border-strong" },
} as const;

export function DatoHeroe({
  label,
  valor,
  insight,
  info,
  tono = "neutral",
  color = "neutral",
  icon: Icon,
}: {
  label: string;
  valor: ReactNode;
  insight?: string;
  info?: string;
  tono?: "neutral" | "bien" | "atencion";
  color?: keyof typeof COLORES;
  icon?: ComponentType<{ className?: string }>;
}) {
  const colorValor =
    tono === "bien" ? "text-status-success" : tono === "atencion" ? "text-status-warning" : "text-txt-primary";
  const paleta = COLORES[color];

  return (
    <div className="relative rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <span className={`absolute inset-x-0 top-0 h-[3px] rounded-t-xl ${paleta.barra}`} aria-hidden />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">
          {label}
          {info && <InfoTooltip texto={info} />}
        </div>
        {Icon && (
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${paleta.chip}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      <p className={`mt-1.5 font-display text-[28px] font-semibold leading-none ${colorValor}`}>{valor}</p>
      {insight && <p className="mt-1.5 text-[12px] text-txt-secondary">{insight}</p>}
    </div>
  );
}

export function NoMedido({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface-secondary/40 p-3.5 text-[12.5px] text-txt-tertiary">
      {children}
    </div>
  );
}
