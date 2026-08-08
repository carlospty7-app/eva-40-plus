"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

export function EscalaCheckin({
  icon: Icon,
  label,
  textos,
  valor,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  textos: [string, string, string, string, string];
  valor: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="py-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13.5px] font-medium text-txt-primary">
          <Icon className="h-4 w-4 text-brand-primary" />
          {label}
        </span>
        <span className="text-[12px] text-txt-tertiary">{textos[valor - 1]}</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            aria-label={`${label}: ${textos[n - 1]}`}
            aria-pressed={valor === n}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(n)}
            className={`h-9 flex-1 rounded-lg transition-colors ${
              n === valor
                ? "bg-brand-primary"
                : n < valor
                  ? "bg-border-strong"
                  : "bg-surface-tertiary/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
