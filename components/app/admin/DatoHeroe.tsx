import type { ReactNode } from "react";

export function DatoHeroe({
  label,
  valor,
  insight,
  tono = "neutral",
}: {
  label: string;
  valor: ReactNode;
  insight?: string;
  tono?: "neutral" | "bien" | "atencion";
}) {
  const colorValor =
    tono === "bien" ? "text-status-success" : tono === "atencion" ? "text-status-warning" : "text-txt-primary";

  return (
    <div className="rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">{label}</p>
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
