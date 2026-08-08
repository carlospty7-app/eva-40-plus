import { Check, Stethoscope, CalendarRange, Waves } from "lucide-react";
import { Section, Eyebrow } from "@/components/app/ui/Section";
import { IconChip } from "@/components/app/ui/IconChip";
import { Reveal } from "@/components/app/ui/Reveal";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { TapLink } from "@/components/app/ui/TapLink";

const stack = [
  {
    icon: Stethoscope,
    title: "Diagnóstico completo + Score Metabólico 40+",
    value: "$17",
    kills: "“No sé si esto aplica a mi caso”",
  },
  {
    icon: CalendarRange,
    title: "Ruta semanal personalizada, actualizada sola",
    value: "$29/mes",
    kills: "“Ya probé dietas genéricas”",
  },
  {
    icon: Waves,
    title: "Microprotocolos: inflamación, sueño, antojos, estrés",
    value: "$19",
    kills: "“No quiero otra app que después no uso”",
  },
];

export function Offer() {
  return (
    <Section id="precios">
      <Reveal>
        <Eyebrow>Tu ruta, sin adivinar</Eyebrow>
        <h2 className="font-display text-[26px] font-medium leading-tight text-txt-primary md:text-[32px]">
          Todo lo que necesitas para desinflamarte, sin dietas extremas
        </h2>
      </Reveal>

      <Reveal>
        <div className="mt-7 space-y-3 rounded-xl bg-surface-tertiary/60 p-5 shadow-[inset_0_1px_3px_rgba(20,38,31,0.08)]">
          {stack.map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <IconChip icon={item.icon} size="sm" />
              <div className="flex-1 pt-1">
                <p className="text-[13.5px] font-semibold text-txt-primary">{item.title}</p>
                <p className="text-[12px] text-txt-tertiary">Mata: {item.kills}</p>
              </div>
              <span className="pt-1 text-[13px] font-semibold text-txt-tertiary line-through">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Reveal>
          <div className="rounded-2xl border border-border-default bg-surface-primary p-6">
            <p className="text-[12px] font-semibold uppercase tracking-wide text-txt-tertiary">
              Mensual
            </p>
            <p className="mt-2 font-display text-[30px] text-txt-primary">
              $9.99<span className="text-[14px] text-txt-tertiary">/mes</span>
            </p>
            <p className="mt-1 text-[12.5px] text-txt-tertiary">7 días de prueba gratis</p>
            <TapLink
              href="/onboarding"
              fullWidth
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-brand-primary text-[14px] font-semibold text-txt-inverse transition-transform hover:scale-[1.02]"
            >
              Empezar prueba gratis
            </TapLink>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative overflow-hidden rounded-2xl bg-surface-dark p-6 text-txt-inverse">
            <BotanicalGlow className="opacity-70" />
            <span className="absolute -top-3 left-6 rounded-full bg-brand-gold px-3 py-1 text-[11px] font-semibold text-surface-dark-2">
              Mejor valor
            </span>
            <div className="relative">
              <p className="text-[12px] font-semibold uppercase tracking-wide text-txt-on-dark-secondary">
                Anual
              </p>
              <p className="mt-2 font-display text-[30px]">
                $5.99<span className="text-[14px] text-txt-on-dark-secondary">/mes</span>
              </p>
              <p className="mt-1 text-[12.5px] text-txt-on-dark-secondary">
                Se cobra $71.88/año · equivalente a 4 meses gratis
              </p>
              <p className="mt-1 text-[12.5px] text-txt-on-dark-secondary">
                7 días de prueba gratis
              </p>
              <TapLink
                href="/onboarding"
                fullWidth
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-txt-inverse text-[14px] font-semibold text-brand-primary transition-transform hover:scale-[1.02]"
              >
                Empezar prueba gratis
              </TapLink>
            </div>
          </div>
        </Reveal>
      </div>

      <Reveal>
        <ul className="mt-6 space-y-2">
          {[
            "Diagnóstico y Score Metabólico 40+",
            "Ruta semanal con tus 3 prioridades",
            "Check-in diario de 60 segundos",
            "Microprotocolos para tus síntomas",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-[13.5px] text-txt-secondary">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                <Check className="h-3 w-3" strokeWidth={3} />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  );
}
