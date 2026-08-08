"use client";

import { motion } from "motion/react";

export function TapButton({
  onClick,
  disabled,
  children,
  variant = "solid",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant?: "solid" | "outline";
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`h-[52px] w-full rounded-full text-[15px] font-semibold transition-opacity disabled:opacity-40 ${
        variant === "solid"
          ? "bg-brand-primary text-txt-inverse"
          : "border border-border-strong text-txt-primary"
      }`}
    >
      {children}
    </motion.button>
  );
}
