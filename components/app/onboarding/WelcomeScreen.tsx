"use client";

import { motion } from "motion/react";
import { HeartHandshake } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-1 flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        variants={item}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary"
      >
        <HeartHandshake className="h-7 w-7" />
      </motion.div>
      <motion.h1
        variants={item}
        className="mt-6 max-w-[24ch] font-display text-[28px] font-medium leading-[1.15] text-txt-primary"
      >
        Bienvenida a tu espacio de regulación metabólica 40+
      </motion.h1>
      <motion.p
        variants={item}
        className="mx-auto mt-4 max-w-[38ch] text-[15px] leading-relaxed text-txt-secondary"
      >
        En menos de 2 minutos vas a entender por qué tu cuerpo no responde como antes y cómo
        empezar a desinflamarte — sin volver a contar una sola caloría.
      </motion.p>
      <motion.p variants={item} className="mt-3 text-[12.5px] text-txt-tertiary">
        Nada de esto se comparte. Solo es para entender tu situación y armar tu ruta.
      </motion.p>
      <motion.div variants={item} className="mt-8 w-full max-w-[300px]">
        <TapButton onClick={onStart}>Comenzar mi diagnóstico de 2 minutos</TapButton>
      </motion.div>
    </motion.div>
  );
}
