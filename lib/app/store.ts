import { isoFecha } from "@/lib/app/dates";
import { generarSeed, temaPorIndiceDia } from "@/lib/app/seed";
import { computeScoreDia } from "@/lib/app/engine";
import type { Checkin, EstadoApp, EstadoDia } from "@/lib/app/types";
import { leerDiagnostico } from "@/lib/onboarding/storage";

const KEY = "eva40_app_estado";

let memoriaRespaldo: EstadoApp | null = null;

function conDiagnosticoReal(estado: EstadoApp): EstadoApp {
  const diagnostico = leerDiagnostico();
  if (!diagnostico) return estado;
  return {
    ...estado,
    perfil: {
      ...estado.perfil,
      metaLabel: diagnostico.metaLabel,
      dolorLabel: diagnostico.dolorLabel ?? estado.perfil.dolorLabel,
    },
  };
}

/** Repara registros guardados con un esquema más viejo (ej. sin `menu`/`movimiento` en `DiaRuta`)
 * rellenando SOLO lo que falta con el contenido semilla del día — nunca borra progreso real
 * (checkins, scoreHistorial, rachaDias, completado). Así una actualización futura de la app no le
 * hace perder su racha a una usuaria real. */
function repararEstado(estado: EstadoApp): EstadoApp {
  return {
    ...estado,
    rutaSemana: estado.rutaSemana.map((dia, i) => {
      if (dia.menu && dia.movimiento) return dia;
      const tema = temaPorIndiceDia(i);
      return {
        ...dia,
        menu: dia.menu ?? tema.menu,
        movimiento: dia.movimiento ?? tema.movimiento,
      };
    }),
  };
}

export function cargarEstado(): EstadoApp {
  if (typeof window === "undefined") return memoriaRespaldo ?? generarSeed();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const reparado = repararEstado(JSON.parse(raw) as EstadoApp);
      memoriaRespaldo = reparado;
      guardarEstado(reparado);
      return reparado;
    }
  } catch {
    // sigue a generar seed
  }
  const nuevo = conDiagnosticoReal(generarSeed());
  guardarEstado(nuevo);
  return nuevo;
}

/** Devuelve true si logró persistir en localStorage (false = solo quedó en memoria de esta sesión). */
export function guardarEstado(estado: EstadoApp): boolean {
  memoriaRespaldo = estado;
  if (typeof window === "undefined") return true;
  try {
    localStorage.setItem(KEY, JSON.stringify(estado));
    return true;
  } catch {
    console.warn("EVA 40+: no se pudo guardar el estado de la app en localStorage.");
    return false;
  }
}

export function checkinDeHoy(estado: EstadoApp): Checkin | undefined {
  const hoy = isoFecha(new Date());
  return estado.checkins.find((c) => c.fecha === hoy);
}

export function diaRutaDeHoy(estado: EstadoApp) {
  const hoy = isoFecha(new Date());
  return estado.rutaSemana.find((d) => d.fecha === hoy);
}

/** Registra el check-in de hoy, recalcula racha e historial de score, y marca el día de la ruta
 * de hoy como completado — persiste el resultado y lo devuelve junto con si logró guardarse. */
/** Calcula la nueva racha al registrar el check-in de hoy: si ya existía uno hoy (edición), la
 * racha no cambia; si es la primera vez hoy, solo suma +1 cuando AYER también tiene check-in —
 * si hubo un hueco (faltó uno o más días), la racha se reinicia a 1 en vez de seguir sumando.
 * Sin esto, "días seguidos" queda mostrando un número falso después de cualquier día saltado. */
function calcularRacha(estado: EstadoApp): number {
  if (checkinDeHoy(estado)) return estado.rachaDias;
  const ayer = isoFecha(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const huboAyer = estado.checkins.some((c) => c.fecha === ayer);
  return huboAyer ? estado.rachaDias + 1 : 1;
}

export function registrarCheckinHoy(
  estado: EstadoApp,
  valores: EstadoDia,
  notas?: string
): { estado: EstadoApp; guardado: boolean } {
  const hoy = isoFecha(new Date());
  const rachaDias = calcularRacha(estado);
  const checkins = estado.checkins.filter((c) => c.fecha !== hoy);
  checkins.push({ fecha: hoy, ...valores, ...(notas?.trim() ? { notas: notas.trim() } : {}) });
  checkins.sort((a, b) => a.fecha.localeCompare(b.fecha));

  const scoreHistorial = estado.scoreHistorial.filter((p) => p.fecha !== hoy);
  scoreHistorial.push({ fecha: hoy, score: computeScoreDia(valores) });
  scoreHistorial.sort((a, b) => a.fecha.localeCompare(b.fecha));

  const rutaSemana = estado.rutaSemana.map((d) => (d.fecha === hoy ? { ...d, completado: true } : d));

  const nuevo: EstadoApp = {
    ...estado,
    checkins,
    scoreHistorial,
    rutaSemana,
    rachaDias,
  };
  const guardado = guardarEstado(nuevo);
  return { estado: nuevo, guardado };
}
