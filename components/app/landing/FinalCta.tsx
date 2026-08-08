import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { Reveal } from "@/components/app/ui/Reveal";
import { TapLink } from "@/components/app/ui/TapLink";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-surface-dark px-6 py-20 text-center text-txt-inverse md:py-28">
      <BotanicalGlow />
      <Reveal className="relative mx-auto w-full max-w-[560px]">
        <h2 className="font-display text-[28px] font-medium leading-tight md:text-[36px]">
          Imagina despertar sin esa hinchazón, con la ropa que ya no te aprieta
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-txt-on-dark-secondary">
          La mujer que entiende su cuerpo después de los 40 — no la que sigue peleando
          contra él. Diagnóstico gratis, ruta semanal por $9.99/mes, garantía de 7 días.
        </p>
        <TapLink
          href="/onboarding"
          className="mt-7 inline-flex h-[52px] items-center justify-center rounded-lg bg-txt-inverse px-8 text-[15px] font-semibold text-brand-primary transition-transform hover:scale-[1.02]"
        >
          Hacer mi diagnóstico gratis
        </TapLink>
        <p className="mx-auto mt-6 max-w-[42ch] text-[12.5px] leading-relaxed text-txt-on-dark-secondary">
          PD: tu diagnóstico es gratis y toma 5 minutos. Si después de probar tu ruta no te
          sirve, te devolvemos tu dinero. Lo único que pierdes por no intentarlo es otra
          semana sintiéndote igual.
        </p>
      </Reveal>
    </section>
  );
}
