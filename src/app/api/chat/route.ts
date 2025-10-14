import { NextRequest } from "next/server";
import OpenAI from "openai";

import contextConfig from "@/../config/context.json";

const apiKey =
  process.env.OPENAI_API_KEY ??
  process.env.NEXT_PUBLIC_OPENAI_API_KEY ??
  "";
const model = process.env.OPENAI_MODEL ?? "gpt-4.1";

const openai =
  apiKey != null && apiKey.length > 0
    ? new OpenAI({
        apiKey,
      })
    : null;

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function POST(request: NextRequest) {
  if (!openai) {
    return new Response(
      JSON.stringify({
        error: "La API de OpenAI no está configurada.",
      }),
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Solicitud inválida. No se pudo leer el cuerpo.",
      }),
      { status: 400 },
    );
  }

  const messages = (body as { messages?: ChatMessage[] }).messages;

  if (!Array.isArray(messages)) {
    return new Response(
      JSON.stringify({
        error: "El formato de mensajes es inválido.",
      }),
      { status: 400 },
    );
  }

  const sanitizedMessages: ChatMessage[] = messages
    .filter(
      (message): message is ChatMessage =>
        typeof message === "object" &&
        message !== null &&
        (message as ChatMessage).role !== undefined &&
        (message as ChatMessage).content !== undefined,
    )
    .map((message) => ({
      role: message.role,
      content: String(message.content),
    }));

  const systemMessages: ChatMessage[] = [
    {
      role: "system",
      content: contextConfig.systemPrompt,
    },
    {
      role: "system",
      content: contextConfig.contextInstructions,
    },
  ];

  const encoder = new TextEncoder();

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [...systemMessages, ...sanitizedMessages],
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (error) {
          console.error("Error en streaming de OpenAI:", error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: error.status ?? 500 },
      );
    }

    console.error("Error al generar la respuesta:", error);
    return new Response(
      JSON.stringify({
        error: "No se pudo generar la respuesta del asistente.",
      }),
      { status: 500 },
    );
  }
}
