"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

/** Anillo de score que cuenta 0→valor, se "dibuja" al entrar en vista y celebra al terminar (22/41). */
export function ScoreRing({
  value,
  size = 112,
  thickness = 12,
  label = "/100",
  color = "primary",
}: {
  value: number;
  size?: number;
  thickness?: number;
  label?: string;
  /** "primary" (verde de marca, default — usado en landing/onboarding, no tocar) o "accent" (coral, app interna). */
  color?: "primary" | "accent";
}) {
  const colorVar = color === "accent" ? "var(--brand-accent)" : "var(--brand-primary)";
  const softClass = color === "accent" ? "bg-brand-accent-soft" : "bg-brand-primary-soft";
  const [display, setDisplay] = useState(0);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;

          if (prefersReducedMotion) {
            setDisplay(value);
            setDone(true);
            return;
          }

          const start = performance.now();
          const duration = 900;
          const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(eased * value));
            if (progress < 1) {
              requestAnimationFrame(tick);
            } else {
              setDone(true);
            }
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  const pct = (display / 100) * 360;

  return (
    <motion.div
      ref={ref}
      className="relative mx-auto flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${colorVar} ${pct}deg, var(--surface-tertiary) ${pct}deg 360deg)`,
        transition: "background 80ms linear",
      }}
      animate={done ? { scale: [1, 1.06, 1] } : {}}
      transition={{ duration: 0.4, ease: [0.34, 1.2, 0.64, 1] }}
    >
      {done && (
        <motion.span
          aria-hidden
          initial={{ opacity: 0.5, scale: 0.9 }}
          animate={{ opacity: 0, scale: 1.35 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`absolute inset-0 rounded-full ${softClass}`}
        />
      )}
      <div
        className="relative flex flex-col items-center justify-center rounded-full bg-white"
        style={{ width: size - thickness * 2, height: size - thickness * 2 }}
      >
        <span
          className="font-display font-medium leading-none tabular-nums text-txt-primary"
          style={{ fontSize: Math.max(14, Math.round(size / 4)) }}
        >
          {display}
        </span>
        <span className="text-txt-tertiary" style={{ fontSize: Math.max(8, Math.round(size / 11)) }}>
          {label}
        </span>
      </div>
    </motion.div>
  );
}
