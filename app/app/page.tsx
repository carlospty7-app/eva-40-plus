"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Check, Cookie, Flame, Mic, Moon, Pencil, Square, Users, Utensils, Zap } from "lucide-react";
import { TopHeader } from "@/components/app/interna/TopHeader";
import { EscalaCheckin } from "@/components/app/interna/EscalaCheckin";
import { CelebracionDiaria } from "@/components/app/interna/CelebracionDiaria";
import { CelebracionRacha } from "@/components/app/interna/CelebracionRacha";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { ScoreRing } from "@/components/app/ui/ScoreRing";
import { checkinDeHoy, diaRutaDeHoy } from "@/lib/app/store";
import { computeScoreDia, labelCampo, recomendacionParaCheckin } from "@/lib/app/engine";
import { mensajeDiarioAleatorio } from "@/lib/app/mensajesMotivacionales";
import { isoFecha } from "@/lib/app/dates";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cargarEstadoSupabase, registrarCheckinHoy as registrarCheckinSupabase } from "@/lib/supabase/queries";
import type { EstadoApp, EstadoDia } from "@/lib/app/types";

/** Tipos mínimos para la Web Speech API (no viene en el lib.dom.d.ts de TypeScript). */
type SpeechRecognitionEventLike = { results: { [i: number]: { [j: number]: { transcript: string } } } };
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const VALOR_INICIAL: EstadoDia = {
  inflamacion: 3,
  energia: 3,
  sueno: 3,
  estres: 3,
  antojos: 3,
  digestion: 3,
};

type Fase = "cargando" | "form" | "analizando" | "resultado";

