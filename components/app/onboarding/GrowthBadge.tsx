"use client";

import { motion, AnimatePresence } from "motion/react";
import { Sprout, Leaf, Flower2 } from "lucide-react";

/** Gamificación sutil: tu ruta "crece" a medida que avanzas en el diagnóstico. */
function stageFor(progress: number) {
  if (progress >= 75) return { Icon: Flower2, label: "Tu ruta florece" };
  if (progress >= 35) return { Icon: Leaf, label: "Tu ruta crece" };
  return { Icon: Sprout, label: "Tu ruta empieza" };
}

export function GrowthBadge({ progress }: { progress: number }) {
  const { Icon, label } = stageFor(progress);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={label}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18 }}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-primary-soft py-1 pl-1.5 pr-2.5"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-txt-inverse">
          <Icon className="h-3 w-3" />
        </span>
        <span className="text-[10.5px] font-semibold text-brand-primary">{label}</span>
      </motion.div>
    </AnimatePresence>
  );
}
