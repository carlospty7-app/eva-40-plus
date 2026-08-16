"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import type { FlagsSalud } from "@/lib/supabase/retosQueries";

const PREGUNTAS: { campo: keyof FlagsSalud; texto: string }[] = [
  { campo: "diabetesGlucosa", texto: "¿Tienes diabetes o tomas medicación para la glucosa?" },
  { campo: "condicionRenalCardiaca", texto: "¿Tienes alguna condición renal o cardíaca?" },
  { campo: "historialTrastornoAlimenticio", texto: "¿Tienes historial de trastornos alimenticios?" },
];

/** Se muestra UNA vez, antes del primer reto — no es un examen médico, son 3 preguntas simples
 * para que EVA sepa cuándo advertir o ajustar un reto en vez de dárselo igual a todas. */
export function CuestionarioSalud({ onCompletar }: { onCompletar: (flags: FlagsSalud) => void }) {
  const [respuestas, setRespuestas] = useState<FlagsSalud>({
    diabetesGlucosa: false,
    condicionRenalCardiaca: false,
    historialTrastornoAlimenticio: false,
  });
  const [guardando, setGuardando] = useState(false);

  return (
    <div className="rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[14px] font-semibold text-txt-primary">Antes de tu primer reto</p>
          <p className="text-[12px] text-txt-secondary">3 preguntas rápidas, solo una vez.</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {PREGUNTAS.map((p) => (
          <div key={p.campo} className="flex items-center justify-between gap-3 rounded-xl bg-surface-secondary/50 p-3">
            <span className="text-[13px] text-txt-primary">{p.texto}</span>
            <div className="flex shrink-0 rounded-full bg-surface-tertiary/60 p-0.5">
              <button
                type="button"
                onClick={() => setRespuestas((r) => ({ ...r, [p.campo]: false }))}
                className={`h-7 rounded-full px-3 text-[12px] font-medium ${
                  !respuestas[p.campo] ? "bg-surface-primary text-brand-primary shadow-sm" : "text-txt-tertiary"
                }`}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => setRespuestas((r) => ({ ...r, [p.campo]: true }))}
                className={`h-7 rounded-full px-3 text-[12px] font-medium ${
                  respuestas[p.campo] ? "bg-surface-primary text-brand-primary shadow-sm" : "text-txt-tertiary"
                }`}
              >
                Sí
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-txt-tertiary">
        Esto no reemplaza a tu médico — solo ayuda a EVA a advertirte antes de un reto que no le
        conviene a tu situación.
      </p>

      <div className="mt-4">
        <TapButton
          disabled={guardando}
          onClick={async () => {
            setGuardando(true);
            await onCompletar(respuestas);
            setGuardando(false);
          }}
        >
          {guardando ? "Guardando…" : "Continuar"}
        </TapButton>
      </div>
    </div>
  );
}
