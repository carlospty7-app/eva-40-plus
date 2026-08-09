"use client";

import { useState } from "react";
import { Droplet } from "lucide-react";
import { SINTOMAS_CICLO } from "@/lib/app/types";
import type { RegistroCiclo, SintomaCicloId } from "@/lib/app/types";
import { isoFecha } from "@/lib/app/dates";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { registrarCiclo } from "@/lib/supabase/queries";

const INTENSIDADES: { valor: 1 | 2 | 3; label: string }[] = [
  { valor: 1, label: "Ligero" },
  { valor: 2, label: "Medio" },
  { valor: 3, label: "Abundante" },
];

/** Registro libre del ciclo — a propósito NO es un calendario ni pide predecir nada, porque a los
 * 40+ la irregularidad por perimenopausia es normal. Solo pregunta qué nota HOY. Opcional siempre:
 * vive colapsado hasta que la usuaria decide abrirlo. */
export function RegistroCicloCard({
  userId,
  registroHoy,
  onGuardado,
}: {
  userId: string;
  registroHoy: RegistroCiclo | null;
  onGuardado: () => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const [sangrado, setSangrado] = useState(registroHoy?.sangrado ?? false);
  const [intensidad, setIntensidad] = useState<1 | 2 | 3>(registroHoy?.intensidad ?? 2);
  const [sintomas, setSintomas] = useState<SintomaCicloId[]>(registroHoy?.sintomas ?? []);
  const [guardando, setGuardando] = useState(false);

  function alternarSintoma(id: SintomaCicloId) {
    setSintomas((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function guardar() {
    setGuardando(true);
    const supabase = crearClienteNavegador();
    await registrarCiclo(supabase, userId, isoFecha(new Date()), {
      sangrado,
      intensidad: sangrado ? intensidad : undefined,
      sintomas,
    });
    setGuardando(false);
    setAbierto(false);
    onGuardado();
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-dashed border-border-strong bg-surface-secondary/40 p-4 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
            <Droplet className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[13px] font-medium text-txt-primary">
              {registroHoy ? "Ya registraste tu ciclo hoy" : "Registra tu ciclo (opcional)"}
            </p>
            <p className="text-[11.5px] text-txt-tertiary">Sin calendario, sin predicciones — solo lo que notas hoy.</p>
          </div>
        </div>
        <span className="shrink-0 text-[12px] font-semibold text-brand-primary">
          {registroHoy ? "Editar" : "Registrar"}
        </span>
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <p className="text-[13px] font-semibold text-txt-primary">¿Cómo está tu ciclo hoy?</p>

      <button
        type="button"
        onClick={() => setSangrado((v) => !v)}
        className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full text-[13.5px] font-medium ${
          sangrado ? "bg-brand-accent text-txt-inverse" : "border border-border-default text-txt-secondary"
        }`}
      >
        <Droplet className="h-4 w-4" />
        {sangrado ? "Hoy tienes sangrado" : "¿Hoy tienes sangrado?"}
      </button>

      {sangrado && (
        <div className="mt-2.5 flex gap-2">
          {INTENSIDADES.map((o) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => setIntensidad(o.valor)}
              className={`h-9 flex-1 rounded-full text-[12.5px] font-medium ${
                intensidad === o.valor
                  ? "bg-brand-primary text-txt-inverse"
                  : "border border-border-default text-txt-secondary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 text-[12px] font-medium text-txt-secondary">¿Notas algo más hoy? (opcional)</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {SINTOMAS_CICLO.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => alternarSintoma(s.id)}
            className={`h-8 rounded-full px-3 text-[12px] font-medium ${
              sintomas.includes(s.id)
                ? "bg-brand-secondary/20 text-brand-secondary"
                : "border border-border-default text-txt-tertiary"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="h-10 flex-1 rounded-full border border-border-strong text-[13px] font-medium text-txt-secondary"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          className="h-10 flex-[2] rounded-full bg-brand-primary text-[13px] font-semibold text-txt-inverse disabled:opacity-60"
        >
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </div>
  );
}
