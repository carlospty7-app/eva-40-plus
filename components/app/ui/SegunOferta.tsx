"use client";

import { useEffect, useState, type ReactNode } from "react";
import { leerOferta, type Oferta } from "@/lib/oferta";

/** Hook: la oferta vigente para esta visitante ("pagado" = $1 por 7 días, "gratis" = 7 días sin cobro). */
export function useOferta(): Oferta {
  const [oferta, setOferta] = useState<Oferta>("pagado");
  useEffect(() => {
    setOferta(leerOferta());
  }, []);
  return oferta;
}

/** Muestra un texto u otro según la oferta — permite que secciones estáticas de la landing digan la
 * verdad de cada variante sin volverse páginas separadas. */
export function SegunOferta({ pagado, gratis }: { pagado: ReactNode; gratis: ReactNode }) {
  return <>{useOferta() === "gratis" ? gratis : pagado}</>;
}
