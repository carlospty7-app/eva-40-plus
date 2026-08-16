"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Activity,
  Ban,
  Check,
  Coffee,
  Flame,
  Flower2,
  Footprints,
  Lock,
  PlayCircle,
  ShoppingBasket,
  Soup,
  Target,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { MovimientoDia } from "@/lib/app/types";
import { AnimatedCounter } from "@/components/app/interna/AnimatedCounter";
import { TopHeader } from "@/components/app/interna/TopHeader";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { BibliotecaYoga } from "@/components/app/interna/BibliotecaYoga";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cargarEstadoSupabase } from "@/lib/supabase/queries";
import { isoFecha, nombreDia } from "@/lib/app/dates";
import type { EstadoApp } from "@/lib/app/types";

/** Los videos propios (bajados del Drive de Maru, en Supabase Storage) son archivos .mp4 reales —
 * se reproducen dentro de la app. Los de YouTube (los primeros 4 días con video) siguen abriendo
 * en pestaña nueva, porque no se puede incrustar un archivo directo de YouTube así. */
function esArchivoDeVideo(url: string): boolean {
  return url.endsWith(".mp4");
}

const ICONO_MOVIMIENTO: Record<MovimientoDia["tipo"], LucideIcon> = {
  yoga: Flower2,
  caminata: Footprints,
  movilidad: Activity,
};

