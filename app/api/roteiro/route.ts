import { roteiroExemplo, roteiroInput, roteiroItem, roteiroPrompt, type RoteiroItem } from "@/lib/demos/roteiro";
import { getProviders, openStream, shortModel } from "@/lib/ai/provider";
import { eventStream, rateLimit, sleep, tooMany, validatedLines, type DemoEvent } from "@/lib/ai/stream";

export const maxDuration = 60;

export async function POST(request: Request) {
  const limit = rateLimit(request, "roteiro", 6);
  if (!limit.ok) return tooMany(limit.retryAfter);

  const parsed = roteiroInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Pedido inválido." }, { status: 400 });
  const input = parsed.data;

  const out = eventStream<DemoEvent<RoteiroItem>>();
  const started = Date.now();

  (async () => {
    let itens = 0;
    let descartados = 0;
    let primeiroItemMs: number | undefined;
    const emit = (item: RoteiroItem) => {
      primeiroItemMs ??= Date.now() - started;
      itens++;
      out.send({ type: "item", data: item });
    };

    out.send({ type: "step", id: "validar", label: "Validar pedido", status: "ok", detail: "Zod" });

    if (!getProviders().length) {
      out.send({ type: "step", id: "gerar", label: "Gerar roteiro", status: "run", detail: "modo offline" });
      out.send({ type: "aviso", message: "Modo demonstração: nenhuma chave de IA configurada, exibindo um roteiro pré-gerado para Pirenópolis." });
      for (const item of roteiroExemplo) {
        await sleep(item.t === "dia" ? 520 : 260);
        emit(item);
      }
      out.send({ type: "step", id: "gerar", label: "Gerar roteiro", status: "ok", detail: "exemplo" });
      out.send({ type: "done", meta: { demo: true, ms: Date.now() - started, primeiroItemMs, itens, descartados } });
      return out.close();
    }

    try {
      out.send({ type: "step", id: "gerar", label: "Gerar roteiro", status: "run" });
      const { provider, text } = await openStream(roteiroPrompt(input), {
        maxTokens: 4000,
        temperature: 0.8,
        signal: request.signal,
      });
      const modelo = `${provider.label} · ${shortModel(provider.model)}`;
      out.send({ type: "step", id: "gerar", label: "Gerar roteiro", status: "run", detail: modelo });
      out.send({ type: "step", id: "validar-saida", label: "Validar cada item da resposta", status: "run", detail: "JSON Lines + Zod" });

      for await (const item of validatedLines(text, roteiroItem, () => descartados++)) {
        emit(item);
        if (item.t === "erro") break;
      }

      out.send({ type: "step", id: "gerar", label: "Gerar roteiro", status: "ok", detail: modelo });
      out.send({
        type: "step",
        id: "validar-saida",
        label: "Validar cada item da resposta",
        status: itens ? "ok" : "erro",
        detail: `${itens} ok${descartados ? ` · ${descartados} descartado(s)` : ""}`,
      });
      out.send({
        type: "done",
        meta: { demo: false, provider: provider.label, model: provider.model, ms: Date.now() - started, primeiroItemMs, itens, descartados },
      });
    } catch (err) {
      if (!request.signal.aborted) {
        console.error("[roteiro]", err);
        out.send({ type: "step", id: "gerar", label: "Gerar roteiro", status: "erro" });
        out.send({ type: "error", message: "A IA não respondeu agora. Tente de novo em alguns segundos." });
      }
    } finally {
      out.close();
    }
  })();

  return out.response;
}
