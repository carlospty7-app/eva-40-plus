import { Frown } from "lucide-react";
import { Section, Eyebrow } from "@/components/app/ui/Section";
import { Reveal } from "@/components/app/ui/Reveal";

const timeline = [
  { label: "Mes 1", note: "Otra dieta genérica" },
  { label: "Mes 3", note: "Mismo cansancio" },
  { label: "Mes 6", note: "Mismo lugar de siempre" },
];

export function Agitation() {
  return (
    <Section className="bg-surface-secondary">
      <Reveal>
        <Eyebrow>Lo que sigue costando cada mes</Eyebrow>
        <h2 className="font-display text-[26px] font-medium leading-tight text-txt-primary md:text-[32px]">
          Cada dieta genérica que pruebas no es un mes perdido — es una confirmación más de
          “a mí nada me funciona”.
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-txt-secondary">
          No fallan porque te falte voluntad. Fallan porque no fueron hechas para un cuerpo
          en cambio hormonal: cuentan calorías cuando el problema real es inflamación, sueño
          y hábitos que nadie te ayudó a identificar.
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mt-8 rounded-xl border border-border-default bg-surface-primary p-5">
          <div className="relative flex items-start justify-between">
            <div className="absolute left-[20%] right-[20%] top-5 h-px bg-border-strong" aria-hidden />
            {timeline.map((t) => (
              <div key={t.label} className="relative flex flex-1 flex-col items-center text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-warning-soft text-status-warning">
                  <Frown className="h-[18px] w-[18px]" />
                </div>
                <p className="mt-2 text-[12px] font-semibold text-txt-primary">{t.label}</p>
                <p className="mt-0.5 max-w-[80px] text-[11px] leading-snug text-txt-tertiary">
                  {t.note}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-[13px] font-medium text-txt-secondary">
            Si nada cambia, en 6 meses sigues exactamente donde estás hoy — con 6 meses menos.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
