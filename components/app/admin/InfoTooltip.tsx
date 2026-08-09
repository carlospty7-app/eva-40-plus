"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

/** Ícono "i" que explica una métrica al tocarlo — pensado para un dueño no técnico que no sabe
 * qué es "churn" o "MRR" a simple vista. Toggle por click (no solo hover) para que funcione igual
 * en celular que en desktop. */
export function InfoTooltip({ texto }: { texto: string }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    function alClicFuera(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alClicFuera);
    return () => document.removeEventListener("mousedown", alClicFuera);
  }, [abierto]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label="Qué significa este dato"
        aria-expanded={abierto}
        className="flex h-4 w-4 items-center justify-center rounded-full text-txt-tertiary hover:text-txt-secondary"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {abierto && (
        <div
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-1.5 w-56 -translate-x-1/2 rounded-lg bg-surface-dark px-3 py-2.5 text-[11.5px] normal-case leading-relaxed tracking-normal text-txt-inverse shadow-lg"
        >
          {texto}
        </div>
      )}
    </div>
  );
}
