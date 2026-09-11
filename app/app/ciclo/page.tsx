"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Droplet, Heart, Lightbulb, Scale, Sparkles } from "lucide-react";
import { TopHeader } from "@/components/app/interna/TopHeader";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { RegistroCicloCard } from "@/components/app/interna/RegistroCicloCard";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cargarEstadoSupabase, obtenerRegistrosCiclo } from "@/lib/supabase/queries";
import { obtenerMedidas, registrarMedida } from "@/lib/supabase/retosQueries";
import { insightsCiclo, insightsPeso, promedioDiasEntreCiclos } from "@/lib/app/engine";
import { isoFecha, mesCalendario, nombreMes } from "@/lib/app/dates";
import type { Checkin, RegistroCiclo } from "@/lib/app/types";

const MENSAJES_SANGRADO = [
  "Tómalo con calma hoy — tu cuerpo está trabajando, no tienes que rendir al 100%.",
  "Bajar el ritmo hoy no es flojera, es cuidarte. Vas bien.",
  "Un día a la vez. Escucha lo que tu cuerpo te pide hoy.",
];
const MENSAJES_SIN_DATO = [
  "Cada registro suma — entre más completes, mejor te va a conocer esta pantalla.",
  "No hay una forma correcta de vivir tu ciclo a los 40+. Solo la tuya, y eso es información valiosa.",
  "Seguir tu propio patrón (sin compararte con nadie) es un acto de cuidado.",
];

function mensajeDelDia(hayRegistroHoy: boolean, sangradoHoy: boolean): string {
  const lista = sangradoHoy ? MENSAJES_SANGRADO : MENSAJES_SIN_DATO;
  const indice = new Date().getDate() % lista.length;
  return hayRegistroHoy || !sangradoHoy ? lista[indice] : lista[0];
}

