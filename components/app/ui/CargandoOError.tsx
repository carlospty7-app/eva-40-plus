"use client";

import { useEffect, useState, type ReactNode } from "react";
import { WifiOff, CircleAlert } from "lucide-react";

const ESPERA_MS = 10000;

/** Muestra el esqueleto de carga y, si pasan 10 segundos sin que llegue la información (o si el
 * teléfono está sin conexión), lo reemplaza por un aviso claro con "Reintentar" — así nunca queda
 * un esqueleto gris eterno. Se monta solo mientras la pantalla todavía no tiene datos. */
export function CargandoOError({ children }: { children: ReactNode }) {
  const [agotado, setAgotado] = useState(false);
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    setSinConexion(typeof navigator !== "undefined" && navigator.onLine === false);
    const temporizador = setTimeout(() => setAgotado(true), ESPERA_MS);
    const alCambiarConexion = () => setSinConexion(navigator.onLine === false);
    window.addEventListener("online", alCambiarConexion);
    window.addEventListener("offline", alCambiarConexion);
    return () => {
      clearTimeout(temporizador);
      window.removeEventListener("online", alCambiarConexion);
      window.removeEventListener("offline", alCambiarConexion);
    };
  }, []);

  if (!agotado && !sinConexion) return <>{children}</>;

  const Icono = sinConexion ? WifiOff : CircleAlert;
  return (
    <div
      role="alert"
      className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-border-default/60 bg-surface-primary px-6 py-8 text-center shadow-sm"
    >
      <Icono className="h-7 w-7 text-brand-primary" aria-hidden />
      <h2 className="font-display text-[17px] font-medium text-txt-primary">
        {sinConexion ? "Parece que no tienes conexión" : "No pudimos cargar tu información"}
      </h2>
      <p className="max-w-[270px] text-[14px] leading-relaxed text-txt-secondary">
        {sinConexion
          ? "Cuando vuelvas a tener internet, toca Reintentar y seguimos donde lo dejaste."
          : "Revisa tu conexión y toca Reintentar. Tus datos están a salvo."}
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-1 flex h-11 items-center justify-center rounded-full bg-brand-primary px-6 text-[14px] font-semibold text-txt-inverse"
      >
        Reintentar
      </button>
    </div>
  );
}
