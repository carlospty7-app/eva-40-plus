"use client";

import { useEffect } from "react";
import Image from "next/image";
import { motion } from "motion/react";

/** Momento de marca a pantalla completa justo después de crear la cuenta — no es un splash de
 * carga (no bloquea ni retrasa valor, aparece DESPUÉS de que la usuaria ya actuó). Avanza sola
 * a los ~2s, o al tocar. */
export function BienvenidaMarca({ onContinuar }: { onContinuar: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onContinuar, 2200);
    return () => window.clearTimeout(t);
  }, [onContinuar]);

  return (
    <motion.button
      type="button"
      onClick={onContinuar}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 flex w-full flex-col items-center justify-center bg-surface-dark px-8 text-center"
      aria-label="Continuar a EVA 40+"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.6, ease: [0.34, 1.2, 0.64, 1] }}
      >
        <Image src="/brand/icon.png" alt="" width={150} height={140} unoptimized priority />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-5"
      >
        <p className="font-display text-[30px] font-medium leading-none text-txt-inverse">
          EVA 40+
        </p>
        <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-txt-on-dark-secondary">
          Más ligera · Más tú
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-8 flex items-center gap-3"
      >
        <span className="h-px w-8 bg-white/25" />
        <p className="text-[12.5px] tracking-[0.05em] text-txt-on-dark-secondary">
          Tu ruta hacia tu mejor versión
        </p>
        <span className="h-px w-8 bg-white/25" />
      </motion.div>
    </motion.button>
  );
}
