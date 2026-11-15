"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ChevronLeft, CircleAlert } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { Reveal } from "@/components/app/ui/Reveal";
import { Logo } from "@/components/app/ui/Logo";
import { BienvenidaMarca } from "@/components/app/ui/BienvenidaMarca";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { actualizarPerfil } from "@/lib/supabase/queries";
import { leerDiagnostico } from "@/lib/onboarding/storage";
import { leerOferta } from "@/lib/oferta";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cuentaCreada, setCuentaCreada] = useState(false);
  const [revisaCorreo, setRevisaCorreo] = useState(false);
  const [esRegistro, setEsRegistro] = useState(true);
  const [modoRecuperar, setModoRecuperar] = useState(false);
  const [recuperarEnviado, setRecuperarEnviado] = useState(false);
  const [recuperarError, setRecuperarError] = useState<string | null>(null);
  const [recuperarLoading, setRecuperarLoading] = useState(false);
  const [plan, setPlan] = useState<"anual" | "mensual">("mensual");
  const [oferta, setOferta] = useState<"pagado" | "gratis">("pagado");
  const [errorPago, setErrorPago] = useState<string | null>(null);
  const [iniciandoPago, setIniciandoPago] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("plan") === "anual") setPlan("anual");
    setOferta(leerOferta());
  }, []);

  async function continuarAPago() {
    if (iniciandoPago) return;
    setErrorPago(null);
    setIniciandoPago(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, oferta }),
      });
      if (res.status === 409) {
        router.push("/app");
        return;
      }
      if (!res.ok) throw new Error("checkout_failed");
      const data = await res.json();
      if (!data.url) throw new Error("checkout_failed");
      window.location.href = data.url;
    } catch {
      setIniciandoPago(false);
      setErrorPago("No pudimos abrir la pantalla de pago — intenta de nuevo.");
    }
  }

  async function enviarRecuperacion() {
    if (!EMAIL_RE.test(email)) {
      setRecuperarError("Ese correo no parece válido — revisa que esté bien escrito.");
      return;
    }
    setRecuperarError(null);
    setRecuperarLoading(true);
    const supabase = crearClienteNavegador();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login/actualizar-contrasena`,
    });
    // Siempre mostramos éxito, exista o no ese correo — decir "ese correo no existe" permitiría
    // a cualquiera averiguar qué correos están registrados (anti-enumeración).
    setRecuperarLoading(false);
    setRecuperarEnviado(true);
  }

  async function handleSubmit() {
    if (!EMAIL_RE.test(email)) {
      setError("Ese correo no parece válido — revisa que esté bien escrito.");
      return;
    }
    if (password.length < 8) {
      setError("Tu contraseña necesita al menos 8 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);

    const supabase = crearClienteNavegador();

    // Primero probamos iniciar sesión — Supabase, por seguridad, NO avisa con un error claro
    // cuando el signUp se hace sobre un correo ya registrado (anti-enumeración), así que fiarse
    // de "el signUp dio error" para decidir si ya existe la cuenta deja a quien vuelve sin poder
    // entrar nunca. Si el correo es nuevo, el login simplemente falla y ahí sí creamos la cuenta.
    const { data: dataSignIn, error: errSignIn } = await supabase.auth.signInWithPassword({ email, password });

    if (dataSignIn.session) {
      // Cuenta ya existente: si ya pagó, entra directo; si creó la cuenta pero nunca completó el
      // pago, se le vuelve a abrir el checkout (sin pago activo, /app la devolvería al paywall).
      const { data: perfilExistente } = await supabase
        .from("profiles")
        .select("activo, stripe_subscription_id")
        .eq("id", dataSignIn.user.id)
        .single();
      if (perfilExistente?.activo !== true && !perfilExistente?.stripe_subscription_id) {
        setCuentaCreada(true);
        setLoading(false);
        return;
      }
      router.push("/app");
      return;
    }

    if (errSignIn && errSignIn.message.toLowerCase().includes("invalid")) {
      // Contraseña incorrecta para un correo que sí existe vs. correo nuevo: no lo podemos saber
      // sin exponer cuáles correos existen, así que probamos crear la cuenta directamente.
    }

    const { data, error: errSignUp } = await supabase.auth.signUp({ email, password });

    if (errSignUp) {
      setError("No pudimos crear tu cuenta — intenta de nuevo en un momento.");
      setLoading(false);
      return;
    }

    if (data.user && !data.user.identities?.length) {
      // signUp "exitoso" pero sin identidades nuevas = el correo YA tenía cuenta confirmada y la
      // contraseña que escribiste no es la suya.
      setError("Ese correo ya tiene una cuenta — revisa tu contraseña.");
      setLoading(false);
      return;
    }

    if (!data.session || !data.user) {
      // El proyecto pide confirmar el correo antes de dar sesión — no podemos fingir que ya entró.
      setRevisaCorreo(true);
      setLoading(false);
      return;
    }

    // Aplica lo que respondió en el diagnóstico (/onboarding) al perfil real recién creado — si no
    // se hace aquí, la cuenta real queda con los textos genéricos del trigger en vez de lo suyo.
    const diagnostico = leerDiagnostico();
    if (diagnostico) {
      await actualizarPerfil(supabase, data.user.id, {
        metaLabel: diagnostico.metaLabel,
        ...(diagnostico.dolorLabel ? { dolorLabel: diagnostico.dolorLabel } : {}),
      });
    }

    setCuentaCreada(true);
    setLoading(false);
  }

  if (revisaCorreo) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <Mail className="h-8 w-8 text-brand-primary" />
        <h1 className="mt-4 font-display text-[20px] font-medium text-txt-primary">Revisa tu correo</h1>
        <p className="mt-2 max-w-[280px] text-[13.5px] text-txt-secondary">
          Te mandamos un link a <span className="font-medium text-txt-primary">{email}</span> para
          confirmar tu cuenta — ábrelo y vuelve aquí para entrar.
        </p>
      </div>
    );
  }

  if (cuentaCreada) {
    if (errorPago) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <CircleAlert className="h-8 w-8 text-status-error" />
          <h1 className="mt-4 font-display text-[20px] font-medium text-txt-primary">
            Algo falló al abrir el pago
          </h1>
          <p className="mt-2 max-w-[280px] text-[13.5px] text-txt-secondary">{errorPago}</p>
          <div className="mt-5 w-full max-w-[220px]">
            <TapButton disabled={iniciandoPago} onClick={continuarAPago}>
              {iniciandoPago ? "Un momento…" : "Intentar de nuevo"}
            </TapButton>
          </div>
        </div>
      );
    }
    return <BienvenidaMarca onContinuar={continuarAPago} />;
  }

  if (modoRecuperar) {
    if (recuperarEnviado) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <Mail className="h-8 w-8 text-brand-primary" />
          <h1 className="mt-4 font-display text-[20px] font-medium text-txt-primary">Revisa tu correo</h1>
          <p className="mt-2 max-w-[280px] text-[13.5px] text-txt-secondary">
            Si <span className="font-medium text-txt-primary">{email}</span> tiene una cuenta, te
            mandamos un link para crear una contraseña nueva.
          </p>
          <button
            type="button"
            onClick={() => {
              setModoRecuperar(false);
              setRecuperarEnviado(false);
            }}
            className="mt-5 text-[13px] font-medium text-brand-primary underline"
          >
            Volver a iniciar sesión
          </button>
        </div>
      );
    }

    return (
      <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface-base px-4 pb-10 pt-4">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[640px] overflow-hidden">
          <BotanicalGlow variant="light" />
        </div>
        <button
          type="button"
          onClick={() => setModoRecuperar(false)}
          aria-label="Atrás"
          className="flex h-11 w-11 items-center justify-center rounded-full text-txt-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="relative mx-auto flex w-full max-w-[340px] flex-1 flex-col justify-center pb-10">
          <h1 className="font-display text-[24px] font-medium text-txt-primary">Recupera tu acceso</h1>
          <p className="mt-1.5 text-[13.5px] text-txt-secondary">
            Escribe tu correo y te mandamos un link para crear una contraseña nueva.
          </p>

          <div className="mt-6 flex h-[52px] items-center gap-2.5 rounded-full border border-border-default bg-surface-primary px-5">
            <Mail className="h-4.5 w-4.5 shrink-0 text-txt-tertiary" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setRecuperarError(null);
              }}
              placeholder="tucorreo@ejemplo.com"
              className="w-full bg-transparent text-[14.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
            />
          </div>

          {recuperarError && (
            <p className="mt-3 flex items-start gap-2 text-[13px] text-status-error">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {recuperarError}
            </p>
          )}

          <div className="mt-6">
            <TapButton disabled={!email || recuperarLoading} onClick={enviarRecuperacion}>
              {recuperarLoading ? "Enviando…" : "Enviar link de recuperación"}
            </TapButton>
          </div>
        </div>
      </div>
    );
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

          <div className="mt-7 flex rounded-full bg-surface-tertiary/60 p-1">
            <button
              type="button"
              onClick={() => {
                setEsRegistro(false);
                setError(null);
              }}
              className={`h-10 flex-1 rounded-full text-[13.5px] font-semibold transition-colors ${
                !esRegistro ? "bg-surface-primary text-brand-primary shadow-sm" : "text-txt-secondary"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setEsRegistro(true);
                setError(null);
              }}
              className={`h-10 flex-1 rounded-full text-[13.5px] font-semibold transition-colors ${
                esRegistro ? "bg-surface-primary text-brand-primary shadow-sm" : "text-txt-secondary"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          <h1 className="mt-5 font-display text-[24px] font-medium text-txt-primary">
            {esRegistro ? "Crea tu cuenta" : "Bienvenida de vuelta"}
          </h1>
          <p className="mt-1.5 text-[13.5px] text-txt-secondary">
            {esRegistro
              ? "Para guardar tu diagnóstico y tu ruta — toma 30 segundos."
              : "Escribe tu correo y contraseña para entrar."}
          </p>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-6 space-y-3">
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
                placeholder={esRegistro ? "Crea una contraseña (mín. 8)" : "Tu contraseña"}
                className="w-full bg-transparent text-[14.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
              />
            </div>
          </div>

          {!esRegistro && (
            <button
              type="button"
              onClick={() => setModoRecuperar(true)}
              className="mt-2.5 text-[12.5px] font-medium text-brand-primary"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}
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
              {loading ? "Un momento…" : esRegistro ? "Crear mi cuenta" : "Entrar"}
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
