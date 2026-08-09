import { readFileSync } from "fs";
import path from "path";
import { SINTOMAS_CICLO } from "@/lib/app/types";
import type { Checkin, RegistroCiclo } from "@/lib/app/types";

let conocimientoCache: string | null = null;

function leerConocimientoMaru(): string {
  if (conocimientoCache) return conocimientoCache;
  const ruta = path.join(process.cwd(), "docs", "maru-conocimiento-borrador.md");
  conocimientoCache = readFileSync(ruta, "utf-8");
  return conocimientoCache;
}

const PERSONA_Y_REGLAS = `Eres EVA, la guía de bienestar dentro de la app EVA 40+. Hablas con el mismo tono
de Maru (María Eugenia Méndez, nutricionista): cercano, directo, empático, sin tecnicismos
innecesarios. No eres un chatbot genérico — respondes como si Maru te hubiera compartido su forma
de ver la nutrición, los hábitos y el cuidado del cuerpo en la perimenopausia.

Respondes en español, en mensajes cortos (2-4 frases), como una conversación real, no un ensayo.

REGLAS QUE NUNCA ROMPES:
1. Puedes dar sugerencias generales de alimentación, hábitos, inflamación y perimenopausia
   basadas en lo que la usuaria te cuenta y en su revisión de hoy (los 6 campos: inflamación,
   energía, sueño, estrés, antojos, digestión).
2. Si la pregunta menciona un diagnóstico ya confirmado (ej. "tengo Hashimoto", "tengo SIBO"),
   pide un protocolo intensivo (jugoterapia, desparasitación, ayunos largos más de 16-18h, dieta
   de eliminación por fases), o los síntomas suenan a algo que merece revisión médica (sangrado
   más seguido que cada 3 semanas o muy abundante, manchado entre reglas, cualquier sangrado
   después de la menopausia, o ánimo bajo/tristeza persistente que no mejora) — VALIDAS lo que
   siente, y le dices que lo mejor es agendar una sesión exploratoria con Maru (o ver a su
   médico/ginecólogo si es un tema de sangrado o ánimo), y NO das ningún protocolo ni diagnóstico.
3. Nunca mencionas fármacos, dosis, ni tipos de tratamiento hormonal — eso es territorio
   exclusivamente médico.
4. Nunca inventas datos, estudios ni resultados que no estén en tu conocimiento. Si no sabes
   algo, dilo con honestidad y sugiere la sesión con Maru.
5. No diagnosticas. Das sugerencias generales de estilo de vida, nunca un dictamen médico.

CÓMO ARRANCAS UNA CONVERSACIÓN NUEVA (cuando el historial está vacío):
- Si la usuaria escribió notas libres contándote cómo se siente y qué quiere lograr, respóndele
  primero a eso — no le tires una lista de preguntas de golpe.
- Cuando ya tengas algo de contexto (por sus notas o por lo que te cuenta), puedes sugerir de forma
  proactiva 1-2 apoyos generales de inicio que Maru recomienda ampliamente (magnesio 200-500mg con
  la cena, hidratación, infusión de anís estrella + clavo) — siempre con lenguaje de "puede
  ayudarte a empezar", nunca como indicación médica ni dosis clínica personalizada. No hace falta
  que la usuaria pregunte por suplementos para que se los menciones la primera vez.

SOBRE SU CICLO/SANGRADO (si te paso ese dato abajo): a los 40+ el ciclo suele volverse irregular
por la perimenopausia — NUNCA asumas un patrón de 28 días, nunca le digas cuándo "le tocaría" o
"debería" sangrar, y nunca le sugieras que algo está mal solo por ser irregular. Si te cuenta un
patrón real que ya viene de sus propios datos (ej. más antojos en días de sangrado), puedes
nombrarlo con validación ("es común, tu cuerpo no está fallando"), nunca como diagnóstico.`;

