// Camada de provedores de LLM. Groq e Gemini expõem a mesma API compatível com
// OpenAI, então um único cliente HTTP atende os dois. A ordem da lista define o
// fallback: se o primeiro falhar antes de responder, tenta o próximo.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type Provider = {
  id: "groq" | "gemini";
  label: string;
  baseURL: string;
  apiKey: string;
  model: string;
  tokenParam: "max_tokens" | "max_completion_tokens";
  extra: Record<string, unknown>;
};

export function getProviders(): Provider[] {
  const list: Provider[] = [];

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const model = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
    list.push({
      id: "groq",
      label: "Groq",
      baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
      apiKey: groqKey,
      model,
      tokenParam: "max_completion_tokens",
      // Modelos de raciocínio: esforço baixo mantém a latência de demo ao vivo.
      extra: model.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {},
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    list.push({
      id: "gemini",
      label: "Gemini",
      baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
      apiKey: geminiKey,
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
      tokenParam: "max_tokens",
      extra: {},
    });
  }

  return list;
}

export function shortModel(model: string) {
  return model.split("/").pop() ?? model;
}

type ChatOptions = {
  maxTokens: number;
  temperature?: number;
  json?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
};

export class NoProviderError extends Error {
  constructor() {
    super("Nenhum provedor de IA configurado");
  }
}

async function request(provider: Provider, messages: ChatMessage[], opts: ChatOptions, stream: boolean) {
  const timeout = AbortSignal.timeout(opts.timeoutMs ?? 30_000);
  const signal = opts.signal ? AbortSignal.any([opts.signal, timeout]) : timeout;

  const res = await fetch(`${provider.baseURL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages,
      stream,
      temperature: opts.temperature ?? 0.7,
      [provider.tokenParam]: opts.maxTokens,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      ...provider.extra,
    }),
    signal,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${provider.label} ${res.status}: ${body.slice(0, 200)}`);
  }
  return res;
}

/** Chamada sem streaming, com fallback entre provedores. */
export async function complete(messages: ChatMessage[], opts: ChatOptions) {
  const providers = getProviders();
  if (!providers.length) throw new NoProviderError();

  let lastError: unknown;
  for (const provider of providers) {
    try {
      const res = await request(provider, messages, opts, false);
      const data = await res.json();
      const text: string = data?.choices?.[0]?.message?.content ?? "";
      if (!text.trim()) throw new Error(`${provider.label}: resposta vazia`);
      return { provider, text };
    } catch (err) {
      if (opts.signal?.aborted) throw err;
      lastError = err;
      console.warn("[ai] falha no provedor, tentando o próximo:", err);
    }
  }
  throw lastError;
}

/**
 * Abre um stream com o primeiro provedor que responder. O fallback só acontece
 * na conexão: depois que o texto começa a chegar, trocar de modelo no meio
 * produziria uma resposta incoerente.
 */
export async function openStream(messages: ChatMessage[], opts: ChatOptions) {
  const providers = getProviders();
  if (!providers.length) throw new NoProviderError();

  let lastError: unknown;
  for (const provider of providers) {
    try {
      const res = await request(provider, messages, { timeoutMs: 60_000, ...opts }, true);
      return { provider, text: readDeltas(res.body!) };
    } catch (err) {
      if (opts.signal?.aborted) throw err;
      lastError = err;
      console.warn("[ai] falha ao abrir stream, tentando o próximo:", err);
    }
  }
  throw lastError;
}

/** Converte o SSE do formato OpenAI em pedaços de texto. */
async function* readDeltas(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta) yield delta;
        } catch {
          // keep-alive ou chunk malformado: ignora
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
