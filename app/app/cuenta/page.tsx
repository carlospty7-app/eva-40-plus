"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  BellRing,
  Camera,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LifeBuoy,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import { BotanicalGlow } from "@/components/app/ui/BotanicalGlow";
import { CargandoOError } from "@/components/app/ui/CargandoOError";
import { InstalarApp } from "@/components/app/interna/InstalarApp";
import { formatoCorto } from "@/lib/app/dates";
import { crearClienteNavegador } from "@/lib/supabase/client";
import {
  actualizarPerfil as actualizarPerfilSupabase,
  cargarEstadoSupabase,
  subirFotoPerfil,
} from "@/lib/supabase/queries";
import { activarRecordatorios, permisoYaDecidido, pushSoportado } from "@/lib/push/client";
import type { EstadoApp } from "@/lib/app/types";

const LEGALES = [
  { href: "/legal/privacidad", label: "Privacidad" },
  { href: "/legal/terminos", label: "Términos" },
  { href: "/legal/reembolso", label: "Reembolso" },
  { href: "/legal/disclaimer-ia", label: "Aviso sobre IA" },
];

export default function CuentaPage() {
  const router = useRouter();
  const [estado, setEstado] = useState<EstadoApp | null>(null);
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemp, setNombreTemp] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [recordatoriosEstado, setRecordatoriosEstado] = useState<"inicial" | "activando" | "activado" | "rechazado">(
    "inicial",
  );
  const [abriendoPortal, setAbriendoPortal] = useState(false);
  const [avisoPlan, setAvisoPlan] = useState<string | null>(null);
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState<string | null>(null);

  useEffect(() => {
    if (permisoYaDecidido() && typeof Notification !== "undefined" && Notification.permission === "granted") {
      setRecordatoriosEstado("activado");
    }
  }, []);

  async function activarPush() {
    setRecordatoriosEstado("activando");
    const ok = await activarRecordatorios();
    setRecordatoriosEstado(ok ? "activado" : "rechazado");
  }

  useEffect(() => {
    const supabase = crearClienteNavegador();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const cargado = await cargarEstadoSupabase(supabase, data.user.id);
      if (cargado) setEstado(cargado);
    });
  }, []);

  async function actualizarPerfil(cambios: Partial<EstadoApp["perfil"]>) {
    if (!userId) return;
    setEstado((prev) => (prev ? { ...prev, perfil: { ...prev.perfil, ...cambios } } : prev));
    const supabase = crearClienteNavegador();
    await actualizarPerfilSupabase(supabase, userId, cambios);
  }

  async function administrarSuscripcion() {
    if (abriendoPortal) return;
    setAbriendoPortal(true);
    setAvisoPlan(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = res.ok ? await res.json() : null;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setAvisoPlan(
        res.status === 404
          ? "Aún no encontramos una suscripción ligada a tu cuenta. Escríbenos a hola@eva40.app y lo resolvemos."
          : "No pudimos abrir la administración de tu suscripción. Intenta de nuevo o escríbenos a hola@eva40.app.",
      );
    } catch {
      setAvisoPlan("No pudimos conectarnos. Revisa tu internet e intenta de nuevo.");
    }
    setAbriendoPortal(false);
  }

  async function borrarCuenta() {
    if (borrando) return;
    setBorrando(true);
    setErrorBorrado(null);
    try {
      const res = await fetch("/api/cuenta/eliminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmar: true }),
      });
      if (res.status === 204) {
        await crearClienteNavegador().auth.signOut();
        router.push("/");
        return;
      }
      setErrorBorrado((await res.text()) || "No pudimos borrar tu cuenta. Escríbenos a hola@eva40.app.");
    } catch {
      setErrorBorrado("No pudimos conectarnos. Revisa tu internet e intenta de nuevo.");
    }
    setBorrando(false);
  }

  function guardarNombre() {
    const limpio = nombreTemp.trim();
    if (limpio) actualizarPerfil({ nombre: limpio });
    setEditandoNombre(false);
  }

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo || !userId) return;
    const supabase = crearClienteNavegador();
    const url = await subirFotoPerfil(supabase, userId, archivo);
    if (url) actualizarPerfil({ fotoUrl: url });
  }

  return (
    <div className="relative min-h-dvh overflow-hidden px-4 pt-4">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[420px] overflow-hidden">
        <BotanicalGlow variant="light" />
      </div>
      <div className="relative z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Atrás"
          className="flex h-11 w-11 items-center justify-center rounded-full text-txt-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-display text-[17px] text-txt-primary">Cuenta</span>
      </div>

      {!estado && (
        <CargandoOError>
          <div className="mt-5 space-y-3">
            <div className="h-24 animate-pulse rounded-xl bg-surface-tertiary/50" />
            <div className="h-16 animate-pulse rounded-xl bg-surface-tertiary/50" />
            <div className="h-40 animate-pulse rounded-xl bg-surface-tertiary/50" />
          </div>
        </CargandoOError>
      )}

      {estado && (
        <div className="relative z-10">
          <div className="mt-5 flex items-center gap-4 rounded-2xl border border-border-default/40 bg-surface-primary p-4 shadow-md">
            <div className="relative shrink-0">
              <div className="flex h-[64px] w-[64px] items-center justify-center overflow-hidden rounded-full bg-brand-primary-soft text-[22px] font-semibold text-brand-primary">
                {estado.perfil.fotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={estado.perfil.fotoUrl} alt="Tu foto de perfil" className="h-full w-full object-cover" />
                ) : (
                  estado.perfil.nombre.trim().charAt(0).toUpperCase()
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Cambiar foto de perfil"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-txt-inverse shadow-sm"
              >
                <Camera className="h-3.5 w-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={subirFoto}
                className="hidden"
              />
            </div>

            <div className="min-w-0 flex-1">
              {editandoNombre ? (
                <input
                  autoFocus
                  value={nombreTemp}
                  onChange={(e) => setNombreTemp(e.target.value)}
                  onBlur={guardarNombre}
                  onKeyDown={(e) => e.key === "Enter" && guardarNombre()}
                  className="w-full rounded-md border border-border-default bg-surface-primary px-2 py-1 text-[15px] font-medium text-txt-primary outline-none focus:border-brand-primary/50"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setNombreTemp(estado.perfil.nombre === "tu cuenta" ? "" : estado.perfil.nombre);
                    setEditandoNombre(true);
                  }}
                  className="flex items-center gap-1.5 text-[15px] font-medium text-txt-primary"
                >
                  {estado.perfil.nombre === "tu cuenta" ? "Agrega tu nombre" : estado.perfil.nombre}
                  <Pencil className="h-3 w-3 text-txt-tertiary" />
                </button>
              )}
              <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[13px] text-txt-secondary">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 truncate">{estado.perfil.email || "Sin correo registrado"}</span>
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
              Tu plan
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              <span className="text-[14px] font-semibold text-txt-primary">
                Plan {estado.perfil.plan === "anual" ? "Anual" : "Mensual"}
              </span>
            </div>
            {estado.perfil.trialActivo && (
              <p className="mt-2 text-[14px] text-txt-secondary">
                Estás en tus primeros 7 días. Tu plan completo se cobra el{" "}
                <span className="font-medium text-txt-primary">
                  {formatoCorto(new Date(estado.perfil.fechaCobro))}
                </span>{" "}
                si no cancelas antes.
              </p>
            )}
            <button
              type="button"
              onClick={administrarSuscripcion}
              disabled={abriendoPortal}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-[14px] font-medium text-txt-primary disabled:opacity-60"
            >
              <CreditCard className="h-4 w-4" />
              {abriendoPortal ? "Abriendo…" : "Administrar o cancelar mi suscripción"}
            </button>
            {avisoPlan && <p className="mt-2 text-[13px] text-status-warning">{avisoPlan}</p>}
          </div>

          <InstalarApp />

          <div className="mt-4 divide-y divide-border-default/60 rounded-xl border border-border-default/60 bg-surface-primary shadow-sm">
            <div className="p-4">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
                Tu enfoque actual
              </p>
              <p className="mt-1 text-[14px] text-txt-primary">{estado.perfil.dolorLabel}</p>
            </div>
          </div>

          <a
            href="mailto:hola@eva40.app"
            className="mt-4 flex min-h-[52px] items-center justify-between rounded-xl border border-border-default/60 bg-surface-primary p-4 text-[14px] text-txt-primary shadow-sm"
          >
            <span className="flex items-center gap-2.5">
              <LifeBuoy className="h-4 w-4 text-brand-primary" /> ¿Necesitas ayuda? hola@eva40.app
            </span>
            <ChevronRight className="h-4 w-4 text-txt-tertiary" />
          </a>

          <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary shadow-sm">
            {LEGALES.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex min-h-[52px] items-center justify-between border-b border-border-default/60 p-4 text-[14px] text-txt-primary last:border-0"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-txt-tertiary" /> {l.label}
                </span>
                <ChevronRight className="h-4 w-4 text-txt-tertiary" />
              </Link>
            ))}
          </div>

          {pushSoportado() && recordatoriosEstado !== "activado" && (
            <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent-soft text-brand-accent">
                  <Bell className="h-4 w-4" />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-medium text-txt-primary">Avísame antes de perder mi racha</p>
                  <p className="mt-0.5 text-[12px] text-txt-secondary">
                    Un recordatorio en tu celular si se acerca el día y no has hecho tu revisión.
                  </p>
                  {recordatoriosEstado === "rechazado" ? (
                    <p className="mt-2 text-[12px] text-status-warning">
                      Tu navegador bloqueó los avisos — actívalos desde su configuración si cambias de idea.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={activarPush}
                      disabled={recordatoriosEstado === "activando"}
                      className="mt-2.5 flex h-9 items-center rounded-full bg-brand-primary px-4 text-[12.5px] font-semibold text-txt-inverse disabled:opacity-60"
                    >
                      {recordatoriosEstado === "activando" ? "Activando…" : "Activar recordatorios"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
          {recordatoriosEstado === "activado" && (
            <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-status-success-soft p-3.5 text-[12.5px] font-medium text-status-success">
              <BellRing className="h-4 w-4 shrink-0" /> Recordatorios activados.
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-tertiary/50 p-3.5 text-[12px] text-txt-tertiary">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Tus datos están protegidos y nunca se comparten sin tu permiso.
          </div>

          <button
            type="button"
            onClick={async () => {
              const supabase = crearClienteNavegador();
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-[13.5px] font-medium text-txt-secondary"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>

          {!confirmandoBorrado ? (
            <button
              type="button"
              onClick={() => setConfirmandoBorrado(true)}
              className="mt-3 flex h-11 w-full items-center justify-center gap-2 text-[13.5px] font-medium text-status-error"
            >
              <Trash2 className="h-4 w-4" /> Borrar mi cuenta
            </button>
          ) : (
            <div className="mt-3 rounded-xl border border-status-error/40 bg-surface-primary p-4 shadow-sm">
              <p className="text-[14px] font-medium text-txt-primary">¿Borrar tu cuenta para siempre?</p>
              <p className="mt-1 text-[13px] text-txt-secondary">
                Cancelamos tu suscripción y eliminamos todos tus datos (revisiones, ciclo, retos). No se puede
                deshacer.
              </p>
              {errorBorrado && <p className="mt-2 text-[13px] text-status-error">{errorBorrado}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmandoBorrado(false)}
                  disabled={borrando}
                  className="flex h-11 flex-1 items-center justify-center rounded-full border border-border-strong text-[13.5px] font-medium text-txt-secondary"
                >
                  Conservarla
                </button>
                <button
                  type="button"
                  onClick={borrarCuenta}
                  disabled={borrando}
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-status-error text-[13.5px] font-semibold text-white disabled:opacity-60"
                >
                  {borrando ? "Borrando…" : "Sí, borrar todo"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="h-16" />
    </div>
  );
}
