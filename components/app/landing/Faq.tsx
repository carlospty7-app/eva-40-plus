"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { Section, Eyebrow } from "@/components/app/ui/Section";
import { Reveal } from "@/components/app/ui/Reveal";

const faqs = [
  {
    q: "¿Voy a tener que contar calorías?",
    a: "No. EVA 40+ no vende conteo de calorías — vende comprensión de tu cuerpo y prioridades semanales claras. El check-in diario toma 60 segundos.",
  },
  {
    q: "Ya probé dietas, retos y suplementos y nada funcionó. ¿Por qué esto sería distinto?",
    a: "Porque no es una dieta genérica: tu Score Metabólico 40+ y tu ruta se ajustan a lo que TU cuerpo muestra cada semana, no a una plantilla para cualquiera.",
  },
  {
    q: "¿Esto aplica para mi edad, mis hormonas o mis síntomas específicos?",
    a: "El diagnóstico está diseñado para mujeres de 40-55 en cambios hormonales (perimenopausia, menopausia) — tus respuestas ajustan tu ruta a tu situación exacta.",
  },
  {
    q: "¿Esto es un consejo médico?",
    a: "No. EVA 40+ es orientación de bienestar, no reemplaza a tu médico. Si tienes una condición diagnosticada, te recomendamos revisar tu ruta con tu profesional de salud.",
  },
  {
    q: "¿Vale la pena pagar $9.99/mes?",
    a: "Es menos de $0.35 al día — probablemente menos de lo que ya gastaste en dietas, retos o suplementos que no calzaban con lo que te estaba pasando a ti.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section>
      <Reveal>
        <Eyebrow>Preguntas frecuentes</Eyebrow>
        <h2 className="font-display text-[26px] font-medium leading-tight text-txt-primary md:text-[32px]">
          Antes de que lo preguntes
        </h2>
      </Reveal>
      <Reveal>
        <div className="mt-7 divide-y divide-border-default rounded-xl border border-border-default">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="px-5">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-[14.5px] font-semibold text-txt-primary">{f.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ChevronDown className="h-4 w-4 shrink-0 text-txt-tertiary" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-4 text-[13.5px] leading-relaxed text-txt-secondary">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Reveal>
    </Section>
  );
}
