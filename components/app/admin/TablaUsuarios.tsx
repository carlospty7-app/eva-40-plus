"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { UsuarioAdmin } from "@/lib/supabase/admin-queries";
import { formatoCorto } from "@/lib/app/dates";
import { FormularioUsuaria } from "@/components/app/admin/FormularioUsuaria";

function InterruptorActivo({ userId, activo }: { userId: string; activo: boolean }) {
  const router = useRouter();
  const [valor, setValor] = useState(activo);
  const [cargando, setCargando] = useState(false);

  async function alternar() {
    const nuevo = !valor;
    setValor(nuevo); // optimista — se revierte si falla
    setCargando(true);
    const res = await fetch("/api/admin/usuario/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, activo: nuevo }),
    });
    setCargando(false);
    if (!res.ok) {
      setValor(!nuevo);
      return;
    }
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={cargando}
      aria-label={valor ? "Desactivar cuenta" : "Activar cuenta"}
      className="flex items-center gap-2"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${valor ? "bg-status-success" : "bg-border-strong"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface-primary shadow-sm transition-transform ${
            valor ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className={`text-[11.5px] font-medium ${valor ? "text-status-success" : "text-txt-tertiary"}`}>
        {valor ? "Activa" : "Desactivada"}
      </span>
    </button>
  );
}

export function TablaUsuarios({ usuarios }: { usuarios: UsuarioAdmin[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return u.nombre.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 flex-1 min-w-[200px] items-center gap-2 rounded-full border border-border-default bg-surface-primary px-3.5">
          <Search className="h-3.5 w-3.5 shrink-0 text-txt-tertiary" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="w-full bg-transparent text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
          />
        </div>
        <FormularioUsuaria />
      </div>

      {usuarios.length === 0 ? (
        <div className="mt-3 flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-secondary/40 px-6 py-10 text-center">
          <p className="text-[14px] font-medium text-txt-primary">Todavía no hay usuarias registradas</p>
          <p className="mt-1 max-w-[320px] text-[13px] text-txt-secondary">
            En cuanto alguien cree su cuenta en la app, va a aparecer aquí — o agrégala tú mismo
            arriba.
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-border-default/60">
          <table className="w-full min-w-[760px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-border-default/60 bg-surface-secondary/60 text-[11px] uppercase tracking-[0.05em] text-txt-tertiary">
                <th className="px-3.5 py-2.5 font-semibold">Usuaria</th>
                <th className="px-3.5 py-2.5 font-semibold">Plan</th>
                <th className="px-3.5 py-2.5 font-semibold">Racha</th>
                <th className="px-3.5 py-2.5 font-semibold">Último check-in</th>
                <th className="px-3.5 py-2.5 font-semibold">Alta</th>
                <th className="px-3.5 py-2.5 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <tr key={u.id} className="border-b border-border-default/40 last:border-0">
                  <td className="px-3.5 py-2.5">
                    <p className="font-medium text-txt-primary">{u.nombre}</p>
                    <p className="text-[12px] text-txt-tertiary">{u.email ?? "sin correo"}</p>
                  </td>
                  <td className="px-3.5 py-2.5 text-txt-secondary">
                    {u.plan === "anual" ? "Anual" : "Mensual"}
                    {u.trialActivo && (
                      <span className="ml-1.5 rounded-full bg-brand-primary-soft px-2 py-0.5 text-[10.5px] font-medium text-brand-primary">
                        prueba
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-2.5 text-txt-secondary">{u.rachaDias} días</td>
                  <td className="px-3.5 py-2.5 text-txt-secondary">
                    {u.ultimoCheckin ? formatoCorto(new Date(u.ultimoCheckin)) : "—"}
                  </td>
                  <td className="px-3.5 py-2.5 text-txt-secondary">{formatoCorto(new Date(u.createdAt))}</td>
                  <td className="px-3.5 py-2.5">
                    <InterruptorActivo userId={u.id} activo={u.activo} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length === 0 && (
            <p className="px-3.5 py-6 text-center text-[13px] text-txt-tertiary">
              Ninguna usuaria coincide con &quot;{busqueda}&quot;.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
