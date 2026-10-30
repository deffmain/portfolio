import type { z } from "zod";

// Eventos que as rotas de demo enviam ao navegador, um JSON por linha (NDJSON).
export type StepStatus = "run" | "ok" | "erro" | "skip";

export type DemoEvent<Item, Extra = never> =
  | { type: "step"; id: string; label: string; status: StepStatus; detail?: string }
  | { type: "item"; data: Item }
  | { type: "aviso"; message: string }
  | { type: "done"; meta: DemoMeta }
  | { type: "error"; message: string }
  | Extra;

export type DemoMeta = {
  demo: boolean;
  provider?: string;
  model?: string;
  ms: number;
  primeiroItemMs?: number;
  itens: number;
  descartados: number;
};

export function eventStream<E>() {
  const encoder = new TextEncoder();
  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c;
    },
    cancel() {
      closed = true;
    },
  });

  return {
    response: new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
      },
    }),
    send(event: E) {
      if (closed) return;
      controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
    },
    close() {
      if (closed) return;
      closed = true;
      controller.close();
    },
    get closed() {
      return closed;
    },
  };
}

/**
 * Lê o texto do modelo como JSON Lines e devolve cada objeto já validado pelo
 * schema. Linhas inválidas são contadas e descartadas em vez de derrubar a
 * resposta inteira — o modelo erra às vezes, a interface não deve quebrar.
 */
export async function* validatedLines<S extends z.ZodType>(
  text: AsyncIterable<string>,
  schema: S,
  onInvalid: (line: string) => void,
): AsyncGenerator<z.infer<S>> {
  let buffer = "";

  function* parse(line: string) {
    const clean = line.trim().replace(/^```(?:json|jsonl)?/, "").replace(/```$/, "").trim();
    if (!clean || !clean.startsWith("{")) return;
    try {
      const result = schema.safeParse(JSON.parse(clean));
      if (result.success) yield result.data as z.infer<S>;
      else onInvalid(clean);
    } catch {
      onInvalid(clean);
    }
  }

  for await (const chunk of text) {
    buffer += chunk;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) yield* parse(line);
  }
  yield* parse(buffer);
}

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Rate limit em memória por instância. Simples de propósito: protege a cota
// gratuita contra abuso casual sem exigir Redis.
const hits = new Map<string, number[]>();

export function rateLimit(request: Request, bucket: string, limit: number, windowMs = 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false as const, retryAfter: Math.ceil((windowMs - (now - recent[0])) / 1000) };
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return { ok: true as const };
}

export function tooMany(retryAfter: number) {
  return Response.json(
    { error: `Muitas requisições. Tente de novo em ${retryAfter}s.` },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
