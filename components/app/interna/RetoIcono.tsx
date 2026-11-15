import { Salad, Wind, Search, Sparkles, type LucideIcon } from "lucide-react";

const ICONOS: Record<string, LucideIcon> = {
  "desinflama-7": Salad,
  "reset-5": Wind,
  "escucha-tu-cuerpo": Search,
};

/** Ícono de un reto dentro de un chip — reemplaza los emojis (el sistema de diseño los prohíbe como ícono). */
export function RetoIcono({ slug, tamano = 36 }: { slug: string; tamano?: number }) {
  const Icono = ICONOS[slug] ?? Sparkles;
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary"
      style={{ width: tamano, height: tamano }}
    >
      <Icono style={{ width: tamano * 0.5, height: tamano * 0.5 }} />
    </span>
  );
}
