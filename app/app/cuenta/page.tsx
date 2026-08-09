"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  Mail,
  Pencil,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cargarEstado, guardarEstado } from "@/lib/app/store";
import { formatoCorto } from "@/lib/app/dates";
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

  useEffect(() => {
    setEstado(cargarEstado());
  }, []);

  function actualizarPerfil(cambios: Partial<EstadoApp["perfil"]>) {
    setEstado((prev) => {
      if (!prev) return prev;
      const nuevo = { ...prev, perfil: { ...prev.perfil, ...cambios } };
      guardarEstado(nuevo);
      return nuevo;
    });
  }

  function guardarNombre() {
    const limpio = nombreTemp.trim();
    if (limpio) actualizarPerfil({ nombre: limpio });
    setEditandoNombre(false);
  }

  function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => {
      if (typeof lector.result === "string") {
        actualizarPerfil({ fotoUrl: lector.result });
      }
    };
    lector.readAsDataURL(archivo);
  }

  return (
    <div className="relative min-h-dvh px-4 pt-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Atrás"
          className="flex h-10 w-10 items-center justify-center rounded-full text-txt-secondary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-display text-[16px] text-txt-primary">Cuenta</span>
      </div>

      {!estado && (
        <div className="mt-5 space-y-3">
          <div className="h-24 animate-pulse rounded-xl bg-surface-tertiary/50" />
          <div className="h-16 animate-pulse rounded-xl bg-surface-tertiary/50" />
          <div className="h-40 animate-pulse rounded-xl bg-surface-tertiary/50" />
        </div>
      )}

      {estado && (
        <>
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
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-[12.5px] text-txt-secondary">
                <Mail className="h-3 w-3 shrink-0" />
                {estado.perfil.email || "Sin correo registrado"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
              Tu plan
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-primary" />
              <span className="text-[14px] font-semibold text-txt-primary">
                Plan {estado.perfil.plan === "anual" ? "Anual" : "Mensual"}
              </span>
            </div>
            {estado.perfil.trialActivo && (
              <p className="mt-2 text-[13px] text-txt-secondary">
                Estás en tu prueba gratuita. Se activa el cobro el{" "}
                <span className="font-medium text-txt-primary">
                  {formatoCorto(new Date(estado.perfil.fechaCobro))}
                </span>{" "}
                si no cancelas antes.
              </p>
            )}
          </div>

          <div className="mt-4 divide-y divide-border-default/60 rounded-xl border border-border-default/60 bg-surface-primary shadow-sm">
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-txt-tertiary">
                Tu enfoque actual
              </p>
              <p className="mt-1 text-[13.5px] text-txt-primary">{estado.perfil.dolorLabel}</p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary shadow-sm">
            {LEGALES.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between border-b border-border-default/60 p-4 text-[13.5px] text-txt-primary last:border-0"
              >
                <span className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 text-txt-tertiary" /> {l.label}
                </span>
                <ChevronRight className="h-4 w-4 text-txt-tertiary" />
              </Link>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface-tertiary/50 p-3.5 text-[12px] text-txt-tertiary">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            Tus datos están protegidos y nunca se comparten sin tu permiso.
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border-strong text-[13.5px] font-medium text-txt-secondary"
          >
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </>
      )}

      <div className="h-16" />
    </div>
  );
}
