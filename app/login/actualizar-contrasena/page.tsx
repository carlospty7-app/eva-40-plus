"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CircleAlert, CircleCheck } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { Logo } from "@/components/app/ui/Logo";
import { crearClienteNavegador } from "@/lib/supabase/client";

/** Página donde cae el link de "¿Olvidaste tu contraseña?" — Supabase ya arma una sesión temporal
 * de recuperación a partir del link (el cliente la detecta solo desde la URL), así que solo hace
 * falta pedir la contraseña nueva y guardarla. */
export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);

  async function guardar() {
    if (password.length < 6) {
      setError("Tu contraseña necesita al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }
    setError(null);
    setLoading(true);
    const supabase = crearClienteNavegador();
    const { error: errUpdate } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (errUpdate) {
      setError("El link ya venció o no es válido — pide uno nuevo desde la pantalla de entrar.");
      return;
    }
    setListo(true);
  }

  if (listo) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <CircleCheck className="h-8 w-8 text-status-success" />
        <h1 className="mt-4 font-display text-[20px] font-medium text-txt-primary">
          Contraseña actualizada
        </h1>
        <p className="mt-2 max-w-[280px] text-[13.5px] text-txt-secondary">
          Ya puedes entrar con tu contraseña nueva.
        </p>
        <div className="mt-5 w-full max-w-[220px]">
          <TapButton onClick={() => router.push("/app")}>Ir a la app</TapButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <Logo height={40} />
      <div className="mt-8 w-full max-w-[300px]">
        <h1 className="font-display text-[20px] font-medium text-txt-primary">Crea una contraseña nueva</h1>
        <p className="mt-1.5 text-[13.5px] text-txt-secondary">Mínimo 6 caracteres.</p>

        <div className="mt-5 space-y-3">
          <div className="flex h-[52px] items-center gap-2.5 rounded-full border border-border-default bg-surface-primary px-5">
            <Lock className="h-4.5 w-4.5 shrink-0 text-txt-tertiary" />
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              placeholder="Contraseña nueva"
              className="w-full bg-transparent text-[14.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
            />
          </div>
          <div className="flex h-[52px] items-center gap-2.5 rounded-full border border-border-default bg-surface-primary px-5">
            <Lock className="h-4.5 w-4.5 shrink-0 text-txt-tertiary" />
            <input
              type="password"
              value={confirmar}
              onChange={(e) => {
                setConfirmar(e.target.value);
                setError(null);
              }}
              placeholder="Repite la contraseña"
              className="w-full bg-transparent text-[14.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
            />
          </div>
        </div>

        {error && (
          <p className="mt-3 flex items-start gap-2 text-[13px] text-status-error">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-6">
          <TapButton disabled={!password || !confirmar || loading} onClick={guardar}>
            {loading ? "Guardando…" : "Guardar contraseña"}
          </TapButton>
        </div>
      </div>
    </div>
  );
}