export default function MiRutaPage() {
  const [estado, setEstado] = useState<EstadoApp | null>(null);
  const [seleccionado, setSeleccionado] = useState(0);

  useEffect(() => {
    const supabase = crearClienteNavegador();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const cargado = await cargarEstadoSupabase(supabase, data.user.id);
      if (!cargado) return;
      setEstado(cargado);
      const hoy = isoFecha(new Date());
      const idxHoy = cargado.rutaSemana.findIndex((d) => d.fecha === hoy);
      setSeleccionado(idxHoy >= 0 ? idxHoy : 0);
    });
  }, []);

  const hoyIso = isoFecha(new Date());
  const diasCompletados = useMemo(
    () => estado?.rutaSemana.filter((d) => d.completado).length ?? 0,
    [estado]
  );

  if (!estado) {
    return (
      <div className="relative min-h-dvh">
        <TopHeader titulo="Mi Ruta" />
        <div className="mt-6 space-y-3 px-4">
          <div className="h-16 animate-pulse rounded-xl bg-surface-tertiary/50" />
          <div className="h-56 animate-pulse rounded-xl bg-surface-tertiary/50" />
        </div>
      </div>
    );
  }

  const dia = estado.rutaSemana[seleccionado];
  const esHoy = dia.fecha === hoyIso;
  const esFuturo = dia.fecha > hoyIso;
  const perdidoSeleccionado = dia.fecha < hoyIso && !dia.completado;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[520px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <TopHeader titulo="Mi Ruta" />

      <div className="relative mt-2 px-4">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[22px] font-medium leading-[1.2] text-txt-primary"
        >
          Tu camino de 7 días
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-1 text-[13px] text-txt-secondary"
        >
          <AnimatedCounter value={diasCompletados} />/7 días completados esta semana
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-tertiary/60"
        >
          <motion.div
            className="h-full rounded-full bg-brand-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(diasCompletados / 7) * 100}%` }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          />
        </motion.div>

        <div className="mt-5 flex justify-between gap-1.5">
          {estado.rutaSemana.map((d, i) => {
            const activo = i === seleccionado;
            const hoyDia = d.fecha === hoyIso;
            const perdido = d.fecha < hoyIso && !d.completado;
            return (
              <motion.button
                key={d.fecha}
                type="button"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSeleccionado(i)}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                    activo
                      ? "bg-brand-primary text-txt-inverse"
                      : d.completado
                        ? "bg-brand-primary-soft text-brand-primary"
                        : perdido
                          ? "border border-dashed border-status-warning/50 text-status-warning"
                          : "bg-surface-tertiary/60 text-txt-tertiary"
                  } ${hoyDia && !activo ? "ring-2 ring-brand-primary/50" : ""}`}
                >
                  {d.completado ? <Check className="h-4 w-4" strokeWidth={3} /> : d.dia}
                </span>
                <span className={`text-[10px] font-medium ${activo ? "text-brand-primary" : "text-txt-tertiary"}`}>
                  {d.dia}
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          key={dia.fecha}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative mt-5 overflow-hidden rounded-2xl border border-border-default/40 bg-gradient-to-br from-surface-primary via-surface-primary to-brand-primary-soft/70 p-4 shadow-md"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
            {nombreDia(dia.dia)} {esHoy ? "· Hoy" : esFuturo ? "· Por revelar" : ""}
          </p>
          <p className="mt-1.5 font-display text-[18px] font-medium leading-snug text-txt-primary">
            {esFuturo ? "Esta misión se desbloquea cuando llegue el día" : dia.mision}
          </p>

          {esFuturo ? (
            <div className="mt-4 flex flex-col items-center gap-3 rounded-xl bg-surface-tertiary/50 px-4 py-7 text-center">
              <Lock className="h-5 w-5 text-txt-tertiary" />
              <div>
                <p className="text-[12.5px] font-medium text-txt-secondary">
                  Se desbloquea el {nombreDia(dia.dia)}
                </p>
                <p className="mt-1 text-[12px] text-txt-tertiary">
                  Incluye 1 hábito prioritario y tu lista de alimentos del día
                </p>
              </div>
              <Link
                href="/app"
                className="mt-1 flex h-10 items-center rounded-full bg-brand-primary px-5 text-[13px] font-semibold text-txt-inverse"
              >
                Mientras tanto, ve a Hoy
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-brand-primary-soft p-3">
                <Target className="h-4 w-4 shrink-0 text-brand-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-brand-primary">
                    Hábito prioritario
                  </p>
                  <p className="mt-0.5 text-[13.5px] font-medium text-txt-primary">{dia.habitoPrioritario}</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-brand-primary-soft/70 p-3">
                <p className="flex items-center gap-2 text-[12.5px] font-semibold text-brand-primary">
                  <Utensils className="h-4 w-4" /> Alimentos recomendados
                </p>
                <ul className="mt-2 space-y-1.5">
                  {dia.alimentosRecomendados.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-[13px] text-txt-secondary">
                      <Check className="h-3.5 w-3.5 shrink-0 text-brand-primary" strokeWidth={3} />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 rounded-xl bg-status-error-soft/70 p-3">
                <p className="flex items-center gap-2 text-[12.5px] font-semibold text-status-error">
                  <Ban className="h-4 w-4" /> Alimentos a limitar
                </p>
                <ul className="mt-2 space-y-1.5">
                  {dia.alimentosLimitar.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-[13px] text-txt-secondary">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-error" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {esHoy && !dia.completado && (
                <motion.div whileTap={{ scale: 0.98 }} className="mt-4">
                  <Link
                    href="/app"
                    className="flex h-11 w-full items-center justify-center rounded-full bg-brand-primary text-[14px] font-semibold text-txt-inverse"
                  >
                    Hacer tu revisión de hoy
                  </Link>
                </motion.div>
              )}
              {dia.completado && (
                <p className="mt-4 flex items-center gap-1.5 text-[12.5px] font-medium text-brand-primary">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} /> Día completado
                </p>
              )}
              {perdidoSeleccionado && (
                <p className="mt-4 text-[12.5px] font-medium text-status-warning">
                  Este día pasó sin revisión — no pasa nada, sigamos con la de hoy.
                </p>
              )}
            </>
          )}
        </motion.div>

        {!esFuturo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md"
          >
            <p className="flex items-center gap-2 text-[12.5px] font-semibold text-txt-primary">
              <UtensilsCrossed className="h-4 w-4 text-brand-primary" /> Menú del día
            </p>
            <ul className="mt-3 space-y-2.5">
              <li className="flex items-center gap-3 rounded-xl bg-brand-gold/12 p-2.5 text-[13px] text-txt-secondary">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gold/25 text-txt-primary">
                  <Coffee className="h-4 w-4" />
                </span>
                <span><span className="font-medium text-txt-primary">Desayuno:</span> {dia.menu.desayuno}</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-brand-primary-soft/60 p-2.5 text-[13px] text-txt-secondary">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                  <Soup className="h-4 w-4" />
                </span>
                <span><span className="font-medium text-txt-primary">Almuerzo:</span> {dia.menu.almuerzo}</span>
              </li>
              <li className="flex items-center gap-3 rounded-xl bg-brand-secondary/12 p-2.5 text-[13px] text-txt-secondary">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-secondary/20 text-brand-secondary">
                  <Utensils className="h-4 w-4" />
                </span>
                <span><span className="font-medium text-txt-primary">Cena:</span> {dia.menu.cena}</span>
              </li>
            </ul>

            <div className="mt-4 flex items-start gap-3 rounded-xl bg-brand-secondary/12 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-secondary/20 text-brand-secondary">
                {(() => {
                  const IconoMovimiento = ICONO_MOVIMIENTO[dia.movimiento.tipo];
                  return <IconoMovimiento className="h-4 w-4" />;
                })()}
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">
                  Movimiento del día · {dia.movimiento.duracionMin} min · por Maru
                </p>
                <p className="mt-0.5 text-[13.5px] font-medium text-txt-primary">{dia.movimiento.titulo}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-txt-secondary">
                  {dia.movimiento.descripcion}
                </p>
                {dia.movimiento.videoUrl && esArchivoDeVideo(dia.movimiento.videoUrl) ? (
                  <video
                    key={dia.movimiento.videoUrl}
                    controls
                    playsInline
                    preload="metadata"
                    className="mt-2.5 w-full rounded-lg bg-surface-tertiary"
                  >
                    <source src={dia.movimiento.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  dia.movimiento.videoUrl && (
                    <a
                      href={dia.movimiento.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-primary"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Ver rutina en video
                    </a>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}

        {!esFuturo && <BibliotecaYoga />}

        <Link
          href="/app/ruta/compras"
          className="mt-4 flex items-center justify-between rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <ShoppingBasket className="h-4 w-4" />
            </span>
            <span className="text-[13.5px] font-medium text-txt-primary">Lista de compras de la semana</span>
          </div>
          <span className="text-[12px] font-semibold text-brand-primary">Ver →</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 flex items-center gap-4 rounded-2xl border border-border-default/40 bg-gradient-to-br from-surface-primary to-brand-accent-soft/50 p-4 shadow-md"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
              Tu racha
            </p>
            <p className="mt-0.5 text-[13.5px] font-medium text-txt-primary">
              <AnimatedCounter value={estado.rachaDias} /> días seguidos con tu revisión diaria
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
