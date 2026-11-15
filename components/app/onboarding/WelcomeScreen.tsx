"use client";

import { motion } from "motion/react";
import { Check, HeartHandshake } from "lucide-react";
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
        Vamos a entender por qué tu cuerpo ya no responde igual
      </motion.h1>
      <motion.p
        variants={item}
        className="mx-auto mt-4 max-w-[38ch] text-[15px] leading-relaxed text-txt-secondary"
      >
        En menos de 2 minutos vas a entender por qué tu cuerpo no responde como antes y cómo
        empezar a desinflamarte — sin volver a contar una sola caloría.
      </motion.p>
      <motion.ul variants={item} className="mt-6 w-full max-w-[300px] space-y-2.5 text-left">
        {[
          "Tu Score Metabólico 40+, de 0 a 100",
          "Tus 3 prioridades para esta semana",
          "Sin tarjeta para empezar",
        ].map((texto) => (
          <li key={texto} className="flex items-center gap-2.5 text-[14px] text-txt-primary">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            {texto}
          </li>
        ))}
      </motion.ul>
      <motion.div variants={item} className="mt-7 w-full max-w-[300px]">
        <TapButton onClick={onStart}>Comenzar mi diagnóstico de 2 minutos</TapButton>
      </motion.div>
      <motion.p variants={item} className="mt-4 max-w-[34ch] text-[12.5px] leading-relaxed text-txt-tertiary">
        Nada de esto se comparte. EVA 40+ es orientación de bienestar, no consejo médico.
      </motion.p>
    </motion.div>
  );
}
