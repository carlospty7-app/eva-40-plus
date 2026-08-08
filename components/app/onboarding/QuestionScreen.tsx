"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";

export type ChipOption = { value: string; label: string; icon?: LucideIcon };

export function QuestionScreen({
  eyebrow,
  question,
  microcopy,
  options,
  freeTextPlaceholder,
  insights,
  multiple = false,
  initialValue,
  initialValues,
  onAnswer,
  onAnswerMultiple,
}: {
  eyebrow?: string;
  question: string;
  microcopy?: string;
  options: ChipOption[];
  /** Si se pasa, la última opción abre un campo de texto libre en vez de auto-avanzar. */
  freeTextPlaceholder?: string;
  /** Micro-validación que aparece bajo los chips antes de avanzar (eco/insight por valor elegido). */
  insights?: Record<string, string>;
  /** Selección múltiple: chips toggle + botón "Continuar" fijo, en vez de auto-avance. */
  multiple?: boolean;
  /** Respuesta ya guardada (single-select) — para que "Atrás" no borre la selección visual. */
  initialValue?: string;
  /** Respuestas ya guardadas (multi-select). */
  initialValues?: string[];
  onAnswer?: (value: string) => void;
  onAnswerMultiple?: (values: string[]) => void;
}) {
  const [selected, setSelected] = useState<string | null>(initialValue ?? null);
  const [selectedMulti, setSelectedMulti] = useState<string[]>(initialValues ?? []);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [insight, setInsight] = useState<string | null>(null);
  const advancedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function advanceOnce(value: string) {
    if (advancedRef.current) return;
    advancedRef.current = true;
    onAnswer?.(value);
  }

  function skipInsight() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (selected) advanceOnce(selected);
  }

  function handleSelect(value: string, isFreeText: boolean) {
    if (multiple) {
      setSelectedMulti((prev) =>
        prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
      );
      return;
    }
    if (selected) return;
    if (isFreeText) {
      setShowFreeText(true);
      return;
    }
    setSelected(value);
    const shownInsight = insights?.[value];
    if (shownInsight) {
      setInsight(shownInsight);
      timeoutRef.current = setTimeout(() => advanceOnce(value), 1100);
    } else {
      timeoutRef.current = setTimeout(() => advanceOnce(value), 300);
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center px-4 pb-16">
      {eyebrow && (
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-primary/80">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-[27px] font-medium leading-[1.15] text-txt-primary">
        {question}
      </h1>
      {microcopy && <p className="mt-2 text-[14px] text-txt-secondary">{microcopy}</p>}
      {multiple && (
        <p className="mt-1.5 text-[12.5px] font-medium text-brand-primary">
          Elige todas las que apliquen
        </p>
      )}

      <div className="mt-7 space-y-3">
        {options.map((opt, i) => {
          const isFreeText = Boolean(freeTextPlaceholder) && i === options.length - 1;
          const isSelected = multiple ? selectedMulti.includes(opt.value) : selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(opt.value, isFreeText)}
              className={`flex h-14 w-full items-center gap-3 rounded-xl border px-4 text-left shadow-sm transition-colors ${
                isSelected
                  ? "border-brand-primary bg-brand-primary-soft"
                  : "border-border-default bg-surface-primary"
              }`}
            >
              {opt.icon && <opt.icon className="h-5 w-5 shrink-0 text-brand-primary" />}
              <span className="flex-1 text-[15px] font-medium text-txt-primary">{opt.label}</span>
              {isSelected && <Check className="h-5 w-5 shrink-0 text-brand-primary" />}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {insight && (
          <motion.button
            type="button"
            onClick={skipInsight}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-brand-primary-soft px-4 py-3 text-left text-[13px] leading-relaxed text-brand-primary"
          >
            {insight}
            <span className="mt-1 block text-[11px] font-semibold opacity-70">Toca para continuar</span>
          </motion.button>
        )}
      </AnimatePresence>

      {multiple && (
        <div className="mt-6">
          <TapButton
            disabled={selectedMulti.length === 0}
            onClick={() => onAnswerMultiple?.(selectedMulti)}
          >
            Continuar
          </TapButton>
        </div>
      )}

      {showFreeText && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <input
            autoFocus
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder={freeTextPlaceholder}
            className="h-14 w-full rounded-xl border border-border-default bg-surface-primary px-4 text-[15px] text-txt-primary outline-none focus:border-brand-primary"
          />
          <button
            type="button"
            disabled={!freeText.trim()}
            onClick={() => onAnswer?.(freeText.trim())}
            className="mt-3 h-[52px] w-full rounded-full bg-brand-primary text-[15px] font-semibold text-txt-inverse disabled:opacity-40"
          >
            Continuar
          </button>
        </motion.div>
      )}
    </div>
  );
}