export default function HoyPage() {
  const [estado, setEstado] = useState<EstadoApp | null>(null);
  const [fase, setFase] = useState<Fase>("cargando");
  const [valores, setValores] = useState<EstadoDia>(VALOR_INICIAL);
  const [notas, setNotas] = useState("");
  const [grabando, setGrabando] = useState(false);
  const reconocimientoRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const [dictadoDisponible, setDictadoDisponible] = useState(false);
  const [resultadoHoy, setResultadoHoy] = useState<EstadoDia | null>(null);
  const [editando, setEditando] = useState(false);
  const [avisoGuardado, setAvisoGuardado] = useState(false);
  const [celebracion, setCelebracion] = useState<"ninguna" | "diaria" | "racha">("ninguna");
  const [mensajeDiario, setMensajeDiario] = useState(mensajeDiarioAleatorio());
  const [semanaCompletaHoy, setSemanaCompletaHoy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkinsHoyComunidad, setCheckinsHoyComunidad] = useState<number | null>(null);

  useEffect(() => {
    // Dato real y agregado (nunca de una usuaria en particular) — solo se muestra si hay más de
    // una persona hoy, para no decir "1 mujer" cuando esa "1" es ella misma.
    fetch("/api/comunidad")
      .then((r) => r.json())
      .then((d) => setCheckinsHoyComunidad(typeof d.checkinsHoy === "number" ? d.checkinsHoy : null))
      .catch(() => setCheckinsHoyComunidad(null));
  }, []);

  useEffect(() => {
    const supabase = crearClienteNavegador();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return; // el middleware ya redirige a /login antes de llegar aquí
      setUserId(data.user.id);
      const cargado = await cargarEstadoSupabase(supabase, data.user.id);
      if (!cargado) return;
      setEstado(cargado);
      const yaExiste = checkinDeHoy(cargado);
      if (yaExiste) {
        setResultadoHoy(yaExiste);
        setNotas(yaExiste.notas ?? "");
        setFase("resultado");
      } else {
        setFase("form");
      }
    });
  }, []);

  useEffect(() => {
    const Ctor = (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
    setDictadoDisponible(!!Ctor);
  }, []);

  function alternarDictado() {
    if (grabando) {
      reconocimientoRef.current?.stop();
      return;
    }
    const Ctor = (window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor })
      .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;
    if (!Ctor) return;

    const reconocimiento = new Ctor();
    reconocimiento.lang = "es-ES";
    reconocimiento.continuous = true;
    reconocimiento.interimResults = false;
    reconocimiento.onresult = (e) => {
      let textoNuevo = "";
      for (let i = 0; i < Object.keys(e.results).length; i++) {
        textoNuevo += e.results[i][0].transcript + " ";
      }
      setNotas((prev) => (prev.trim() ? `${prev.trim()} ${textoNuevo.trim()}` : textoNuevo.trim()));
    };
    reconocimiento.onend = () => setGrabando(false);
    reconocimiento.onerror = () => setGrabando(false);
    reconocimientoRef.current = reconocimiento;
    reconocimiento.start();
    setGrabando(true);
  }

  async function confirmarCheckin() {
    const eraEdicion = editando;
    setFase("analizando");
    if (!estado || !userId) return;

    const supabase = crearClienteNavegador();
    const hoy = isoFecha(new Date());
    const diasAntes = estado.rutaSemana.filter((d) => d.completado).length;
    const { ok } = await registrarCheckinSupabase(supabase, userId, hoy, valores, notas);
    const nuevo = await cargarEstadoSupabase(supabase, userId);
    if (!nuevo) return;
    const diasDespues = nuevo.rutaSemana.filter((d) => d.completado).length;

    setEstado(nuevo);
    setResultadoHoy(valores);
    setAvisoGuardado(!ok);
    setEditando(false);

    // Se espera un poco antes de mostrar el resultado — misma sensación de "estamos calculando
    // tu prioridad" que antes, ahora sobre datos reales en vez de un timeout artificial vacío.
    window.setTimeout(() => {
      if (eraEdicion) {
        setFase("resultado");
        return;
      }
      setSemanaCompletaHoy(diasDespues === 7 && diasAntes < 7);
      setMensajeDiario(mensajeDiarioAleatorio());
      setCelebracion("diaria");
      setFase("resultado");
    }, 400);
  }

  if (!estado || fase === "cargando") {
    return (
      <div className="relative min-h-dvh">
        <TopHeader titulo="EVA 40+" logo />
        <div className="mt-6 space-y-3 px-4">
          <div className="h-24 animate-pulse rounded-xl bg-surface-tertiary/50" />
          <div className="h-40 animate-pulse rounded-xl bg-surface-tertiary/50" />
        </div>
      </div>
    );
  }

  const misionHoy = diaRutaDeHoy(estado);
  const recomendacion = resultadoHoy ? recomendacionParaCheckin(resultadoHoy) : null;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[560px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <TopHeader titulo="EVA 40+" logo />

      <div className="relative mt-2 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-medium leading-[1.2] text-txt-primary">
              Hola, sigamos hoy
            </h1>
            <p className="mt-1 text-[13px] text-txt-secondary">
              Enfocada en {estado.perfil.dolorLabel}
            </p>
            {checkinsHoyComunidad !== null && checkinsHoyComunidad >= 2 && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-txt-tertiary">
                <Users className="h-3.5 w-3.5 shrink-0" />
                Hoy, {checkinsHoyComunidad} mujeres ya hicieron su revisión — no estás sola en esto.
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-accent-soft py-1.5 pl-2 pr-3">
            <Flame className="h-4 w-4 text-brand-accent" />
            <span className="text-[13px] font-semibold text-txt-primary">{estado.rachaDias}</span>
          </div>
        </div>

        <Link href="/app/ruta" className="mt-4 flex justify-between gap-1">
          {estado.rutaSemana.map((d) => {
            const hoyDia = d.fecha === isoFecha(new Date());
            return (
              <span
                key={d.fecha}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[10.5px] font-semibold ${
                  d.completado
                    ? "bg-brand-primary-soft text-brand-primary"
                    : "bg-surface-tertiary/60 text-txt-tertiary"
                } ${hoyDia ? "ring-2 ring-brand-primary/50" : ""}`}
              >
                {d.completado ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : d.dia}
              </span>
            );
          })}
        </Link>

        <AnimatePresence mode="wait">
          {fase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="relative mt-5 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm"
            >
              <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
                Revisión rápida de 60 segundos
              </p>
              <p className="mt-1 text-[12px] text-txt-tertiary">
                Esto nos ayuda a encontrar tu prioridad de hoy.
              </p>

              <div className="mt-3">
                <label className="text-[12px] font-medium text-txt-secondary" htmlFor="notas-checkin">
                  ¿Cómo te sientes hoy y qué te gustaría lograr? (opcional)
                </label>
                <div className="relative mt-1.5">
                  <textarea
                    id="notas-checkin"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Escribe con tus palabras, o dicta con el micrófono..."
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-border-default/60 bg-surface-primary p-3 pr-11 text-[13px] leading-relaxed text-txt-primary outline-none focus:border-brand-primary/50"
                  />
                  {dictadoDisponible && (
                    <button
                      type="button"
                      onClick={alternarDictado}
                      aria-label={grabando ? "Detener dictado" : "Dictar por voz"}
                      className={`absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full ${
                        grabando ? "bg-status-warning text-txt-inverse" : "bg-brand-primary-soft text-brand-primary"
                      }`}
                    >
                      {grabando ? <Square className="h-3 w-3" /> : <Mic className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 divide-y divide-border-default/60">
                {[
                  {
                    icon: Flame,
                    label: "Inflamación",
                    textos: ["Nada", "Poca", "Media", "Bastante", "Mucha"] as const,
                    campo: "inflamacion" as const,
                  },
                  {
                    icon: Zap,
                    label: "Energía",
                    textos: ["Muy baja", "Baja", "Media", "Alta", "Muy alta"] as const,
                    campo: "energia" as const,
                  },
                  {
                    icon: Moon,
                    label: "Sueño de anoche",
                    textos: ["Muy mal", "Mal", "Regular", "Bien", "Excelente"] as const,
                    campo: "sueno" as const,
                  },
                  {
                    icon: Brain,
                    label: "Estrés",
                    textos: ["Nada", "Poco", "Medio", "Bastante", "Mucho"] as const,
                    campo: "estres" as const,
                  },
                  {
                    icon: Cookie,
                    label: "Antojos",
                    textos: ["Nada", "Pocos", "Medios", "Bastantes", "Muchos"] as const,
                    campo: "antojos" as const,
                  },
                  {
                    icon: Utensils,
                    label: "Digestión",
                    textos: ["Muy mal", "Mal", "Regular", "Bien", "Excelente"] as const,
                    campo: "digestion" as const,
                  },
                ].map((fila, i) => (
                  <motion.div
                    key={fila.campo}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <EscalaCheckin
                      icon={fila.icon}
                      label={fila.label}
                      textos={[...fila.textos]}
                      valor={valores[fila.campo]}
                      onChange={(v) => setValores((s) => ({ ...s, [fila.campo]: v }))}
                    />
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                <TapButton onClick={confirmarCheckin}>Ver mi recomendación de hoy</TapButton>
                {editando && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditando(false);
                      setFase("resultado");
                    }}
                    className="flex h-9 w-full items-center justify-center text-[13px] font-medium text-txt-tertiary"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {fase === "analizando" && (
            <motion.div
              key="analizando"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative mt-5 flex flex-col items-center justify-center rounded-xl border border-border-default/60 bg-surface-primary p-8 text-center shadow-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 rounded-full border-2 border-brand-primary-soft border-t-brand-primary"
              />
              <p className="mt-3 text-[13px] text-txt-secondary">Buscando tu prioridad de hoy…</p>
            </motion.div>
          )}

          {fase === "resultado" && recomendacion && (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mt-5 space-y-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex items-center gap-4 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm"
              >
                <ScoreRing value={computeScoreDia(resultadoHoy!)} size={76} thickness={8} color="accent" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
                    Tu puntaje de hoy
                  </p>
                  <p className="mt-1 text-[13px] text-txt-secondary">
                    Lo que más te pesó: <span className="font-medium text-txt-primary">{labelCampo(recomendacion.campoClave)}</span>
                  </p>
                </div>
              </motion.div>

              {avisoGuardado && (
                <div className="flex items-center justify-between gap-3 rounded-lg bg-status-warning-soft px-3 py-2">
                  <p className="text-[12px] text-status-warning">
                    No pudimos guardar tu revisión en este dispositivo — si recargas podrías
                    perderlo.
                  </p>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!estado || !resultadoHoy || !userId) return;
                      const supabase = crearClienteNavegador();
                      const { ok } = await registrarCheckinSupabase(
                        supabase,
                        userId,
                        isoFecha(new Date()),
                        resultadoHoy,
                        notas,
                      );
                      const nuevo = await cargarEstadoSupabase(supabase, userId);
                      if (nuevo) setEstado(nuevo);
                      setAvisoGuardado(!ok);
                    }}
                    className="shrink-0 text-[12px] font-semibold text-status-warning underline"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.08 }}
                className="relative overflow-hidden rounded-xl border border-brand-primary/30 bg-brand-primary-soft p-4"
              >
                <div className="pointer-events-none absolute inset-0 opacity-70">
                  <BotanicalGlow variant="light" />
                </div>
                <div className="relative flex items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary text-txt-inverse">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.05em] text-brand-primary">
                    Tu acción de hoy
                  </p>
                </div>
                <p className="relative mt-3 font-display text-[19px] font-medium leading-snug text-txt-primary">
                  {recomendacion.accionPrincipal}
                </p>
                <p className="relative mt-2 text-[13px] leading-relaxed text-txt-secondary">
                  {recomendacion.recomendacionInmediata}
                </p>
              </motion.div>

              <button
                type="button"
                onClick={() => {
                  setValores(resultadoHoy!);
                  setEditando(true);
                  setFase("form");
                }}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-txt-tertiary"
              >
                <Pencil className="h-3.5 w-3.5" /> Editar mi revisión de hoy
              </button>

              {misionHoy && (
                <Link
                  href="/app/ruta"
                  className="flex items-center justify-between rounded-xl bg-surface-tertiary/50 p-4"
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
                      Tu misión de hoy en Mi Ruta
                    </p>
                    <p className="mt-1 text-[13.5px] font-medium text-txt-primary">
                      {misionHoy.habitoPrioritario}
                    </p>
                  </div>
                  <span className="text-[12px] font-semibold text-brand-primary">Ver ruta →</span>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {celebracion === "diaria" && (
        <CelebracionDiaria
          titulo={mensajeDiario.titulo}
          texto={mensajeDiario.texto}
          onContinuar={() => setCelebracion(semanaCompletaHoy ? "racha" : "ninguna")}
        />
      )}
      {celebracion === "racha" && (
        <CelebracionRacha dias={estado.rachaDias} onContinuar={() => setCelebracion("ninguna")} />
      )}
    </div>
  );
}
