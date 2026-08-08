"use client";

import { motion } from "motion/react";
import { ScoreRing } from "@/components/app/ui/ScoreRing";
import { TapButton } from "@/components/app/onboarding/TapButton";
import type { Priority } from "@/lib/onboarding/engine";

export function ResultScreen({
  score,
  scoreLabel,
  priorities,
  dolorLabel,
  onContinue,
}: {
  score: number;
  scoreLabel: string;
  priorities: Priority[];
  dolorLabel?: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col px-4 pt-8">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-primary/80"
      >
        Tu diagnóstico está listo
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mt-1 font-display text-[26px] font-medium leading-tight text-txt-primary"
      >
        Este es tu Score Metabólico
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mt-6 rounded-xl border border-border-default bg-surface-primary p-6 text-center shadow-sm"
      >
        <ScoreRing value={score} />
        <p className="mt-3 text-[13px] text-txt-secondary">{scoreLabel}</p>
      </motion.div>

      {dolorLabel && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mt-4 rounded-xl bg-brand-primary-soft px-4 py-3 text-[13px] leading-relaxed text-brand-primary shadow-[inset_0_1px_3px_rgba(20,38,31,0.08)]"
        >
          Sabemos que lo que más te pesa ahora es {dolorLabel} — por eso tu ruta ataca justo eso
          primero.
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-[11px] font-semibold uppercase tracking-[0.1em] text-txt-tertiary"
      >
        Tus 3 prioridades de esta semana
      </motion.p>
      <div className="mt-2 space-y-2">
        {priorities.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 + i * 0.08 }}
            className="flex items-start justify-between gap-3 rounded-xl border border-border-default bg-surface-primary p-3.5 shadow-sm"
          >
            <div>
              <p className="text-[13.5px] font-semibold text-txt-primary">{p.title}</p>
              <p className="text-[12px] text-txt-tertiary">{p.detail}</p>
            </div>
            <span className="shrink-0 rounded-full bg-brand-primary-soft px-2.5 py-1 text-[10px] font-bold text-brand-primary">
              {p.tag}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 pb-8">
        <TapButton onClick={onContinue}>Ver mi ruta completa</TapButton>
      </div>
    </div>
  );
}
