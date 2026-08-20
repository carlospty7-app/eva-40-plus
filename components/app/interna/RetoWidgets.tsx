"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, ChevronUp, ShoppingBasket, Sunrise, X } from "lucide-react";
import type { MenuRetoDia, MovimientoReto, GrupoCompra } from "@/lib/app/retos";

/** Widgets del contenido real de un reto (menú, movimiento, compras) — se usan tanto en /app/retos
 * como en /app/ruta cuando hay un reto activo, para que ambas pantallas muestren lo mismo. */
export function MenuDelDiaReto({ menu }: { menu: MenuRetoDia }) {
  const [fotoAmpliada, setFotoAmpliada] = useState<{ src: string; alt: string } | null>(null);
  const filas: { label: string; texto: string; foto?: string }[] = [
    { label: "Desayuno", texto: menu.desayuno, foto: menu.fotos?.desayuno },
    { label: "Almuerzo", texto: menu.almuerzo, foto: menu.fotos?.almuerzo },
    { label: "Cena", texto: menu.cena, foto: menu.fotos?.cena },
    { label: "Snack", texto: menu.snack, foto: menu.fotos?.snack },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md">
      <p className="text-[12.5px] font-semibold text-txt-primary">Menú de hoy</p>
      <div className="mt-3 space-y-3">
        {filas.map((f) => (
          <div key={f.label} className="flex items-center gap-3">
            {f.foto && (
              <button
                type="button"
                onClick={() => setFotoAmpliada({ src: f.foto!, alt: f.texto })}
                aria-label={`Ampliar foto de ${f.label.toLowerCase()}`}
                className="shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.foto} alt={f.texto} className="h-16 w-16 rounded-xl object-cover" />
              </button>
            )}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">{f.label}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-txt-secondary">{f.texto}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {fotoAmpliada && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFotoAmpliada(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[420px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={fotoAmpliada.src}
                alt={fotoAmpliada.alt}
                className="w-full rounded-2xl object-cover"
              />
              <p className="mt-3 text-center text-[13px] text-white/90">{fotoAmpliada.alt}</p>
              <button
                type="button"
                onClick={() => setFotoAmpliada(null)}
                aria-label="Cerrar"
                className="absolute -top-3 -right-3 flex h-9 w-9 items-center justify-center rounded-full bg-surface-primary text-txt-primary shadow-md"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MovimientoDelReto({ movimiento }: { movimiento: MovimientoReto }) {
  const [abierto, setAbierto] = useState(false);
  const secciones: { titulo: string; pasos: string[] }[] = [
    { titulo: "☀️ Mañana", pasos: movimiento.mañana },
    { titulo: "🌿 Yoga suave", pasos: movimiento.yoga },
    { titulo: "🚶‍♀️ Durante el día", pasos: movimiento.duranteElDia },
    { titulo: "🌙 Noche", pasos: movimiento.noche },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-border-default/40 bg-surface-primary shadow-md">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between p-4"
      >
        <span className="flex items-center gap-2.5 text-[12.5px] font-semibold text-txt-primary">
          <Sunrise className="h-4 w-4 text-brand-primary" /> Movimiento de hoy (15-25 min)
        </span>
        {abierto ? (
          <ChevronUp className="h-4 w-4 text-txt-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-txt-tertiary" />
        )}
      </button>
      {abierto && (
        <div className="space-y-3 px-4 pb-4">
          {secciones.map((s) => (
            <div key={s.titulo}>
              <p className="text-[12px] font-semibold text-txt-primary">{s.titulo}</p>
              <ul className="mt-1 space-y-1">
                {s.pasos.map((paso) => (
                  <li key={paso} className="text-[12.5px] leading-relaxed text-txt-secondary">
                    • {paso}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ListaComprasReto({ grupos }: { grupos: GrupoCompra[] }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="mt-4 rounded-2xl border border-border-default/40 bg-surface-primary shadow-md">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between p-4"
      >
        <span className="flex items-center gap-2.5 text-[12.5px] font-semibold text-txt-primary">
          <ShoppingBasket className="h-4 w-4 text-brand-primary" /> Lista de compras de la semana
        </span>
        {abierto ? (
          <ChevronUp className="h-4 w-4 text-txt-tertiary" />
        ) : (
          <ChevronDown className="h-4 w-4 text-txt-tertiary" />
        )}
      </button>
      {abierto && (
        <div className="space-y-3 px-4 pb-4">
          {grupos.map((g) => (
            <div key={g.categoria}>
              <p className="text-[12px] font-semibold text-txt-primary">{g.categoria}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-txt-secondary">{g.items.join(" · ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
