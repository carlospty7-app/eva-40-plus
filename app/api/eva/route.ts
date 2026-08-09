import Anthropic from "@anthropic-ai/sdk";
import { construirSystemPromptDinamico, construirSystemPromptEstable } from "@/lib/ai/systemPrompt";
import type { Checkin } from "@/lib/app/types";

export const runtime = "nodejs";

const client = new Anthropic();

type MensajeChat = { role: "user" | "assistant"; content: string };

type CuerpoRequest = {
  mensajes: MensajeChat[];
  checkinHoy: Checkin | null;
};

const MAX_MENSAJE_CHARS = 800;
const MAX_NOTAS_CHARS = 500;
const LIMITE_VENTANA_MS = 5 * 60 * 1000; // 5 minutos
const LIMITE_REQUESTS = 20; // por IP, por ventana

// Freno de abuso mientras no hay sesión/plan real (Supabase pendiente) — vive en memoria del
// proceso, así que no es a prueba de balas en serverless (se resetea en cold start / no se
// comparte entre instancias), pero corta el caso obvio de alguien golpeando el endpoint sin
// límite. Se reemplaza por control real por sesión+plan cuando Supabase Auth esté conectado.
const requestsPorIp = new Map<string, number[]>();

function excedeLimite(ip: string): boolean {
  const ahora = Date.now();
  const previos = (requestsPorIp.get(ip) ?? []).filter((t) => ahora - t < LIMITE_VENTANA_MS);
  previos.push(ahora);
  requestsPorIp.set(ip, previos);
  return previos.length > LIMITE_REQUESTS;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocida";
  if (excedeLimite(ip)) {
    return new Response("Demasiadas solicitudes — espera unos minutos e intenta de nuevo.", {
      status: 429,
    });
  }

  let body: CuerpoRequest;
  try {
    body = (await req.json()) as CuerpoRequest;
  } catch {
    return new Response("Solicitud inválida", { status: 400 });
  }

  const { mensajes, checkinHoy } = body;
  if (!Array.isArray(mensajes) || mensajes.length === 0) {
    return new Response("Falta el mensaje", { status: 400 });
  }
  if (mensajes.some((m) => typeof m.content !== "string" || m.content.length > MAX_MENSAJE_CHARS)) {
    return new Response(`Cada mensaje puede tener como máximo ${MAX_MENSAJE_CHARS} caracteres.`, {
      status: 400,
    });
  }
  if (checkinHoy?.notas && checkinHoy.notas.length > MAX_NOTAS_CHARS) {
    return new Response("Tus notas de hoy son demasiado largas.", { status: 400 });
  }

  const ultimos = mensajes.slice(-12);

  const stream = client.messages.stream({
    model: process.env.AI_MODEL || "claude-haiku-4-5",
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: construirSystemPromptEstable(),
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: construirSystemPromptDinamico(checkinHoy),
      },
    ],
    messages: ultimos.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            "\n\nAlgo falló de mi lado. Intenta de nuevo en un momento, o si sigue pasando, cuéntaselo a soporte.",
          ),
        );
        console.error("Error en stream de EVA:", err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
