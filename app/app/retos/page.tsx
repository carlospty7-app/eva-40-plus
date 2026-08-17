"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, ChevronDown, ChevronUp, Minus, Sparkles, Trophy } from "lucide-react";
import { TopHeader } from "@/components/app/interna/TopHeader";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { TapButton } from "@/components/app/onboarding/TapButton";
import { CuestionarioSalud } from "@/components/app/interna/CuestionarioSalud";
import { MenuDelDiaReto, MovimientoDelReto, ListaComprasReto } from "@/components/app/interna/RetoWidgets";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { cargarEstadoSupabase } from "@/lib/supabase/queries";
import {
  cerrarReto,
  extenderReto,
  iniciarReto,
  obtenerCheckinsEnRango,
  obtenerFlagsSalud,
  obtenerRegistrosReto,
  obtenerRetoActivo,
  guardarFlagsSalud,
  registrarCumplimientoReto,
  type CumplimientoReto,
  type FlagsSalud,
  type RetoActivoRow,
} from "@/lib/supabase/retosQueries";
import { RETOS, obtenerReto, FAMILIA_LABEL, type RetoDef } from "@/lib/app/retos";
import {
  compararResultadosReto,
  decidirSiguientePaso,
  recomendarReto,
  DECISION_TEXTO,
  type ResultadoIndicador,
} from "@/lib/app/retosEngine";
import { isoFecha, formatoCorto } from "@/lib/app/dates";
import { labelCampo } from "@/lib/app/engine";
import type { EstadoApp, Checkin } from "@/lib/app/types";

function diasEntre(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 60 * 60 * 1000)) + 1;
}

