"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Check, ChevronLeft } from "lucide-react";
import { TopHeader } from "@/components/app/interna/TopHeader";
import { cargarEstado } from "@/lib/app/store";
import { listaDeComprasSemana } from "@/lib/app/engine";
import type { EstadoApp } from "@/lib/app/types";

export default function ListaDeComprasPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoApp | null>(null);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());

  useEffect(() => {
    setEstado(cargarEstado());
  }, []);

  if (!estado) {
    return (
      <div className="relative min-h-dvh px-4 pt-4">
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-tertiary/50" />
          ))}
        </div>
      </div>
    );
  }

  const lista = listaDeComprasSemana(estado.rutaSemana);

  function toggle(item: string) {
    setMarcados((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  }

  return (
    <div className="relative min-h-dvh px-4 pb-10 pt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Atrás"
          className="flex h-10 w-10 items-center justify-center rounded-full text-txt-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-display text-[16px] text-txt-primary">Lista de compras</span>
      </div>

      <p className="mt-4 text-[13px] text-txt-secondary">
        Todo lo que necesitas para tu ruta de esta semana, junto en un solo lugar.
      </p>

      <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary shadow-sm">
        {lista.map((item, i) => {
          const marcado = marcados.has(item);
          return (
            <motion.button
              key={item}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggle(item)}
              className="flex w-full items-center gap-3 border-b border-border-default/60 p-4 text-left last:border-0"
            >
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  marcado ? "border-brand-primary bg-brand-primary" : "border-border-strong"
                }`}
              >
                {marcado && <Check className="h-3 w-3 text-txt-inverse" strokeWidth={3} />}
              </span>
              <span
                className={`text-[13.5px] ${
                  marcado ? "text-txt-tertiary line-through" : "text-txt-primary"
                }`}
              >
                {item}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
