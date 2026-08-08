import { ShieldCheck, Lock, Building2 } from "lucide-react";
import { Reveal } from "@/components/app/ui/Reveal";

const items = [
  { icon: ShieldCheck, text: "Garantía de 7 días, sin preguntas" },
  { icon: Building2, text: "Creado por MaruHealthy" },
  { icon: Lock, text: "Pago seguro procesado por Hotmart" },
];

export function TrustBar() {
  return (
    <Reveal className="px-6 py-8">
      <div className="mx-auto grid w-full max-w-[560px] grid-cols-1 gap-3 rounded-xl border border-border-default bg-surface-primary p-4 sm:grid-cols-3 sm:gap-2 md:max-w-[720px]">
        {items.map((it) => (
          <div key={it.text} className="flex items-center gap-2.5">
            <it.icon className="h-4 w-4 shrink-0 text-brand-primary" />
            <span className="text-[12.5px] font-medium text-txt-secondary">{it.text}</span>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
