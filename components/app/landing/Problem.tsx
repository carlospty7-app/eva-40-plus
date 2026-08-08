import { Moon, Ruler, RotateCcw, Brain } from "lucide-react";
import { Section, Eyebrow } from "@/components/app/ui/Section";
import { IconChip } from "@/components/app/ui/IconChip";
import { Reveal } from "@/components/app/ui/Reveal";

const questions = [
  { icon: Ruler, text: "¿Te levantas inflamada, aunque comiste “bien” el día anterior?" },
  { icon: Moon, text: "¿Duermes mal y tienes antojos a media tarde, sin saber por qué?" },
  { icon: RotateCcw, text: "¿Ya probaste dietas y retos y volviste al mismo punto?" },
  { icon: Brain, text: "¿Sientes que tu cuerpo cambió de reglas después de los 40?" },
];

export function Problem() {
  return (
    <Section>
      <Reveal>
        <Eyebrow>Si esto te suena…</Eyebrow>
        <h2 className="font-display text-[26px] font-medium leading-tight text-txt-primary md:text-[32px]">
          No eres tú fallando. Es que nadie te tradujo las reglas nuevas.
        </h2>
      </Reveal>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {questions.map((q, i) => (
          <Reveal key={q.text} delay={i * 0.06}>
            <div className="flex h-full items-start gap-3 rounded-xl border border-border-default bg-surface-primary p-4">
              <IconChip icon={q.icon} tone="solid" size="sm" />
              <p className="pt-1.5 text-[14px] leading-snug text-txt-primary">{q.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
