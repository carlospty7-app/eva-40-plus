"use client";

import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/client";

export default function CuentaDesactivadaPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <CircleAlert className="h-8 w-8 text-status-error" />
      <h1 className="font-display text-[18px] font-medium text-txt-primary">Tu cuenta está desactivada</h1>
      <p className="max-w-[280px] text-[13.5px] text-txt-secondary">
        Si crees que esto es un error, contacta a soporte para resolverlo.
      </p>
      <button
        type="button"
        onClick={async () => {
          const supabase = crearClienteNavegador();
          await supabase.auth.signOut();
          router.push("/");
        }}
        className="mt-2 flex h-11 items-center justify-center rounded-full border border-border-strong px-6 text-[13.5px] font-medium text-txt-secondary"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
