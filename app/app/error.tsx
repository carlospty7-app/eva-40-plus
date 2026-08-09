"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";

export default function ErrorApp({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: error.message, context: "app" }),
    }).catch(() => {});
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <CircleAlert className="h-8 w-8 text-status-error" />
      <h1 className="font-display text-[18px] font-medium text-txt-primary">Esta pantalla se atoró</h1>
      <p className="max-w-[280px] text-[13.5px] text-txt-secondary">
        Tus datos están a salvo — intenta de nuevo o vuelve a Hoy.
      </p>
      <div className="mt-2 flex w-full max-w-[280px] flex-col gap-2.5">
        <TapButton onClick={reset}>Reintentar</TapButton>
        <button
          type="button"
          onClick={() => router.push("/app")}
          className="flex h-11 w-full items-center justify-center rounded-full border border-border-strong text-[13.5px] font-medium text-txt-secondary"
        >
          Volver a Hoy
        </button>
      </div>
    </div>
  );
}
