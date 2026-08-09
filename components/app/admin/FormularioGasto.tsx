"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TapButton } from "@/components/app/onboarding/TapButton";

const HOY = new Date().toISOString().slice(0, 10);
const HACE_30_DIAS = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

export function FormularioGasto() {
  const router = useRouter();
  const [channel, setChannel] = useState("");
  const [amountUsd, setAmountUsd] = useState("");
  const [periodStart, setPeriodStart] = useState(HACE_30_DIAS);
  const [periodEnd, setPeriodEnd] = useState(HOY);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    setGuardando(true);
    const res = await fetch("/api/admin/gasto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, amountUsd: Number(amountUsd), periodStart, periodEnd }),
    });
    setGuardando(false);
    if (!res.ok) {
      setError("No se pudo guardar — revisa los datos e intenta de nuevo.");
      return;
    }
    setChannel("");
    setAmountUsd("");
    router.refresh();
  }

  return (
    <div className="rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <p className="text-[13px] font-semibold text-txt-primary">Registrar gasto en adquisición</p>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          placeholder="Canal (ej: Meta Ads)"
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
        />
        <input
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
          type="number"
          min="0"
          step="0.01"
          placeholder="Monto USD"
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
        />
        <input
          value={periodStart}
          onChange={(e) => setPeriodStart(e.target.value)}
          type="date"
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none"
        />
        <input
          value={periodEnd}
          onChange={(e) => setPeriodEnd(e.target.value)}
          type="date"
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none"
        />
      </div>
      {error && <p className="mt-2 text-[12.5px] text-status-error">{error}</p>}
      <div className="mt-3">
        <TapButton disabled={!channel || !amountUsd || guardando} onClick={guardar}>
          {guardando ? "Guardando…" : "Guardar gasto"}
        </TapButton>
      </div>
    </div>
  );
}
