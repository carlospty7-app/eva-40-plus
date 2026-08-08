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

export async function POST(req: Request) {
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