export default function CicloPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [registros, setRegistros] = useState<RegistroCiclo[]>([]);
  const [medidas, setMedidas] = useState<{ fecha: string; pesoKg: number | null; cinturaCm: number | null }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cursor, setCursor] = useState(() => {
    const hoy = new Date();
    return { anio: hoy.getFullYear(), mes: hoy.getMonth() };
  });
  const [diaSeleccionado, setDiaSeleccionado] = useState<string | null>(null);
  const [peso, setPeso] = useState("");
  const [cintura, setCintura] = useState("");
  const [guardandoMedida, setGuardandoMedida] = useState(false);

  async function cargarTodo(uid: string) {
    const supabase = crearClienteNavegador();
    const [estado, regs, meds] = await Promise.all([
      cargarEstadoSupabase(supabase, uid),
      obtenerRegistrosCiclo(supabase, uid),
      obtenerMedidas(supabase, uid),
    ]);
    if (estado) setCheckins(estado.checkins);
    setRegistros(regs);
    setMedidas(meds);
    setCargando(false);
  }

  useEffect(() => {
    const supabase = crearClienteNavegador();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      await cargarTodo(data.user.id);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hoyIso = isoFecha(new Date());
  const registroPorFecha = useMemo(() => new Map(registros.map((r) => [r.fecha, r])), [registros]);
  const checkinPorFecha = useMemo(() => new Map(checkins.map((c) => [c.fecha, c])), [checkins]);
  const dias = useMemo(() => mesCalendario(cursor.anio, cursor.mes), [cursor]);

  const diasSangradoMes = useMemo(
    () =>
      registros.filter((r) => {
        const f = new Date(r.fecha);
        return r.sangrado && f.getFullYear() === cursor.anio && f.getMonth() === cursor.mes;
      }).length,
    [registros, cursor],
  );

  const promedioCiclo = useMemo(() => promedioDiasEntreCiclos(registros), [registros]);
  const insights = useMemo(
    () => [...insightsCiclo(checkins, registros), ...insightsPeso(registros, medidas)],
    [checkins, registros, medidas],
  );

  const registroHoy = registroPorFecha.get(hoyIso) ?? null;
  const mensaje = mensajeDelDia(!!registroHoy, registroHoy?.sangrado ?? false);
  const ultimaMedida = medidas.length > 0 ? medidas[medidas.length - 1] : null;

  async function guardarMedida() {
    if (!userId) return;
    const pesoNum = peso ? Number(peso) : undefined;
    const cinturaNum = cintura ? Number(cintura) : undefined;
    if (!pesoNum && !cinturaNum) return;
    setGuardandoMedida(true);
    const supabase = crearClienteNavegador();
    await registrarMedida(supabase, userId, hoyIso, { pesoKg: pesoNum, cinturaCm: cinturaNum });
    await cargarTodo(userId);
    setPeso("");
    setCintura("");
    setGuardandoMedida(false);
  }

  function cambiarMes(delta: number) {
    setDiaSeleccionado(null);
    setCursor((c) => {
      const d = new Date(c.anio, c.mes + delta, 1);
      return { anio: d.getFullYear(), mes: d.getMonth() };
    });
  }

  if (cargando) {
    return (
      <div className="relative min-h-dvh">
        <TopHeader titulo="Tu ciclo" />
        <div className="mt-6 space-y-3 px-4">
          <div className="h-72 animate-pulse rounded-2xl bg-surface-tertiary/50" />
          <div className="h-32 animate-pulse rounded-xl bg-surface-tertiary/50" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden pb-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <TopHeader titulo="Tu ciclo" />

      <div className="relative mt-2 px-4">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[13px] text-txt-secondary"
        >
          Un registro de lo que YA notaste — sin calendario predictivo, porque a los 40+ el ciclo
          suele cambiar y eso es normal.
        </motion.p>

        {/* Palabra de aliento */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-3 flex items-start gap-2.5 rounded-xl bg-brand-accent-soft p-3.5"
        >
          <Heart className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
          <p className="text-[13px] leading-relaxed text-txt-primary">{mensaje}</p>
        </motion.div>

        {/* Calendario del mes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-4 rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md"
        >
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              aria-label="Mes anterior"
              className="flex h-8 w-8 items-center justify-center rounded-full text-txt-tertiary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-[13.5px] font-semibold text-txt-primary">{nombreMes(cursor.anio, cursor.mes)}</p>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              aria-label="Mes siguiente"
              disabled={cursor.anio === new Date().getFullYear() && cursor.mes === new Date().getMonth()}
              className="flex h-8 w-8 items-center justify-center rounded-full text-txt-tertiary disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-txt-tertiary">
            {["L", "M", "X", "J", "V", "S", "D"].map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>

          <div className="mt-1.5 grid grid-cols-7 gap-1">
            {dias.map((d, i) => {
              if (!d) return <span key={`vacio-${i}`} />;
              const iso = isoFecha(d);
              const registro = registroPorFecha.get(iso);
              const tieneCheckin = checkinPorFecha.has(iso);
              const esHoy = iso === hoyIso;
              const esFuturo = iso > hoyIso;
              const intensidadOpacidad = registro?.intensidad === 3 ? "1" : registro?.intensidad === 2 ? "0.7" : "0.45";

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={esFuturo}
                  onClick={() => setDiaSeleccionado(iso)}
                  className={`relative flex h-9 flex-col items-center justify-center rounded-full text-[11.5px] transition-colors disabled:opacity-30 ${
                    diaSeleccionado === iso
                      ? "bg-brand-primary text-txt-inverse"
                      : registro?.sangrado
                        ? "text-txt-inverse"
                        : "text-txt-secondary hover:bg-surface-secondary/60"
                  } ${esHoy && diaSeleccionado !== iso ? "ring-2 ring-brand-primary/50" : ""}`}
                  style={
                    registro?.sangrado && diaSeleccionado !== iso
                      ? { backgroundColor: `color-mix(in srgb, var(--brand-accent) ${Number(intensidadOpacidad) * 100}%, transparent)` }
                      : undefined
                  }
                >
                  {d.getDate()}
                  {tieneCheckin && !registro?.sangrado && (
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-brand-primary/60" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-4 text-[11px] text-txt-tertiary">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-brand-accent" /> Sangrado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary/60" /> Check-in ese día
            </span>
          </div>
        </motion.div>

        {/* Panel del día seleccionado */}
        {diaSeleccionado && userId && (
          <RegistroCicloCard
            userId={userId}
            fecha={diaSeleccionado}
            esHoy={false}
            registroDelDia={registroPorFecha.get(diaSeleccionado) ?? null}
            onGuardado={() => {
              cargarTodo(userId);
              setDiaSeleccionado(null);
            }}
            onCancelar={() => setDiaSeleccionado(null)}
          />
        )}

        {/* Resumen del mes */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4 grid grid-cols-2 gap-3"
        >
          <div className="rounded-xl border border-border-default/60 bg-surface-primary p-3.5 text-center shadow-sm">
            <p className="font-display text-[22px] font-medium text-txt-primary">{diasSangradoMes}</p>
            <p className="mt-0.5 text-[11px] text-txt-tertiary">Días de sangrado este mes</p>
          </div>
          <div className="rounded-xl border border-border-default/60 bg-surface-primary p-3.5 text-center shadow-sm">
            <p className="font-display text-[22px] font-medium text-txt-primary">
              {promedioCiclo ?? "—"}
            </p>
            <p className="mt-0.5 text-[11px] text-txt-tertiary">
              {promedioCiclo ? "Días promedio entre tus períodos (histórico)" : "Aún sin suficiente historial"}
            </p>
          </div>
        </motion.div>

        {/* Correlaciones reales */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 space-y-2"
          >
            {insights.map((texto) => (
              <div key={texto} className="flex items-start gap-2.5 rounded-xl bg-brand-primary-soft p-3.5">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" />
                <p className="text-[13px] leading-relaxed text-txt-primary">{texto}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Peso y talla */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md"
        >
          <p className="flex items-center gap-2 text-[12.5px] font-semibold text-txt-primary">
            <Scale className="h-4 w-4 text-brand-primary" /> Peso y talla
          </p>
          <p className="mt-0.5 text-[11.5px] text-txt-tertiary">
            {ultimaMedida?.pesoKg
              ? `Último registro: ${ultimaMedida.pesoKg} kg el ${ultimaMedida.fecha}`
              : "Opcional — solo si quieres ver cómo se relaciona con tu ciclo."}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Peso (kg)"
              className="h-11 flex-1 rounded-full border border-border-default bg-surface-secondary/40 px-4 text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
            />
            <input
              type="number"
              inputMode="decimal"
              value={cintura}
              onChange={(e) => setCintura(e.target.value)}
              placeholder="Cintura (cm)"
              className="h-11 flex-1 rounded-full border border-border-default bg-surface-secondary/40 px-4 text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
            />
          </div>
          <button
            type="button"
            onClick={guardarMedida}
            disabled={guardandoMedida || (!peso && !cintura)}
            className="mt-3 flex h-10 w-full items-center justify-center rounded-full bg-brand-primary text-[13px] font-semibold text-txt-inverse disabled:opacity-50"
          >
            {guardandoMedida ? "Guardando…" : "Guardar de hoy"}
          </button>
        </motion.div>

        {/* Conexión con Mi Ruta */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Link
            href="/app/ruta"
            className="mt-4 flex items-center justify-between rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[13px] font-medium text-txt-primary">Ve tu Ruta de hoy</p>
                <p className="text-[11.5px] text-txt-tertiary">Ajusta lo que necesites según cómo te sientes</p>
              </div>
            </div>
            <span className="shrink-0 text-[12px] font-semibold text-brand-primary">Ir →</span>
          </Link>
        </motion.div>

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-txt-tertiary">
          <Droplet className="h-3 w-3" /> Toca cualquier día pasado del calendario para registrarlo o editarlo.
        </p>
      </div>
    </div>
  );
}
