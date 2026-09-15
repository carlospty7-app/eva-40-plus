"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, CircleAlert, CircleCheck } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { Logo } from "@/components/app/ui/Logo";
import { crearClienteNavegador } from "@/lib/supabase/client";

/** Página donde cae el link de "¿Olvidaste tu contraseña?". A propósito NO canjea el link solo con
 * cargar la página — Gmail y otros correos "escanean" los links por seguridad ANTES de que la
 * usuaria los abra, y como son de un solo uso, ese escaneo automático los gastaba antes de que ella
 * pudiera usarlos. Por eso el link ahora trae `token_hash` en la URL (no lo canjea Supabase solo)
 * y recién se canjea cuando la usuaria aprieta "Guardar contraseña" — una acción real, no un simple
 * GET que un bot pueda disparar. */
export default function ActualizarContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listo, setListo] = useState(false);
  const [linkInvalido, setLinkInvalido] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") || (!params.get("token_hash") && !window.location.hash.includes("access_token"))) {
      setLinkInvalido(true);
    }
  }, []);

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

    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");

    // Si el link trae token_hash (formato nuevo, a prueba de escaneo de correo), lo canjeamos
    // recién ahora — es el primer momento en que hay una acción real de la usuaria de por medio.
    if (tokenHash) {
      const { error: errVerify } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
      if (errVerify) {
        setLoading(false);
        setError("El link ya venció o no es válido — pide uno nuevo desde la pantalla de entrar.");
        return;
      }
    }

    const { error: errUpdate } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (errUpdate) {
      setError("El link ya venció o no es válido — pide uno nuevo desde la pantalla de entrar.");
      return;
    }
    setListo(true);
  }

  if (linkInvalido) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <CircleAlert className="h-8 w-8 text-status-error" />
        <h1 className="mt-4 font-display text-[20px] font-medium text-txt-primary">
          Este link ya no sirve
        </h1>
        <p className="mt-2 max-w-[280px] text-[13.5px] text-txt-secondary">
          Puede que tu correo lo haya abierto automáticamente por seguridad antes que tú. Pide uno
          nuevo desde la pantalla de entrar.
        </p>
        <div className="mt-5 w-full max-w-[220px]">
          <TapButton onClick={() => router.push("/login")}>Volver a iniciar sesión</TapButton>
        </div>
      </div>
    );
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
