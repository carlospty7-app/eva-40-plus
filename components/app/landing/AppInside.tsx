import { Flame, Moon, CheckCircle2 } from "lucide-react";
import { Section, Eyebrow } from "@/components/app/ui/Section";
import { Reveal } from "@/components/app/ui/Reveal";
import { ScoreRing } from "@/components/app/ui/ScoreRing";

export function AppInside() {
  return (
    <Section className="bg-surface-secondary">
      <Reveal>
        <Eyebrow>Así se ve por dentro</Eyebrow>
        <h2 className="font-display text-[26px] font-medium leading-tight text-txt-primary md:text-[32px]">
          Tu ruta, no una app más para abandonar
        </h2>
      </Reveal>

      <div className="mt-8 -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2">
        {/* Pantalla 1 — Score Metabólico */}
        <Reveal delay={0} className="w-[210px] shrink-0 snap-center">
          <div className="h-full rounded-2xl bg-surface-dark p-5 text-center text-txt-inverse shadow-md">
            <ScoreRing value={72} size={72} thickness={9} />
            <p className="mt-3 font-display text-[14px]">Tu Score Metabólico</p>
            <p className="mt-1 text-[11.5px] text-txt-on-dark-secondary">
              Inflamación moderada
            </p>
          </div>
        </Reveal>

        {/* Pantalla 2 — Ruta de la semana, día por día */}
        <Reveal delay={0.08} className="w-[210px] shrink-0 snap-center">
          <div className="h-full rounded-2xl border border-border-default bg-surface-primary p-5 shadow-sm">
            <p className="font-display text-[14px] text-txt-primary">Tu Ruta de la Semana</p>
            <div className="mt-3 grid grid-cols-7 gap-1">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <div
                  key={i}
                  className={`flex h-7 items-center justify-center rounded-[8px] text-[10px] font-semibold ${
                    i === 2
                      ? "bg-brand-primary text-txt-inverse"
                      : "bg-surface-tertiary text-txt-tertiary"
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[10.5px] font-semibold uppercase tracking-wide text-txt-tertiary">
              Hoy, miércoles
            </p>
            <div className="mt-1.5 rounded-[10px] bg-brand-primary-soft px-2.5 py-2 text-left text-[11.5px] font-medium text-brand-primary">
              Sube proteína en el desayuno
            </div>
          </div>
        </Reveal>

        {/* Pantalla 3 — Check-in de 60 segundos */}
        <Reveal delay={0.16} className="w-[210px] shrink-0 snap-center">
          <div className="h-full rounded-2xl bg-brand-primary-soft p-5 shadow-sm">
            <p className="font-display text-[14px] text-txt-primary">Check-in de 60 segundos</p>
            <div className="mt-3 space-y-2 text-left text-[11.5px] text-txt-primary">
              <div className="flex items-center gap-2 rounded-[10px] bg-surface-primary px-2.5 py-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-brand-primary" />
                Inflamación registrada
              </div>
              <div className="flex items-center gap-2 rounded-[10px] bg-surface-primary px-2.5 py-2">
                <Moon className="h-3.5 w-3.5 text-brand-secondary" />
                ¿Cómo dormiste?
              </div>
              <div className="flex items-center gap-2 rounded-[10px] bg-surface-primary px-2.5 py-2">
                <Flame className="h-3.5 w-3.5 text-status-warning" />
                ¿Tuviste antojos?
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      <p className="mt-4 text-[12px] text-txt-tertiary">
        Vista ilustrativa del producto — tu ruta y tu score reales se generan a partir de tu diagnóstico.
      </p>
    </Section>
  );
}
