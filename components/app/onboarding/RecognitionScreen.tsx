"use client";

import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";

export function RecognitionScreen({
  icon: Icon,
  title,
  body,
  onContinue,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary"
      >
        <Icon className="h-7 w-7" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.3 }}
        className="mt-5 font-display text-[24px] font-medium text-txt-primary"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16, duration: 0.3 }}
        className="mx-auto mt-3 max-w-[32ch] text-[15px] leading-relaxed text-txt-secondary"
      >
        {body}
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.3 }}
        className="mt-8"
      >
        <TapButton onClick={onContinue}>Continuar</TapButton>
      </motion.div>
    </div>
  );
}
