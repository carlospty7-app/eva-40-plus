"use client";

import { useEffect } from "react";
import { CircleAlert } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";

export default function ErrorGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, context: "raiz" }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <CircleAlert className="h-8 w-8 text-status-error" />
      <h1 className="font-display text-[18px] font-medium text-txt-primary">Algo no cargó bien</h1>
      <p className="max-w-[280px] text-[13.5px] text-txt-secondary">
        No fue tu culpa — intenta de nuevo en un momento.
      </p>
      <div className="mt-2 w-full max-w-[220px]">
        <TapButton onClick={reset}>Reintentar</TapButton>
      </div>
    </div>
  );
}
