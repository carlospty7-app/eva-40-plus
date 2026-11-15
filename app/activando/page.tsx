"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Loader2 } from "lucide-react";
import { crearClienteNavegador } from "@/lib/supabase/client";

const INTERVALO_MS = 2000;
const MAX_INTENTOS = 20;

/** Pantalla puente tras pagar en Stripe: el aviso del pago (webhook) llega unos segundos después
 * de que la usuaria vuelve, así que se espera a que su cuenta quede activa antes de dejarla pasar. */
export default function ActivandoPage() {
  const router = useRouter();
  const [agotado, setAgotado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    let intentos = 0;
    const supabase = crearClienteNavegador();

    async function revisar() {
      if (cancelado) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: perfil } = await supabase.from("profiles").select("activo").eq("id", user.id).single();
      if (perfil?.activo === true) {
        router.replace("/app");
        return;
      }
      intentos += 1;
      if (intentos >= MAX_INTENTOS) {
        setAgotado(true);
        return;
      }
      setTimeout(revisar, INTERVALO_MS);
    }

    revisar();
    return () => {
      cancelado = true;
    };
  }, [router]);

  if (agotado) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <CircleAlert className="h-8 w-8 text-brand-primary" />
        <h1 className="font-display text-[18px] font-medium text-txt-primary">Tu pago sigue procesándose</h1>
        <p className="max-w-[290px] text-[13.5px] text-txt-secondary">
          Puede tardar un minuto más. Recarga esta página, o escríbenos a hola@eva40.app y lo resolvemos
          enseguida.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 flex h-11 items-center justify-center rounded-full bg-brand-primary px-6 text-[13.5px] font-semibold text-white"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
      <h1 className="font-display text-[18px] font-medium text-txt-primary">Activando tu acceso…</h1>
      <p className="max-w-[270px] text-[13.5px] text-txt-secondary">
        Estamos confirmando tu pago — toma solo unos segundos.
      </p>
    </div>
  );
}
