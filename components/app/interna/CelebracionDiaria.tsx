"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "motion/react";
import { TapButton } from "@/components/app/onboarding/TapButton";
import felicitacionAnim from "@/public/lottie/felicitacion-diaria.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function CelebracionDiaria({
  titulo,
  texto,
  onContinuar,
}: {
  titulo: string;
  texto: string;
  onContinuar: () => void;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="w-full max-w-[340px] rounded-2xl bg-surface-primary p-6 text-center shadow-overlay"
        >
          <div className="mx-auto h-[118px] w-[184px]">
            <Lottie animationData={felicitacionAnim} loop={false} autoplay={!reducedMotion} />
          </div>
          <p className="mt-2 font-display text-[20px] font-medium leading-snug text-txt-primary">
            {titulo}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-txt-secondary">{texto}</p>
          <div className="mt-5">
            <TapButton onClick={onContinuar}>Ver mi recomendación</TapButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
