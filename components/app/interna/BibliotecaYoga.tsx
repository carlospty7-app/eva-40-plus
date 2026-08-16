"use client";

import { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import { BASE_VIDEOS_YOGA, BIBLIOTECA_YOGA } from "@/lib/app/seed";

/** Videos reales de yoga de Maru que no están atados a un día fijo — para que la usuaria tenga
 * algo con qué variar cuando quiera, no solo la rutina del día. Colapsados por defecto: cada uno
 * se reproduce solo si ella lo pide. */
export function BibliotecaYoga() {
  const [abierto, setAbierto] = useState<string | null>(null);

  return (
    <div className="mt-4 rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md">
      <p className="text-[12.5px] font-semibold text-txt-primary">Más videos de yoga con Maru</p>
      <p className="mt-0.5 text-[11.5px] text-txt-tertiary">
        Para cuando quieras variar, además de la rutina del día.
      </p>

      <div className="mt-3 space-y-2">
        {BIBLIOTECA_YOGA.map((v) => {
          const url = `${BASE_VIDEOS_YOGA}${v.archivo}`;
          const estaAbierto = abierto === v.archivo;
          return (
            <div key={v.archivo} className="rounded-xl bg-surface-secondary/50 p-2.5">
              <button
                type="button"
                onClick={() => setAbierto(estaAbierto ? null : v.archivo)}
                className="flex w-full items-center justify-between"
              >
                <span className="flex items-center gap-2 text-[13px] font-medium text-txt-primary">
                  {estaAbierto ? (
                    <X className="h-4 w-4 shrink-0 text-txt-tertiary" />
                  ) : (
                    <PlayCircle className="h-4 w-4 shrink-0 text-brand-primary" />
                  )}
                  {v.titulo}
                </span>
                <span className="text-[11.5px] text-txt-tertiary">{v.duracion}</span>
              </button>
              {estaAbierto && (
                <video controls playsInline preload="metadata" className="mt-2.5 w-full rounded-lg bg-surface-tertiary">
                  <source src={url} type="video/mp4" />
                </video>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
