"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ChevronLeft, CircleAlert } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { Reveal } from "@/components/app/ui/Reveal";
import { Logo } from "@/components/app/ui/Logo";
import { BienvenidaMarca } from "@/components/app/ui/BienvenidaMarca";
import { cargarEstado, guardarEstado } from "@/lib/app/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cuentaCreada, setCuentaCreada] = useState(false);

  function handleSubmit() {
    if (!EMAIL_RE.test(email)) {
      setError("Ese correo no parece válido — revisa que esté bien escrito.");
      return;
    }
    if (password.length < 6) {
      setError("Tu contraseña necesita al menos 6 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);
    // La creación de cuenta real (Supabase Auth) se conecta en la Sesión 6.
    const estado = cargarEstado();
    guardarEstado({ ...estado, perfil: { ...estado.perfil, email } });
    window.setTimeout(() => setCuentaCreada(true), 500);
  }

  if (cuentaCreada) {
    return <BienvenidaMarca onContinuar={() => router.push("/app")} />;
  }

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface-base px-4 pb-10 pt-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[640px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <button
        type="button"
        onClick={() => router.push("/paywall")}
        aria-label="Atrás"
        className="flex h-11 w-11 items-center justify-center rounded-full text-txt-secondary"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div className="mx-auto flex w-full max-w-[340px] flex-1 flex-col justify-center pb-10">
        <Reveal>
          <div className="flex justify-center">
            <Link href="/" aria-label="EVA 40+">
              <Logo height={48} />
            </Link>
          </div>

          <h1 className="mt-8 font-display text-[24px] font-medium text-txt-primary">
            Crea tu cuenta
          </h1>
          <p className="mt-1.5 text-[13.5px] text-txt-secondary">
            Para guardar tu diagnóstico y tu ruta — toma 30 segundos.
          </p>
        </Reveal>

        <Reveal delay={0.08}>
        <button
          type="button"
          disabled
          aria-disabled="true"
          title="Disponible próximamente"
          className="mt-6 flex h-[52px] w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-full border border-border-strong text-[14px] font-semibold text-txt-tertiary opacity-60"
        >
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 grayscale" aria-hidden>
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.85-.08-1.66-.22-2.45H12v4.63h6.47c-.28 1.47-1.13 2.72-2.4 3.56v2.96h3.88c2.27-2.09 3.58-5.17 3.58-8.7z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-2.96c-1.08.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.06C3.25 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.32A7.2 7.2 0 0 1 4.9 12c0-.81.14-1.6.37-2.32V6.62H1.27A11.98 11.98 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.06z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.62l4 3.06C6.22 6.86 8.87 4.75 12 4.75z"
            />
          </svg>
          Continuar con Google (próximamente)
        </button>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border-default" />
            <span className="text-[12px] text-txt-tertiary">o con tu correo</span>
            <div className="h-px flex-1 bg-border-default" />
          </div>

          <div className="space-y-3">
            <div className="flex h-[52px] items-center gap-2.5 rounded-full border border-border-default bg-surface-primary px-5">
              <Mail className="h-4.5 w-4.5 shrink-0 text-txt-tertiary" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="tucorreo@ejemplo.com"
                className="w-full bg-transparent text-[14.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
              />
            </div>
            <div className="flex h-[52px] items-center gap-2.5 rounded-full border border-border-default bg-surface-primary px-5">
              <Lock className="h-4.5 w-4.5 shrink-0 text-txt-tertiary" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Crea una contraseña"
                className="w-full bg-transparent text-[14.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
              />
            </div>
          </div>
        </Reveal>

        {error && (
          <p className="mt-3 flex items-start gap-2 text-[13px] text-status-error">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <Reveal delay={0.2}>
          <div className="mt-6">
            <TapButton disabled={!email || !password || loading} onClick={handleSubmit}>
              {loading ? "Creando tu cuenta…" : "Crear mi cuenta"}
            </TapButton>
          </div>

          <p className="mt-4 text-center text-[12px] leading-relaxed text-txt-tertiary">
            Al continuar aceptas los{" "}
            <Link href="/legal/terminos" className="underline">
              Términos
            </Link>{" "}
            y la{" "}
            <Link href="/legal/privacidad" className="underline">
              Política de Privacidad
            </Link>
            .
          </p>
        </Reveal>
      </div>
    </div>
  );
}
