"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { TapButton } from "@/components/app/onboarding/TapButton";

export function FormularioUsuaria() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState<"anual" | "mensual">("anual");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function guardar() {
    setError(null);
    setGuardando(true);
    const res = await fetch("/api/admin/usuario/crear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password, plan }),
    });
    setGuardando(false);
    if (!res.ok) {
      setError(await res.text().catch(() => "No se pudo crear la cuenta."));
      return;
    }
    setNombre("");
    setEmail("");
    setPassword("");
    setAbierto(false);
    router.refresh();
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="flex h-10 items-center gap-1.5 rounded-full bg-brand-accent px-4 text-[13px] font-medium text-txt-inverse"
      >
        <Plus className="h-4 w-4" /> Agregar usuaria
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border-default/60 bg-surface-primary p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-txt-primary">Agregar usuaria manualmente</p>
        <button type="button" onClick={() => setAbierto(false)} aria-label="Cerrar" className="text-txt-tertiary">
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-1 text-[12px] text-txt-secondary">
        Crea la cuenta ya confirmada — útil si alguien pagó por fuera de Hotmart o el alta automática falló.
      </p>
      <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
        />
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as "anual" | "mensual")}
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none"
        >
          <option value="anual">Plan anual</option>
          <option value="mensual">Plan mensual</option>
        </select>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="correo@ejemplo.com"
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="text"
          placeholder="Contraseña temporal (mín. 6 caracteres)"
          className="h-11 rounded-full border border-border-default bg-surface-base px-4 text-[13.5px] text-txt-primary outline-none placeholder:text-txt-tertiary"
        />
      </div>
      {error && <p className="mt-2 text-[12.5px] text-status-error">{error}</p>}
      <div className="mt-3">
        <TapButton disabled={!nombre || !email || password.length < 6 || guardando} onClick={guardar}>
          {guardando ? "Creando…" : "Crear cuenta"}
        </TapButton>
      </div>
      <p className="mt-2 text-[11.5px] text-txt-tertiary">
        Comparte el correo y la contraseña con ella para que inicie sesión — no se envía ningún
        correo automático.
      </p>
    </div>
  );
}
