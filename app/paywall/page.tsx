"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { X, Check, ShieldCheck, Sparkles, BellRing, CreditCard, BadgeCheck } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { Logo } from "@/components/app/ui/Logo";
import { leerDiagnostico, type DiagnosticoGuardado } from "@/lib/onboarding/storage";

const FALLBACK: DiagnosticoGuardado = {
  score: 72,
  scoreLabel: "Inflamación moderada · buen margen de mejora",
  metaLabel: "sentirte mejor",
  dolorLabel: "la sensación de que la ropa ya no te cierra igual",
  priorities: [
    { title: "Sube proteína en el desayuno", detail: "", tag: "" },
    { title: "Limita el pan blanco en la cena", detail: "", tag: "" },
    { title: "Camina 15 min después de comer", detail: "", tag: "" },
  ],
};

function fechaEnDias(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toLocaleDateString("es", { day: "numeric", month: "long" });
}

/** Número héroe que cuenta 0→valor cada vez que `value` cambia (respeta reduced-motion vía MotionConfig).
 * Vuelve a animar si el score real llega después del fallback (ver `leerDiagnostico`), en vez de
 * quedarse congelado en el primer valor mostrado. */
function AnimatedScore({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 700;
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span className="tabular-nums">{display}</span>;
}

export default function PaywallPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<"anual" | "mensual">("anual");
  const [data, setData] = useState<DiagnosticoGuardado>(FALLBACK);
  const [isPending, setIsPending] = useState(false);
  const [ctaPrincipalVisible, setCtaPrincipalVisible] = useState(false);
  const ctaPrincipalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = leerDiagnostico();
    if (saved) setData(saved);
  }, []);

  useEffect(() => {
    const el = ctaPrincipalRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setCtaPrincipalVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function irALogin() {
    if (isPending) return;
    setIsPending(true);
    router.push("/login");
  }

  const precio = plan === "anual" ? "$5.99/mes" : "$9.99/mes";

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-surface-base px-4 pb-28 pt-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[640px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <div className="flex items-center justify-between">
        <Link
          href="/"
          aria-label="Cerrar"
          className="flex h-11 w-11 items-center justify-center rounded-full text-txt-secondary"
        >
          <X className="h-5 w-5" />
        </Link>
        <Logo height={38} />
        <div className="h-11 w-11" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
        <h1 className="font-display text-[27px] font-medium leading-[1.15] text-txt-primary">
          Tu ruta para {data.metaLabel} está lista
        </h1>
        <p className="mt-2 text-[13.5px] text-txt-secondary">
          Hecha con tus respuestas del diagnóstico · Puntaje <AnimatedScore value={data.score} />/100
        </p>
        {data.dolorLabel && (
          <p className="mt-1 text-[12.5px] text-txt-tertiary">
            Sabemos que lo que más te pesa ahora es {data.dolorLabel} — por eso tu ruta arranca justo ahí.
          </p>
        )}
        <p className="mt-2 flex items-center gap-2 text-[11.5px] text-txt-tertiary">
          <BadgeCheck className="h-3.5 w-3.5 text-brand-primary" />
          No empiezas de cero: seguimos justo donde quedó tu diagnóstico
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-6 space-y-2 rounded-xl border border-border-default/60 bg-surface-primary/60 p-4"
      >
        {data.priorities.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="flex items-center gap-3"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span className="text-[13.5px] font-medium text-txt-primary">{p.title}</span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + data.priorities.length * 0.07 }}
          className="flex items-center gap-3"
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
            <Check className="h-3 w-3" strokeWidth={3} />
          </span>
          <span className="text-[13.5px] font-medium text-txt-primary">
            Check-in diario de 60 segundos con pasos simples para tu día
          </span>
        </motion.div>
      </motion.div>

      <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[700px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>

      <div className="relative mt-6 space-y-3">
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPlan("anual")}
          className={`relative w-full rounded-xl border-2 p-4 text-left transition-colors ${
            plan === "anual"
              ? "border-brand-primary bg-brand-primary-soft shadow-sm"
              : "border-transparent bg-surface-tertiary/50"
          }`}
        >
          <span className="absolute -top-2.5 left-4 rounded-full bg-brand-gold px-2.5 py-0.5 text-[10px] font-bold text-surface-dark-2">
            MÁS POPULAR · AHORRA 40%
          </span>
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-txt-primary">Anual</span>
            <span className="font-display text-[20px] font-medium text-txt-primary">
              $5.99<span className="text-[12px] text-txt-tertiary">/mes</span>
            </span>
          </div>
          <p className="mt-1 text-[11.5px] text-txt-tertiary">Se cobra $71.88/año</p>
        </motion.button>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.43 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPlan("mensual")}
          className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${
            plan === "mensual"
              ? "border-brand-primary bg-brand-primary-soft shadow-sm"
              : "border-transparent bg-surface-tertiary/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-semibold text-txt-primary">Mensual</span>
            <span className="font-display text-[20px] font-medium text-txt-primary">
              $9.99<span className="text-[12px] text-txt-tertiary">/mes</span>
            </span>
          </div>
        </motion.button>
      </div>

      <p className="relative mt-6 text-center text-[12.5px] text-txt-secondary">
        Menos de <span className="font-semibold text-txt-primary">$0.20 al día</span> — probablemente
        menos de lo que ya gastaste en suplementos o retos que no calzaban contigo.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative mt-6 rounded-xl bg-surface-tertiary/60 p-4"
      >
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-txt-tertiary">
          Así funciona tu prueba de 7 días
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-txt-primary">Hoy</p>
              <p className="text-[12px] text-txt-tertiary">Empiezas tu ruta gratis, sin cobro</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <BellRing className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-txt-primary">Día 5 ({fechaEnDias(5)})</p>
              <p className="text-[12px] text-txt-tertiary">
                Te avisamos por correo — todavía puedes cancelar sin que se te cobre nada
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <CreditCard className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-txt-primary">Día 7 ({fechaEnDias(7)})</p>
              <p className="text-[12px] text-txt-tertiary">
                Se hace el primer cobro y se activa tu plan, solo si no cancelaste antes
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div ref={ctaPrincipalRef} className="relative mt-6">
        <TapButton onClick={irALogin} disabled={isPending}>
          {isPending ? "Un momento…" : "Activar 7 días gratis"}
        </TapButton>
        <p className="mt-3 text-center text-[12px] text-txt-tertiary">
          Cancela cuando quieras, sin llamadas · Sin cargo hasta el {fechaEnDias(7)}
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.push("/")}
        disabled={isPending}
        className="relative mt-3 h-11 w-full text-center text-[13px] font-medium text-txt-tertiary disabled:opacity-40"
      >
        Ahora no
      </button>

      <div className="relative mt-4 flex items-center justify-center gap-2 text-[11.5px] text-txt-tertiary">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
        <span>Garantía 7 días · Pago seguro · Hotmart</span>
      </div>
      </div>

      {/* CTA sticky — solo mientras el CTA principal no está a la vista, para no duplicar la acción */}
      <motion.div
        initial={false}
        animate={{ y: ctaPrincipalVisible ? 100 : 0, opacity: ctaPrincipalVisible ? 0 : 1 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-x-0 bottom-0 z-10 border-t border-border-default bg-surface-base/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur"
      >
        <div className="mx-auto flex max-w-[420px] items-center gap-3">
          <div className="shrink-0">
            <p className="font-display text-[16px] leading-none text-txt-primary">{precio}</p>
            <p className="text-[10.5px] text-txt-tertiary">7 días gratis</p>
          </div>
          <button
            type="button"
            onClick={irALogin}
            disabled={isPending}
            className="h-[52px] flex-1 rounded-full bg-brand-primary text-[15px] font-semibold text-txt-inverse transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {isPending ? "Un momento…" : "Activar 7 días gratis"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
