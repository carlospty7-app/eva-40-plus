import { ClipboardList, Activity, ListChecks, X, Check } from "lucide-react";
import { Section, Eyebrow } from "@/components/app/ui/Section";
import { IconChip } from "@/components/app/ui/IconChip";
import { Reveal } from "@/components/app/ui/Reveal";

const steps = [
  {
    icon: ClipboardList,
    title: "Respondes tu diagnóstico",
    text: "5 minutos, sin básculas ni laboratorios — solo tus síntomas y tu día a día.",
  },
  {
    icon: Activity,
    title: "Calculamos tu Score Metabólico 40+",
    text: "Un número que traduce qué tan inflamado o desregulado está tu cuerpo hoy.",
  },
  {
    icon: ListChecks,
    title: "Recibes tus 3 prioridades de la semana",
    text: "No una lista de 40 reglas — solo lo que de verdad mueve la aguja para ti.",
  },
];

const comparison = [
  { before: "Cuentas calorías todo el día", after: "Un check-in de 60 segundos" },
  { before: "Sigues una dieta genérica", after: "Una ruta hecha para tu semana" },
  { before: "No sabes si es hormonal o de comida", after: "Tu Score te lo traduce" },
];

export function Solution() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>El Método de las 3 Prioridades</Eyebrow>
        <h2 className="font-display text-[26px] font-medium leading-tight text-txt-primary md:text-[32px]">
          No es que te falte disciplina. Es que tu cuerpo cambió de reglas.
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-txt-secondary">
          El Método de las 3 Prioridades te dice, cada semana, qué comer, qué limitar y qué
          hábito hacer — según lo que tu propio cuerpo está mostrando, no según una dieta
          pensada para cualquiera.
        </p>
      </Reveal>

      <div className="mt-9 space-y-4">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.08}>
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <IconChip icon={s.icon} tone="solid" />
                {i < steps.length - 1 && (
                  <div className="mt-2 h-full w-px flex-1 bg-border-default" />
                )}
              </div>
              <div className="pb-6">
                <p className="font-display text-[16px] text-txt-primary">{s.title}</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-txt-secondary">{s.text}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-4 overflow-hidden rounded-xl border border-border-default">
          <div className="grid grid-cols-2 divide-x divide-border-default text-[13px]">
            <div className="bg-surface-tertiary px-4 py-3 font-semibold text-txt-tertiary">
              Antes
            </div>
            <div className="bg-brand-primary-soft px-4 py-3 font-semibold text-brand-primary">
              Con EVA 40+
            </div>
          </div>
          {comparison.map((row) => (
            <div
              key={row.before}
              className="grid grid-cols-2 divide-x divide-border-default border-t border-border-default text-[13.5px]"
            >
              <div className="flex items-start gap-2 px-4 py-3 text-txt-secondary">
                <X className="mt-0.5 h-4 w-4 shrink-0 text-status-error" />
                {row.before}
              </div>
              <div className="flex items-start gap-2 px-4 py-3 text-txt-primary">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-status-success" />
                {row.after}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}
