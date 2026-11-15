"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BatteryLow,
  ChevronLeft,
  Cookie,
  Flame,
  HelpCircle,
  MessagesSquare,
  Moon,
  Send,
  ShieldAlert,
  Square,
  Utensils,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TopHeader } from "@/components/app/interna/TopHeader";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { PROTOCOLOS_EVA, recomendacionParaCheckin } from "@/lib/app/engine";
import { checkinDeHoy } from "@/lib/app/store";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cargarEstadoSupabase } from "@/lib/supabase/queries";
import type { Checkin, EstadoDia } from "@/lib/app/types";

type MensajeChat = { role: "user" | "assistant"; content: string };

const ICONOS: Record<string, LucideIcon> = {
  inflamada: Flame,
  "dormi-mal": Moon,
  antojos: Cookie,
  "no-se-que-cenar": Utensils,
  "sin-energia": BatteryLow,
};

const CAMPO_A_PROTOCOLO: Partial<Record<keyof EstadoDia, string>> = {
  inflamacion: "inflamada",
  sueno: "dormi-mal",
  antojos: "antojos",
  digestion: "no-se-que-cenar",
  energia: "sin-energia",
};

export default function EvaPage() {
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [recomendadoId, setRecomendadoId] = useState<string | null>(null);
  const [checkinHoy, setCheckinHoy] = useState<Checkin | null>(null);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [input, setInput] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [textoConError, setTextoConError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const finChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = crearClienteNavegador();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const estado = await cargarEstadoSupabase(supabase, data.user.id);
      if (!estado) return;
      const checkin = checkinDeHoy(estado);
      if (checkin) {
        setCheckinHoy(checkin);
        const rec = recomendacionParaCheckin(checkin);
        setRecomendadoId(CAMPO_A_PROTOCOLO[rec.campoClave] ?? null);
      }
    });
  }, []);

  useEffect(() => {
    finChatRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [mensajes]);

  async function enviarMensaje(texto: string) {
    const contenido = texto.trim();
    if (!contenido || enviando) return;

    const historial: MensajeChat[] = [...mensajes, { role: "user", content: contenido }];
    setMensajes([...historial, { role: "assistant", content: "" }]);
    setInput("");
    setEnviando(true);
    setTextoConError(null);
    const controlador = new AbortController();
    abortRef.current = controlador;

    try {
      const res = await fetch("/api/eva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensajes: historial, checkinHoy }),
        signal: controlador.signal,
      });

      if (!res.body) throw new Error("Sin respuesta");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        setMensajes((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = { role: "assistant", content: acumulado };
          return copia;
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // La usuaria detuvo la respuesta: se conserva lo que ya llegó.
        setMensajes((prev) => {
          const copia = [...prev];
          const ultimo = copia[copia.length - 1];
          if (ultimo && ultimo.role === "assistant" && !ultimo.content) {
            copia[copia.length - 1] = { role: "assistant", content: "Respuesta detenida." };
          }
          return copia;
        });
      } else {
        setTextoConError(contenido);
        setMensajes((prev) => {
          const copia = [...prev];
          copia[copia.length - 1] = {
            role: "assistant",
            content: "No pude responder ahora mismo. Revisa tu conexión y toca Reintentar.",
          };
          return copia;
        });
      }
    } finally {
      abortRef.current = null;
      setEnviando(false);
    }
  }

  function reintentar() {
    if (!textoConError) return;
    const texto = textoConError;
    setMensajes((prev) => prev.slice(0, -2));
    setTextoConError(null);
    enviarMensaje(texto);
  }

  const protocolo = PROTOCOLOS_EVA.find((p) => p.id === seleccionado);
  const preguntas = recomendadoId
    ? [
        ...PROTOCOLOS_EVA.filter((p) => p.id === recomendadoId),
        ...PROTOCOLOS_EVA.filter((p) => p.id !== recomendadoId),
      ]
    : PROTOCOLOS_EVA;

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <TopHeader titulo="EVA" />

      <div className="relative mt-2 px-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-txt-inverse">
            <MessagesSquare className="h-[18px] w-[18px]" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-[19px] font-medium leading-[1.25] text-txt-primary">
              Háblame como le hablarías a Maru
            </h1>
            <p className="mt-1 text-[13px] leading-relaxed text-txt-secondary">
              Pregúntame lo que sea sobre tu alimentación, tus síntomas o cómo te sientes hoy.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {seleccionado === "otra" ? (
            <motion.div
              key="otra"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5"
            >
              <button
                type="button"
                onClick={() => setSeleccionado(null)}
                className="flex h-9 items-center gap-1 text-[13px] font-medium text-txt-secondary"
              >
                <ChevronLeft className="h-4 w-4" /> Otra pregunta
              </button>

              <div className="mt-2 flex max-h-[52vh] min-h-[220px] flex-col gap-3 overflow-y-auto rounded-xl border border-border-default/60 bg-surface-primary p-4">
                {mensajes.length === 0 ? (
                  <p className="text-[13.5px] leading-relaxed text-txt-secondary">
                    Cuéntame qué te pasa — cómo te sientes, qué comiste, qué te preocupa. Te
                    respondo con el mismo criterio de Maru.
                  </p>
                ) : (
                  mensajes.map((m, i) => (
                    <div
                      key={i}
                      className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                        m.role === "user"
                          ? "ml-auto bg-brand-primary text-txt-inverse"
                          : "bg-surface-tertiary/60 text-txt-primary"
                      }`}
                    >
                      {m.content || (
                        <span className="inline-flex gap-1 py-1">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-txt-tertiary" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-txt-tertiary [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-txt-tertiary [animation-delay:300ms]" />
                        </span>
                      )}
                    </div>
                  ))
                )}
                <div ref={finChatRef} />
              </div>
              {textoConError && (
                <button
                  type="button"
                  onClick={reintentar}
                  className="mt-2 flex h-11 w-full items-center justify-center rounded-full border border-border-strong text-[13.5px] font-medium text-brand-primary"
                >
                  Reintentar
                </button>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  enviarMensaje(input);
                }}
                className="mt-2.5 flex items-center gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe lo que quieras..."
                  disabled={enviando}
                  maxLength={800}
                  className="h-11 flex-1 rounded-full border border-border-default/60 bg-surface-primary px-4 text-[13.5px] text-txt-primary outline-none focus:border-brand-primary/50 disabled:opacity-60"
                />
                {enviando ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    aria-label="Detener respuesta"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border-strong text-brand-primary"
                  >
                    <Square className="h-4 w-4" fill="currentColor" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    aria-label="Enviar mensaje"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-txt-inverse disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </form>
            </motion.div>
          ) : !protocolo ? (
            <motion.div
              key="preguntas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-5 flex flex-col gap-2.5"
            >
              {preguntas.map((p, i) => {
                const Icon = ICONOS[p.id] ?? HelpCircle;
                const recomendado = p.id === recomendadoId;
                return (
                  <motion.button
                    key={p.id}
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSeleccionado(p.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left shadow-sm ${
                      recomendado
                        ? "border-brand-primary/40 bg-brand-primary-soft"
                        : "border-border-default/60 bg-surface-primary"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand-primary" />
                    <div className="flex-1">
                      <span className="text-[14px] font-medium text-txt-primary">{p.pregunta}</span>
                      {recomendado && (
                        <p className="text-[12px] font-semibold text-brand-primary">
                          Según tu revisión de hoy
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}

              <motion.button
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: preguntas.length * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSeleccionado("otra")}
                className="order-first flex min-h-14 w-full items-center gap-3 rounded-xl bg-brand-primary px-4 py-3 text-left text-txt-inverse shadow-md"
              >
                <MessagesSquare className="h-4 w-4 shrink-0" />
                <div>
                  <span className="block text-[14.5px] font-semibold text-txt-inverse">Escríbeme lo que quieras</span>
                  <span className="block text-[13px] text-txt-inverse/80">Como un chat — pregunta cualquier cosa, sin opciones fijas</span>
                </div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="protocolo"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5"
            >
              <button
                type="button"
                onClick={() => setSeleccionado(null)}
                className="flex h-9 items-center gap-1 text-[13px] font-medium text-txt-secondary"
              >
                <ChevronLeft className="h-4 w-4" /> Otra pregunta
              </button>

              <div className="mt-2 rounded-xl border border-brand-primary/30 bg-brand-primary-soft p-4">
                <p className="text-[12px] font-semibold uppercase tracking-[0.05em] text-brand-primary">
                  {protocolo.pregunta}
                </p>
                <ol className="mt-3 space-y-3">
                  {protocolo.pasos.map((paso, i) => (
                    <motion.li
                      key={paso}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="flex items-start gap-2.5"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[12px] font-bold text-txt-inverse">
                        {i + 1}
                      </span>
                      <span className="text-[13.5px] leading-relaxed text-txt-primary">{paso}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-5 flex items-center gap-1.5 text-[12px] text-txt-secondary">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
          EVA te acompaña, no reemplaza una consulta médica.
        </p>
      </div>
    </div>
  );
}
