"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { UsuarioAdmin } from "@/lib/supabase/admin-queries";
import { formatoCorto } from "@/lib/app/dates";

export function TablaUsuarios({ usuarios }: { usuarios: UsuarioAdmin[] }) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = usuarios.filter((u) => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return true;
    return u.nombre.toLowerCase().includes(q) || (u.email ?? "").toLowerCase().includes(q);
  });

  if (usuarios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-secondary/40 px-6 py-10 text-center">
        <p className="text-[14px] font-medium text-txt-primary">Todavía no hay usuarias registradas</p>
        <p className="mt-1 max-w-[320px] text-[13px] text-txt-secondary">
          En cuanto alguien cree su cuenta en la app, va a aparecer aquí con su plan y su actividad.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex h-10 items-center gap-2 rounded-full border border-border-default bg-surface-primary px-3.5">
        <Search className="h-3.5 w-3.5 shrink-0 text-txt-tertiary" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o correo…"
          className="w-full bg-transparent text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
        />
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-border-default/60">
        <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
          <thead>
            <tr className="border-b border-border-default/60 bg-surface-secondary/60 text-[11px] uppercase tracking-[0.05em] text-txt-tertiary">
              <th className="px-3.5 py-2.5 font-semibold">Usuaria</th>
              <th className="px-3.5 py-2.5 font-semibold">Plan</th>
              <th className="px-3.5 py-2.5 font-semibold">Racha</th>
              <th className="px-3.5 py-2.5 font-semibold">Último check-in</th>
              <th className="px-3.5 py-2.5 font-semibold">Alta</th>
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
    </div>
  );
}