function resumenCheckin(checkin: Checkin | null): string {
  if (!checkin) {
    return "La usuaria todavía no hizo su revisión de hoy — no asumas cómo se siente, pregúntale si hace falta.";
  }
  const notas = checkin.notas?.trim()
    ? `\nLo que la usuaria escribió/dictó libremente hoy sobre cómo se siente y qué quiere lograr: "${checkin.notas.trim()}"`
    : "";
  return `DATOS DE HOY DE LA USUARIA (escala 1-5; para inflamación/estrés/antojos más alto es peor, para energía/sueño/digestión más alto es mejor):
- Inflamación: ${checkin.inflamacion}/5 · Energía: ${checkin.energia}/5 · Sueño: ${checkin.sueno}/5
- Estrés: ${checkin.estres}/5 · Antojos: ${checkin.antojos}/5 · Digestión: ${checkin.digestion}/5${notas}
Usa estos datos para que tu respuesta se sienta hecha a la medida de cómo se siente hoy, no genérica —
pero solo cuando sea relevante a la pregunta, no los repitas en cada mensaje.`;
}

/** Resume los últimos días (sin contar hoy) para que EVA pueda recordar de verdad lo que la
 * usuaria contó antes ("la semana pasada dormías mal, ¿cómo vas ahora?") en vez de tratar cada
 * conversación como si arrancara de cero. Solo con datos reales que existan — si no hay historial
 * previo, no menciona nada. */
function resumenHistorialReciente(checkinsRecientes: Checkin[], hoyIso: string): string {
  const previos = checkinsRecientes.filter((c) => c.fecha !== hoyIso).slice(-6);
  if (previos.length === 0) return "";

  const lineas = previos.map((c) => {
    const notaCorta = c.notas?.trim() ? ` — dijo: "${c.notas.trim().slice(0, 140)}"` : "";
    return `  · ${c.fecha}: inflamación ${c.inflamacion}/5, energía ${c.energia}/5, sueño ${c.sueno}/5, estrés ${c.estres}/5, antojos ${c.antojos}/5, digestión ${c.digestion}/5${notaCorta}`;
  });

  return `\n\nHISTORIAL RECIENTE (días anteriores a hoy, más viejo a más nuevo — úsalo para recordar lo
que la usuaria vino contando, no para repetírselo todo de memoria; solo menciónalo cuando sea
natural, ej. si preguntó "¿cómo voy?" o si algo mejoró/empeoró de forma notable):
${lineas.join("\n")}`;
}

const SINTOMA_LABEL: Record<string, string> = Object.fromEntries(SINTOMAS_CICLO.map((s) => [s.id, s.label]));

/** Resume los registros de ciclo recientes (sin contar hoy) — libre, no un calendario, así que
 * solo describe lo que la usuaria fue registrando, sin calcular "días desde el último periodo" ni
 * nada que suene a predicción. */
function resumenCicloReciente(registrosRecientes: RegistroCiclo[], hoyIso: string): string {
  const previos = registrosRecientes.filter((r) => r.fecha !== hoyIso).slice(-10);
  if (previos.length === 0) return "";

  const lineas = previos.map((r) => {
    const sintomas = r.sintomas.length ? ` (${r.sintomas.map((s) => SINTOMA_LABEL[s] ?? s).join(", ")})` : "";
    const notaCorta = r.notas?.trim() ? ` — dijo: "${r.notas.trim().slice(0, 100)}"` : "";
    return `  · ${r.fecha}: ${r.sangrado ? "con sangrado" : "sin sangrado"}${sintomas}${notaCorta}`;
  });

  return `\n\nREGISTROS DE CICLO RECIENTES (registro libre de la propia usuaria, no un calendario — no
calcules ni asumas fechas futuras a partir de esto):
${lineas.join("\n")}`;
}

/**
 * Separado en bloque estable (persona + reglas + conocimiento — cacheable, no cambia
 * entre requests) y bloque dinámico (los datos de hoy — cambian por usuaria/día). El
 * bloque estable va en su propio content block del system prompt con cache_control,
 * y el dinámico va DESPUÉS, sin caché — así no se invalida el caché grande por un dato
 * que cambia todos los días.
 */
export function construirSystemPromptEstable(): string {
  return `${PERSONA_Y_REGLAS}

--- CONOCIMIENTO DE MARU (tu base de conocimiento completa) ---
${leerConocimientoMaru()}`;
}

export function construirSystemPromptDinamico(
  checkin: Checkin | null,
  checkinsRecientes: Checkin[] = [],
  registrosCicloRecientes: RegistroCiclo[] = [],
): string {
  const hoyIso = new Date().toISOString().slice(0, 10);
  return (
    resumenCheckin(checkin) +
    resumenHistorialReciente(checkinsRecientes, hoyIso) +
    resumenCicloReciente(registrosCicloRecientes, hoyIso)
  );
}
