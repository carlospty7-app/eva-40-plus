"use client";

import { motion, type Variants } from "motion/react";
import { Sparkles } from "lucide-react";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { ScoreRing } from "@/components/app/ui/ScoreRing";
import { TapLink } from "@/components/app/ui/TapLink";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-surface-dark-2 via-surface-dark to-surface-dark px-6 pb-20 pt-14 text-txt-inverse md:pb-28 md:pt-20">
      <BotanicalGlow />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto grid w-full max-w-[720px] gap-10 md:max-w-[1040px] md:grid-cols-[1.05fr_0.95fr] md:items-center md:gap-14"
      >
        <div>
          <motion.p
            variants={item}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-txt-inverse/85"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Diagnóstico gratis en 5 minutos
          </motion.p>
          <motion.h1
            variants={item}
            className="font-display text-[34px] font-medium leading-[1.12] md:text-[46px]"
          >
            Desinflámate esta semana con{" "}
            <span className="whitespace-nowrap bg-[linear-gradient(transparent_62%,rgba(224,193,120,0.55)_62%)] px-0.5">
              3 prioridades
            </span>
            , no otra dieta
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-txt-on-dark-secondary md:text-base"
          >
            El diagnóstico EVA te da tu Score Metabólico 40+ y la ruta exacta para tu cuerpo
            después de los 40 — sin contar calorías ni empezar otro reto que abandonas al mes.
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <TapLink
              href="/onboarding"
              className="inline-flex h-[52px] items-center justify-center rounded-lg bg-txt-inverse px-7 text-[15px] font-semibold text-brand-primary transition-transform duration-150 ease-out hover:scale-[1.02]"
            >
              Hacer mi diagnóstico gratis
            </TapLink>
            <p className="text-[12.5px] text-txt-on-dark-secondary">
              Sin tarjeta para empezar · Creado por MaruHealthy
            </p>
          </motion.div>
        </div>

        {/* mini-demo honesto: reproduce el mecanismo real (Score Metabólico) — no es un screenshot de producción */}
        <motion.div
          variants={item}
          className="relative mx-auto w-full max-w-[300px] rounded-2xl bg-white p-6 text-center text-txt-primary shadow-lg md:max-w-[320px]"
        >
          <ScoreRing value={72} />
          <p className="mt-4 font-display text-[15px]">Tu Score Metabólico</p>
          <p className="mt-1 text-[12px] text-txt-tertiary">
            Inflamación moderada · buen margen de mejora
          </p>
          <div className="mt-4 space-y-2 text-left">
            {[
              "Sube proteína en el desayuno",
              "Limita el pan blanco en la cena",
              "Camina 15 min después de comer",
            ].map((p) => (
              <div
                key={p}
                className="rounded-[12px] bg-surface-secondary px-3 py-2 text-[12.5px] font-medium text-txt-primary"
              >
                {p}
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10.5px] text-txt-tertiary">
            Ejemplo de tu diagnóstico — tu resultado real se genera para ti
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
