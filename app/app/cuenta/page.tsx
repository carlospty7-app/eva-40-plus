"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cargarEstado } from "@/lib/app/store";
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

  useEffect(() => {
    setEstado(cargarEstado());
  }, []);

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
          <div className="mt-5 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
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
