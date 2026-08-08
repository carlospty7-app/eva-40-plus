"use client";

import { motion, AnimatePresence } from "motion/react";
import { Flame } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { AnimatedCounter } from "@/components/app/interna/AnimatedCounter";
import { DIA_LABELS } from "@/lib/app/dates";

export function CelebracionRacha({
  dias,
  onContinuar,
}: {
  dias: number;
  onContinuar: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-full max-w-[340px] rounded-2xl bg-surface-primary p-6 text-center shadow-overlay"
        >
          <motion.div
            initial={{ scale: 0.7, rotate: -8, opacity: 0 }}
            animate={{ scale: [0.7, 1.12, 1], rotate: [-8, 6, 0], opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.34, 1.2, 0.64, 1], delay: 0.1 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-accent to-brand-gold shadow-[0_10px_24px_rgba(255,122,89,0.35)]"
          >
            <Flame className="h-10 w-10 text-txt-inverse" strokeWidth={2.2} />
          </motion.div>

          <p className="mt-4 font-display text-[40px] font-medium leading-none text-brand-accent">
            <AnimatedCounter value={dias} />
          </p>
          <p className="mt-1 text-[13.5px] font-semibold uppercase tracking-[0.06em] text-txt-secondary">
            días de racha
          </p>

          <div className="mt-4 flex justify-center gap-1.5">
            {DIA_LABELS.map((d, i) => (
              <motion.span
                key={d}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 300, damping: 18 }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-accent-soft text-[11px] font-bold text-brand-accent"
              >
                {d}
              </motion.span>
            ))}
          </div>

          <p className="mt-5 font-display text-[18px] font-medium leading-snug text-txt-primary">
            ¡Completaste tu semana entera!
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-txt-secondary">
            Esto es justo lo que construye resultados reales — no un día perfecto, siete días
            constantes.
          </p>

          <div className="mt-5">
            <TapButton onClick={onContinuar}>Seguir con mi ruta</TapButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
