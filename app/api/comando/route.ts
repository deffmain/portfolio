import { z } from "zod";
import { comandoLocal, comandoPrompt, comandoSchema } from "@/lib/comando";
import { complete, getProviders, shortModel } from "@/lib/ai/provider";
import { rateLimit, tooMany } from "@/lib/ai/stream";

export const maxDuration = 30;

const body = z.object({ pergunta: z.string().trim().min(2).max(240) });

export async function POST(request: Request) {
  const limit = rateLimit(request, "comando", 15);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Pergunta inválida." }, { status: 400 });
  const { pergunta } = parsed.data;
  const started = Date.now();

  if (!getProviders().length) {
    return Response.json({ comando: comandoLocal(pergunta), via: "offline", ms: Date.now() - started });
  }

  try {
    const { provider, text } = await complete(comandoPrompt(pergunta), {
      maxTokens: 900,
      temperature: 0.2,
      json: true,
      timeoutMs: 15_000,
      signal: request.signal,
    });
    const comando = comandoSchema.parse(JSON.parse(text));
    return Response.json({ comando, via: `${provider.label} · ${shortModel(provider.model)}`, ms: Date.now() - started });
  } catch (err) {
    // Resposta inválida ou provedor fora do ar: o roteador local garante que a
    // paleta sempre faça alguma coisa útil.
    console.warn("[comando] usando roteador local:", err);
    return Response.json({ comando: comandoLocal(pergunta), via: "offline", ms: Date.now() - started });
  }
}
