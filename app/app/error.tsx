"use client";

import { AlertTriangle } from "lucide-react";

export default function ErrorAppInterna({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-error-soft text-status-error">
        <AlertTriangle className="h-5 w-5" />
      </span>
      <div>
        <p className="font-display text-[18px] font-medium text-txt-primary">
          Algo no cargó bien
        </p>
        <p className="mt-1.5 text-[13.5px] text-txt-secondary">
          No es tu culpa — pasó un error de nuestro lado. Intenta de nuevo.
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="h-11 rounded-full bg-brand-primary px-6 text-[14px] font-semibold text-txt-inverse"
      >
        Reintentar
      </button>
    </div>
  );
}