export default function RetosPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [estado, setEstado] = useState<EstadoApp | null>(null);
  const [flagsSalud, setFlagsSalud] = useState<(FlagsSalud & { completado: boolean }) | null>(null);
  const [retoActivo, setRetoActivo] = useState<RetoActivoRow | null>(null);
  const [registrosReto, setRegistrosReto] = useState<{ fecha: string; cumplimiento: CumplimientoReto }[]>([]);
  const [checkinsDelReto, setCheckinsDelReto] = useState<Checkin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  async function cargarTodo(uid: string) {
    const supabase = crearClienteNavegador();
    const [cargado, flags, activo] = await Promise.all([
      cargarEstadoSupabase(supabase, uid),
      obtenerFlagsSalud(supabase, uid),
      obtenerRetoActivo(supabase, uid),
    ]);
    if (cargado) setEstado(cargado);
    setFlagsSalud(flags);
    setRetoActivo(activo);

    if (activo) {
      const [registros, checkins] = await Promise.all([
        obtenerRegistrosReto(supabase, activo.id),
        obtenerCheckinsEnRango(supabase, uid, activo.fechaInicio, isoFecha(new Date())),
      ]);
      setRegistrosReto(registros);
      setCheckinsDelReto(checkins);
    } else {
      setRegistrosReto([]);
      setCheckinsDelReto([]);
    }
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

  if (cargando || !estado) {
    return (
      <div className="relative min-h-dvh">
        <TopHeader titulo="Retos" />
        <div className="mt-6 space-y-3 px-4">
          <div className="h-40 animate-pulse rounded-xl bg-surface-tertiary/50" />
          <div className="h-56 animate-pulse rounded-xl bg-surface-tertiary/50" />
        </div>
      </div>
    );
  }

  const hoyIso = isoFecha(new Date());

  async function completarCuestionario(flags: FlagsSalud) {
    if (!userId) return;
    const supabase = crearClienteNavegador();
    await guardarFlagsSalud(supabase, userId, flags);
    setFlagsSalud({ ...flags, completado: true });
  }

  async function empezarReto(reto: RetoDef, ciclo = 1) {
    if (!userId) return;
    setProcesando(true);
    const supabase = crearClienteNavegador();
    const nuevo = await iniciarReto(supabase, userId, reto.slug, reto.duracionDias, ciclo);
    if (nuevo) {
      setRetoActivo(nuevo);
      setRegistrosReto([]);
      setCheckinsDelReto([]);
    }
    setProcesando(false);
  }

  async function marcarCumplimiento(valor: CumplimientoReto) {
    if (!userId || !retoActivo) return;
    const supabase = crearClienteNavegador();
    await registrarCumplimientoReto(supabase, userId, retoActivo.id, hoyIso, valor);
    const registros = await obtenerRegistrosReto(supabase, retoActivo.id);
    setRegistrosReto(registros);
  }

  async function sigamosOtraSemana() {
    if (!userId || !retoActivo) return;
    setProcesando(true);
    const supabase = crearClienteNavegador();
    const nuevo = await extenderReto(supabase, userId, retoActivo.id, retoActivo.retoSlug, retoActivo.ciclo >= 1 ? 7 : 7, retoActivo.ciclo);
    if (nuevo) {
      setRetoActivo(nuevo);
      setRegistrosReto([]);
      setCheckinsDelReto([]);
    }
    setProcesando(false);
  }

  async function probarOtroReto() {
    if (!userId || !retoActivo) return;
    setProcesando(true);
    const supabase = crearClienteNavegador();
    await cerrarReto(supabase, retoActivo.id, "completado");
    setRetoActivo(null);
    setRegistrosReto([]);
    setCheckinsDelReto([]);
    setProcesando(false);
  }

  async function detenerReto() {
    if (!userId || !retoActivo) return;
    setProcesando(true);
    const supabase = crearClienteNavegador();
    await cerrarReto(supabase, retoActivo.id, "abandonado");
    setRetoActivo(null);
    setRegistrosReto([]);
    setCheckinsDelReto([]);
    setProcesando(false);
  }

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[480px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <TopHeader titulo="Retos" />

      <div className="relative mt-2 px-4 pb-8">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[20px] font-medium leading-[1.2] text-txt-primary"
        >
          Retos EVA
        </motion.h1>
        <p className="mt-1 text-[13px] text-txt-secondary">
          Microexperimentos de 7 días — no dietas. Descubre qué necesita tu cuerpo.
        </p>

        {!flagsSalud?.completado ? (
          <div className="mt-5">
            <CuestionarioSalud onCompletar={completarCuestionario} />
          </div>
        ) : !retoActivo ? (
          <VistaRecomendacion checkins={estado.checkins} onEmpezar={empezarReto} procesando={procesando} />
        ) : hoyIso >= retoActivo.fechaFin ? (
          <VistaResultado
            reto={obtenerReto(retoActivo.retoSlug)!}
            checkinsDelReto={checkinsDelReto}
            diaActual={diasEntre(retoActivo.fechaInicio, hoyIso)}
            procesando={procesando}
            onSigamos={sigamosOtraSemana}
            onProbarOtro={probarOtroReto}
          />
        ) : (
          <VistaProgreso
            reto={obtenerReto(retoActivo.retoSlug)!}
            retoActivo={retoActivo}
            registros={registrosReto}
            hoyIso={hoyIso}
            diaActual={diasEntre(retoActivo.fechaInicio, hoyIso)}
            onMarcar={marcarCumplimiento}
            onDetener={detenerReto}
            procesando={procesando}
          />
        )}
      </div>
    </div>
  );
}

