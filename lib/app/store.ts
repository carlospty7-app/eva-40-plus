import { isoFecha } from "@/lib/app/dates";
import type { Checkin, EstadoApp } from "@/lib/app/types";

/** Helpers puros sobre un `EstadoApp` ya cargado — usados tanto por la pantalla como por la capa
 * de datos de Supabase (`lib/supabase/queries.ts`). La carga y el guardado reales de datos viven
 * ahí ahora; esto ya no toca localStorage. */

export function checkinDeHoy(estado: EstadoApp): Checkin | undefined {
  const hoy = isoFecha(new Date());
  return estado.checkins.find((c) => c.fecha === hoy);
}

export function diaRutaDeHoy(estado: EstadoApp) {
  const hoy = isoFecha(new Date());
  return estado.rutaSemana.find((d) => d.fecha === hoy);
}
