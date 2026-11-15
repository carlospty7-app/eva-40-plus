"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Share, SquarePlus, Smartphone, EllipsisVertical } from "lucide-react";

type EventoInstalacion = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Plataforma = "ios" | "android" | "otra";

function detectarPlataforma(): Plataforma {
  const ua = navigator.userAgent;
  if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "ios";
  if (/android/i.test(ua)) return "android";
  return "otra";
}

function yaEstaInstalada(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

/** Tarjeta "Instala EVA en tu celular": en Android abre el aviso nativo de instalación; en iPhone
 * (donde el navegador no lo permite) muestra los pasos exactos. Si ya está instalada, lo confirma. */
export function InstalarApp() {
  const [plataforma, setPlataforma] = useState<Plataforma | null>(null);
  const [instalada, setInstalada] = useState(false);
  const [evento, setEvento] = useState<EventoInstalacion | null>(null);
  const [verPasos, setVerPasos] = useState(false);

  useEffect(() => {
    setPlataforma(detectarPlataforma());
    setInstalada(yaEstaInstalada());

    const alOfrecer = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalacion);
    };
    const alInstalar = () => {
      setInstalada(true);
      setEvento(null);
    };
    window.addEventListener("beforeinstallprompt", alOfrecer);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alOfrecer);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  async function instalar() {
    if (!evento) return;
    await evento.prompt();
    const { outcome } = await evento.userChoice;
    if (outcome === "accepted") setInstalada(true);
    setEvento(null);
  }

  if (!plataforma) return null;

  if (instalada) {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-status-success-soft p-3.5 text-[13px] font-medium text-status-success">
        <CheckCircle2 className="h-4 w-4 shrink-0" /> EVA ya está instalada en tu celular.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
          <Smartphone className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-medium text-txt-primary">Instala EVA en tu celular</p>
          <p className="mt-0.5 text-[13px] text-txt-secondary">
            Ábrela como cualquier app, desde un ícono en tu pantalla de inicio.
          </p>

          {evento ? (
            <button
              type="button"
              onClick={instalar}
              className="mt-3 flex h-11 items-center rounded-full bg-brand-primary px-5 text-[14px] font-semibold text-txt-inverse"
            >
              Instalar en mi celular
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setVerPasos((v) => !v)}
                aria-expanded={verPasos}
                className="mt-3 flex h-11 items-center rounded-full bg-brand-primary px-5 text-[14px] font-semibold text-txt-inverse"
              >
                {verPasos ? "Ocultar los pasos" : "Instalar en mi celular"}
              </button>

              {verPasos && plataforma === "ios" && (
                <ol className="mt-3 space-y-2.5 text-[14px] text-txt-primary">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[12px] font-bold text-txt-inverse">1</span>
                    <span>
                      Abre <span className="font-medium">eva40.app</span> en <span className="font-medium">Safari</span>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[12px] font-bold text-txt-inverse">2</span>
                    <span>
                      Toca el botón <Share className="mx-0.5 inline h-4 w-4 align-text-bottom text-brand-primary" />{" "}
                      <span className="font-medium">Compartir</span> (el cuadrado con la flecha hacia arriba).
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[12px] font-bold text-txt-inverse">3</span>
                    <span>
                      Elige <SquarePlus className="mx-0.5 inline h-4 w-4 align-text-bottom text-brand-primary" />{" "}
                      <span className="font-medium">Agregar a pantalla de inicio</span> y toca Agregar.
                    </span>
                  </li>
                </ol>
              )}

              {verPasos && plataforma !== "ios" && (
                <ol className="mt-3 space-y-2.5 text-[14px] text-txt-primary">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[12px] font-bold text-txt-inverse">1</span>
                    <span>
                      Abre <span className="font-medium">eva40.app</span> en <span className="font-medium">Chrome</span>.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[12px] font-bold text-txt-inverse">2</span>
                    <span>
                      Toca los tres puntos <EllipsisVertical className="mx-0.5 inline h-4 w-4 align-text-bottom text-brand-primary" /> de
                      arriba a la derecha.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-[12px] font-bold text-txt-inverse">3</span>
                    <span>
                      Elige <span className="font-medium">Instalar app</span> (o &ldquo;Agregar a pantalla principal&rdquo;).
                    </span>
                  </li>
                </ol>
              )}
            </>
          )}

          {plataforma === "ios" && (
            <p className="mt-3 text-[13px] text-txt-tertiary">
              En iPhone, los recordatorios solo llegan si instalas la app.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
