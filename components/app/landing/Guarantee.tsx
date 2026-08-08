import { ShieldCheck } from "lucide-react";
import { Section } from "@/components/app/ui/Section";
import { IconChip } from "@/components/app/ui/IconChip";
import { Reveal } from "@/components/app/ui/Reveal";

export function Guarantee() {
  return (
    <Section className="bg-surface-secondary">
      <Reveal>
        <div className="flex flex-col items-center rounded-2xl bg-surface-primary p-8 text-center shadow-sm">
          <IconChip icon={ShieldCheck} tone="solid" size="lg" />
          <p className="mt-4 font-display text-[20px] text-txt-primary">
            La Garantía de tu Primera Ruta
          </p>
          <p className="mt-3 max-w-[42ch] text-[14px] leading-relaxed text-txt-secondary">
            Si en 7 días tu Score Metabólico y tu primera Ruta no te hacen sentido, te
            devolvemos el 100% de tu dinero. Un correo, sin preguntas, sin formularios.
          </p>
          <p className="mt-3 text-[12.5px] text-txt-tertiary">
            Respaldado por la garantía de reembolso de Hotmart de 7 días.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