function VistaRecomendacion({
  checkins,
  onEmpezar,
  procesando,
}: {
  checkins: Checkin[];
  onEmpezar: (reto: RetoDef) => void;
  procesando: boolean;
}) {
  const recomendado = recomendarReto(checkins);
  const otros = RETOS.filter((r) => r.slug !== recomendado.slug);
  const [verOtros, setVerOtros] = useState(false);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
      <div className="relative overflow-hidden rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-surface-primary to-brand-primary-soft/60 p-4 shadow-md">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-brand-primary">
          <Sparkles className="h-3.5 w-3.5" /> Esta semana te toca
        </p>
        <p className="mt-2 font-display text-[19px] font-medium text-txt-primary">
          {recomendado.emoji} {recomendado.nombre}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-txt-secondary">{recomendado.porQue}</p>
        <div className="mt-3 rounded-xl bg-surface-primary/70 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">Tu misión</p>
          <p className="mt-1 text-[13px] leading-relaxed text-txt-primary">{recomendado.mision}</p>
        </div>
        <div className="mt-3.5">
          <TapButton disabled={procesando} onClick={() => onEmpezar(recomendado)}>
            {procesando ? "Empezando…" : "Empezar este reto"}
          </TapButton>
        </div>
      </div>

      {otros.length > 0 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setVerOtros((v) => !v)}
            className="text-[12.5px] font-medium text-txt-tertiary underline underline-offset-2"
          >
            {verOtros ? "Ocultar otras opciones" : "¿Prefieres otro reto? Ver otras opciones"}
          </button>
        </div>
      )}

      {verOtros && (
        <div className="mt-3 space-y-2">
          {otros.map((r) => (
            <button
              key={r.slug}
              type="button"
              disabled={procesando}
              onClick={() => onEmpezar(r)}
              className="flex w-full items-center justify-between rounded-xl border border-border-default/60 bg-surface-primary p-3.5 text-left shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[18px]">{r.emoji}</span>
                <div>
                  <p className="text-[13px] font-medium text-txt-primary">{r.nombre}</p>
                  <p className="text-[11px] text-txt-tertiary">{FAMILIA_LABEL[r.familia]} · 7 días</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const OPCIONES_CUMPLIMIENTO: { valor: CumplimientoReto; label: string }[] = [
  { valor: "lo_hice", label: "Lo hice" },
  { valor: "parcial", label: "Parcial" },
  { valor: "no_lo_hice", label: "No lo hice" },
];

function VistaProgreso({
  reto,
  retoActivo,
  registros,
  hoyIso,
  diaActual,
  onMarcar,
  onDetener,
  procesando,
}: {
  reto: RetoDef;
  retoActivo: RetoActivoRow;
  registros: { fecha: string; cumplimiento: CumplimientoReto }[];
  hoyIso: string;
  diaActual: number;
  onMarcar: (v: CumplimientoReto) => void;
  onDetener: () => void;
  procesando: boolean;
}) {
  const registroHoy = registros.find((r) => r.fecha === hoyIso);
  const diaEnRango = Math.min(diaActual, reto.duracionDias);
  const menuHoy = reto.menuDias?.[(diaEnRango - 1) % reto.menuDias.length];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
      <div className="rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md">
        <p className="text-[11px] font-semibold uppercase tracking-[0.05em] text-txt-tertiary">
          Día {diaEnRango} de {reto.duracionDias}
          {retoActivo.ciclo > 1 ? ` · semana ${retoActivo.ciclo}` : ""}
        </p>
        <p className="mt-1.5 font-display text-[19px] font-medium text-txt-primary">
          {reto.emoji} {reto.nombre}
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-txt-secondary">{reto.mision}</p>

        <div className="mt-3 flex gap-1">
          {Array.from({ length: reto.duracionDias }, (_, i) => {
            const fecha = new Date(retoActivo.fechaInicio);
            fecha.setDate(fecha.getDate() + i);
            const iso = isoFecha(fecha);
            const registro = registros.find((r) => r.fecha === iso);
            return (
              <span
                key={iso}
                className={`h-1.5 flex-1 rounded-full ${
                  registro?.cumplimiento === "lo_hice"
                    ? "bg-brand-primary"
                    : registro?.cumplimiento === "parcial"
                      ? "bg-brand-gold"
                      : registro?.cumplimiento === "no_lo_hice"
                        ? "bg-status-error/50"
                        : "bg-surface-tertiary"
                }`}
              />
            );
          })}
        </div>

        <p className="mt-4 text-[12px] font-medium text-txt-secondary">¿Cómo te fue hoy con tu misión?</p>
        <div className="mt-2 flex gap-2">
          {OPCIONES_CUMPLIMIENTO.map((o) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => onMarcar(o.valor)}
              className={`h-10 flex-1 rounded-full text-[12.5px] font-semibold transition-colors ${
                registroHoy?.cumplimiento === o.valor
                  ? "bg-brand-primary text-txt-inverse"
                  : "border border-border-default text-txt-secondary"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {menuHoy && <MenuDelDiaReto menu={menuHoy} />}
      {reto.movimiento && <MovimientoDelReto movimiento={reto.movimiento} />}
      {reto.listaCompras && <ListaComprasReto grupos={reto.listaCompras} />}

      <button
        type="button"
        onClick={onDetener}
        disabled={procesando}
        className="mt-4 flex h-9 w-full items-center justify-center text-[12.5px] font-medium text-txt-tertiary"
      >
        Detener este reto
      </button>
    </motion.div>
  );
}

function FilaResultado({ resultado }: { resultado: ResultadoIndicador }) {
  const mejora = resultado.cambioPct >= 5;
  const empeora = resultado.cambioPct <= -5;
  const Icono = mejora ? ChevronUp : empeora ? ChevronDown : Minus;
  const color = mejora ? "text-status-success" : empeora ? "text-status-error" : "text-txt-tertiary";

  return (
    <div className="flex items-center justify-between border-b border-border-default/40 py-2.5 last:border-0">
      <span className="text-[13px] text-txt-secondary">{labelCampo(resultado.indicador)}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-[12.5px] text-txt-tertiary">
          {resultado.promedioInicio.toFixed(1)} → {resultado.promedioFinal.toFixed(1)}
        </span>
        <span className={`flex items-center gap-0.5 text-[12.5px] font-semibold ${color}`}>
          <Icono className="h-3.5 w-3.5" />
          {Math.abs(Math.round(resultado.cambioPct))}%
        </span>
      </div>
    </div>
  );
}

function VistaResultado({
  reto,
  checkinsDelReto,
  diaActual,
  procesando,
  onSigamos,
  onProbarOtro,
}: {
  reto: RetoDef;
  checkinsDelReto: Checkin[];
  diaActual: number;
  procesando: boolean;
  onSigamos: () => void;
  onProbarOtro: () => void;
}) {
  const resultados = compararResultadosReto(checkinsDelReto, reto.indicadoresClave);
  const decision = decidirSiguientePaso(resultados);
  const sugiereSeguir = decision === "continuar_fuerte" || decision === "repetir_modificar";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
      <div className="rounded-2xl border border-brand-primary/30 bg-gradient-to-br from-surface-primary to-brand-primary-soft/60 p-4 shadow-md">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-brand-primary">
          <Trophy className="h-3.5 w-3.5" /> {reto.nombre} · {diaActual} días
        </p>
        <p className="mt-2 font-display text-[19px] font-medium text-txt-primary">Tu cuerpo respondió</p>

        {resultados.length === 0 ? (
          <p className="mt-2 text-[13px] text-txt-secondary">
            No tuvimos suficientes revisiones diarias tuyas durante este reto para comparar con
            confianza — la próxima vez, entre más check-ins hagas, más preciso será el resultado.
          </p>
        ) : (
          <div className="mt-3 rounded-xl bg-surface-primary/70 p-3.5">
            {resultados.map((r) => (
              <FilaResultado key={r.indicador} resultado={r} />
            ))}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-primary/70 p-3">
          <Check className="h-4 w-4 shrink-0 text-brand-primary" />
          <p className="text-[13px] font-medium text-txt-primary">{DECISION_TEXTO[decision]}</p>
        </div>

        <div className="mt-4 space-y-2">
          {sugiereSeguir && (
            <TapButton disabled={procesando} onClick={onSigamos}>
              {procesando ? "Un momento…" : "Sigamos 7 días más"}
            </TapButton>
          )}
          <button
            type="button"
            onClick={onProbarOtro}
            disabled={procesando}
            className={`flex h-11 w-full items-center justify-center rounded-full text-[13.5px] font-medium ${
              sugiereSeguir ? "border border-border-strong text-txt-secondary" : "bg-brand-primary text-txt-inverse"
            }`}
          >
            Prueba otro reto
          </button>
        </div>
      </div>
    </motion.div>
  );
}
