"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Loader2, RotateCcw, SendHorizontal } from "lucide-react";
import { z } from "zod";
import {
  completarPedido,
  diasDe,
  perguntas,
  roteiroInput,
  type RoteiroDia,
  type RoteiroInput,
  type RoteiroItem,
} from "@/lib/demos/roteiro";
import { useDemoStream } from "@/lib/use-demo-stream";
import { ROTEIRO_PENDENTE, on } from "@/lib/bus";
import { Notice, PipelineTrace, SkeletonLine } from "./parts";

// Segue a tela "Nova viagem com a Avori" da Avori: conversa de seis perguntas
// à esquerda e a prévia do roteiro à direita, com a identidade do portfólio.

const entra = "animate-[chegada_0.45s_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none";

/** Campos válidos de um pedido parcial (paleta); o resto é descartado. */
function parcialValido(dados: unknown): Partial<RoteiroInput> {
  const shape = roteiroInput.shape;
  const saida: Record<string, unknown> = {};
  if (dados && typeof dados === "object") {
    for (const [k, v] of Object.entries(dados)) {
      const r = (shape[k as keyof typeof shape] as z.ZodType | undefined)?.safeParse(v);
      if (r?.success) saida[k] = r.data;
    }
  }
  return saida as Partial<RoteiroInput>;
}

export function RoteiroDemo() {
  // "Refazer" monta a simulação de novo: estado, stream e foco recomeçam juntos.
  const [rodada, setRodada] = useState(0);
  return <Simulacao key={rodada} refeita={rodada > 0} onRefazer={() => setRodada((r) => r + 1)} />;
}

function Simulacao({ refeita, onRefazer }: { refeita: boolean; onRefazer: () => void }) {
  const [respostas, setRespostas] = useState<string[]>([]);
  const [interesses, setInteresses] = useState<string[]>([]);
  const [marcados, setMarcados] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const [pedido, setPedido] = useState<RoteiroInput | null>(null);
  const demo = useDemoStream<RoteiroItem>("/api/roteiro");
  const { run } = demo;

  const conversaRef = useRef<HTMLDivElement>(null);
  const perguntaRef = useRef<HTMLDivElement>(null);
  // Para onde vai o foco depois da próxima renderização.
  const foco = useRef<"rolar" | "fixo" | null>(refeita ? "rolar" : null);
  const ids = useId();

  const passo = respostas.length;
  const atual = perguntas[passo];
  const running = demo.status === "running";
  const temPipeline = demo.steps.length > 0;

  const gerar = useCallback(
    (p: RoteiroInput) => {
      setPedido(p);
      run(p);
    },
    [run],
  );

  useEffect(() => {
    // Pedido da paleta: completa o que faltar, mostra a conversa respondida e gera.
    // Sem parâmetros, a paleta só traz a pessoa até a conversa.
    const rodar = (parcial: Partial<RoteiroInput>) => {
      if (!Object.keys(parcial).length) {
        setTimeout(() => perguntaRef.current?.focus({ preventScroll: true }), 50);
        return;
      }
      const p = completarPedido(parcial);
      setRespostas([p.destino, p.duracao, p.quem, p.ritmo, p.orcamento, p.interesses.join(", ")]);
      setInteresses(p.interesses);
      setMarcados([]);
      setTexto("");
      gerar(p);
    };

    // Vindo de outra página, o pedido espera no sessionStorage.
    const timer = setTimeout(() => {
      let pendente: unknown = null;
      try {
        const bruto = sessionStorage.getItem(ROTEIRO_PENDENTE);
        sessionStorage.removeItem(ROTEIRO_PENDENTE);
        pendente = bruto ? JSON.parse(bruto) : null;
      } catch {}
      if (pendente) rodar(parcialValido(pendente));
    }, 0);

    const off = on("portfolio:acao", (c) => {
      if (c.acao === "demo_roteiro") rodar(parcialValido(c.parametros));
    });
    return () => {
      clearTimeout(timer);
      off();
    };
  }, [gerar]);

  useEffect(() => {
    const conversa = conversaRef.current;
    if (conversa) conversa.scrollTop = conversa.scrollHeight;
    if (foco.current) {
      perguntaRef.current?.focus({ preventScroll: foco.current === "fixo" });
      foco.current = null;
    }
    // O painel do pipeline, ao aparecer, encolhe a conversa: rola de novo.
  }, [passo, demo.status, temPipeline]);

  function avancar(exibida: string, viaTexto: boolean, lista?: string[]) {
    const novas = [...respostas, exibida];
    setRespostas(novas);
    setTexto("");
    setMarcados([]);
    if (lista) setInteresses(lista);
    // Quem respondeu pelo campo continua nele; o chip some, então o foco vai
    // para a pergunta seguinte. Na última, o campo também some.
    if (!viaTexto || novas.length === perguntas.length) foco.current = "fixo";
    if (novas.length === perguntas.length) {
      const [destino, duracao, quem, ritmo, orcamento] = novas;
      gerar({ destino, duracao, dias: diasDe(duracao), quem, ritmo, orcamento, interesses: lista ?? interesses });
    }
  }

  const minimo = atual?.id === "destino" ? 2 : 1;
  const textoOk = texto.trim().length >= minimo;

  function enviarTexto() {
    if (!atual || !textoOk) return;
    const v = texto.trim();
    if (atual.multipla) {
      const lista = [...new Set([...marcados, v])].slice(0, 6);
      avancar(lista.join(", "), true, lista);
    } else avancar(v, true);
  }

  const dias = demo.items.filter((i): i is RoteiroDia => i.t === "dia").sort((a, b) => a.dia - b.dia);
  const erroModelo = demo.items.find((i) => i.t === "erro");
  const total = pedido?.dias ?? (respostas[1] ? diasDe(respostas[1]) : 3);
  const recebidos = new Set(dias.map((d) => d.dia));
  const faltam = Array.from({ length: total }, (_, i) => i + 1).filter((n) => !recebidos.has(n));
  const falhou = demo.status === "error" || !!erroModelo;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,440px)_minmax(0,1fr)] lg:gap-8">
      <section
        aria-label="Conversa"
        className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line-strong bg-paper lg:sticky lg:top-24 lg:h-[640px] lg:self-start"
      >
        <header className="border-b border-line px-5 py-4">
          <p className="font-mono text-[11px] tracking-wider text-ink-soft uppercase">{atual ? `Pergunta ${passo + 1} de ${perguntas.length}` : "Tudo respondido"}</p>
          <div
            role="progressbar"
            aria-label="Perguntas respondidas"
            aria-valuemin={0}
            aria-valuemax={perguntas.length}
            aria-valuenow={passo}
            className="mt-3 flex gap-1"
          >
            {perguntas.map((p, i) => (
              <span key={p.id} className={`h-1 flex-1 rounded-full transition-colors motion-reduce:transition-none ${i < passo ? "bg-ink" : "bg-line"}`} />
            ))}
          </div>
        </header>

        <div ref={conversaRef} className="flex max-h-[26rem] min-h-[18rem] flex-col overflow-y-auto px-5 py-5 lg:max-h-none lg:min-h-0 lg:flex-1">
          <div role="log" aria-live="polite" aria-label="Perguntas e respostas" className="mt-auto flex flex-col gap-3">
            {respostas.map((r, i) => (
              <div key={perguntas[i].id} className="flex flex-col gap-3">
                <BolhaPergunta>{perguntas[i].texto}</BolhaPergunta>
                <BolhaResposta>{r}</BolhaResposta>
              </div>
            ))}

            {atual ? (
              <div
                key={atual.id}
                ref={perguntaRef}
                tabIndex={-1}
                role="group"
                aria-labelledby={`${ids}-pergunta`}
                className={`flex flex-col gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-rust/40 ${entra}`}
              >
                <BolhaPergunta atual id={`${ids}-pergunta`}>
                  {atual.texto}
                  {atual.ajuda && <span className="mt-1 block font-sans text-xs text-muted">{atual.ajuda}</span>}
                </BolhaPergunta>
                <div className="flex flex-wrap gap-2">
                  {atual.opcoes.map((o) => {
                    const marcado = marcados.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={atual.multipla ? marcado : undefined}
                        onClick={() =>
                          atual.multipla ? setMarcados((m) => (marcado ? m.filter((x) => x !== o) : [...m, o])) : avancar(o, false)
                        }
                        className={`min-h-11 rounded-full border px-4 text-sm transition-colors motion-reduce:transition-none ${
                          marcado ? "border-ink bg-ink text-paper" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                  {atual.multipla && (
                    <button
                      type="button"
                      disabled={!marcados.length}
                      onClick={() => avancar(marcados.join(", "), false, marcados)}
                      className="min-h-11 rounded-full bg-rust px-5 text-sm font-medium text-paper transition-colors enabled:hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
                    >
                      Continuar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div ref={perguntaRef} tabIndex={-1} className={`flex flex-col rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-rust/40 ${entra}`}>
                <BolhaPergunta atual>
                  {falhou ? (
                    "Não consegui montar este roteiro. Veja o aviso na prévia e use Refazer para tentar de novo."
                  ) : demo.status === "done" ? (
                    "Pronto. Veja a prévia do roteiro."
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 aria-hidden className="size-4 shrink-0 animate-spin text-rust motion-reduce:animate-none" />
                      Montando um roteiro para {respostas[0]}…
                    </span>
                  )}
                </BolhaPergunta>
              </div>
            )}
          </div>
        </div>

        {atual ? (
          <form
            className="flex items-center gap-2 border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault();
              enviarTexto();
            }}
          >
            <label htmlFor={`${ids}-texto`} className="sr-only">
              Sua resposta para: {atual.texto}
            </label>
            <input
              id={`${ids}-texto`}
              value={texto}
              maxLength={60}
              autoComplete="off"
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ou escreva com suas palavras"
              className="min-h-11 min-w-0 flex-1 rounded-full border border-line-strong bg-paper px-4 text-base text-ink outline-none transition-colors placeholder:text-muted focus:border-ink sm:text-sm"
            />
            <button
              type="submit"
              disabled={!textoOk}
              aria-label="Enviar resposta"
              className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-paper transition-colors enabled:hover:bg-rust disabled:opacity-40 motion-reduce:transition-none"
            >
              <SendHorizontal aria-hidden className="size-4" />
            </button>
          </form>
        ) : (
          temPipeline && (
            <div className="border-t border-line p-3">
              <PipelineTrace steps={demo.steps} meta={demo.meta} />
            </div>
          )
        )}
      </section>

      <section aria-label="Prévia do roteiro" aria-busy={running} className="flex min-w-0 flex-col gap-3">
        <div className="rounded-2xl bg-ink px-6 py-6 text-paper md:px-7">
          <div className="flex items-start justify-between gap-4">
            <p className="font-mono text-[10px] tracking-[0.16em] text-[#e0764f] uppercase">Prévia do roteiro</p>
            {pedido && (
              <p className="font-mono text-[11px] text-paper/60 tabular-nums">
                {dias.length}/{total} {total === 1 ? "dia" : "dias"}
              </p>
            )}
          </div>
          <h3 className="mt-2 font-serif text-4xl leading-none [overflow-wrap:anywhere] md:text-5xl">{respostas[0] ?? "Seu destino"}</h3>
          <p className="mt-2 text-sm text-paper/75 [overflow-wrap:anywhere]">
            {[respostas[1], respostas[2]].filter(Boolean).join(" · ") || "Responda às perguntas da conversa"}
          </p>
        </div>

        {demo.aviso && <Notice tone="info">{demo.aviso}</Notice>}
        {demo.error && <Notice tone="error">{demo.error}</Notice>}
        {erroModelo && <Notice tone="warn">{erroModelo.mensagem}</Notice>}

        {!pedido
          ? Array.from({ length: Math.min(total, 3) }, (_, i) => (
              <Reserva key={i} dia={i + 1}>
                Aparece quando você terminar as perguntas
              </Reserva>
            ))
          : !erroModelo && (
              <>
                {dias.map((d) => (
                  <CartaoDia key={d.dia} dia={d} />
                ))}
                {running &&
                  faltam.map((n, i) =>
                    i === 0 ? (
                      <div key={n} className="space-y-3 rounded-2xl border border-line px-5 py-4">
                        <div className="flex items-center gap-3">
                          <SeloDia dia={n} apagado />
                          <span className="text-sm text-muted">Montando…</span>
                        </div>
                        <SkeletonLine className="w-3/4 motion-reduce:animate-none" />
                        <SkeletonLine className="w-1/2 motion-reduce:animate-none" />
                      </div>
                    ) : (
                      <Reserva key={n} dia={n}>
                        Montando…
                      </Reserva>
                    ),
                  )}
              </>
            )}

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <p className="min-w-0 flex-1 basis-60 text-sm text-ink-soft">
            Na Avori, este passo cria a viagem com o roteiro. Aqui é uma demonstração: nada é salvo.
          </p>
          <button
            type="button"
            onClick={onRefazer}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-sm text-ink transition-colors hover:border-ink motion-reduce:transition-none"
          >
            <RotateCcw aria-hidden className="size-4" />
            Refazer
          </button>
        </div>
      </section>
    </div>
  );
}

function BolhaPergunta({ children, atual, id }: { children: ReactNode; atual?: boolean; id?: string }) {
  return (
    <div
      id={id}
      className={`max-w-[88%] self-start rounded-2xl rounded-bl-md border border-line bg-paper-2/70 px-4 py-2.5 font-serif leading-snug ${
        atual ? "text-xl text-ink" : "text-lg text-ink-soft"
      }`}
    >
      {children}
    </div>
  );
}

function BolhaResposta({ children }: { children: ReactNode }) {
  return (
    <div className={`max-w-[88%] self-end rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm text-paper [overflow-wrap:anywhere] ${entra}`}>
      {children}
    </div>
  );
}

function SeloDia({ dia, apagado }: { dia: number; apagado?: boolean }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[10px] tracking-wider uppercase ${apagado ? "bg-paper-2 text-muted" : "bg-ink text-paper"}`}
    >
      Dia {dia}
    </span>
  );
}

function Reserva({ dia, children }: { dia: number; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-line-strong px-5 py-3.5">
      <SeloDia dia={dia} apagado />
      <span className="text-sm text-muted">{children}</span>
    </div>
  );
}

function CartaoDia({ dia }: { dia: RoteiroDia }) {
  return (
    <article className={`rounded-2xl border border-line-strong bg-paper px-5 py-4 ${entra}`}>
      <header className="flex items-center gap-3">
        <SeloDia dia={dia.dia} />
        <h4 className="font-serif text-2xl leading-tight [overflow-wrap:anywhere]">{dia.tema}</h4>
      </header>
      <ol className="mt-3 space-y-1.5">
        {dia.atividades.map((a, i) => (
          <li key={i} className="grid grid-cols-[3.25rem_1fr] gap-3 text-sm leading-relaxed">
            <span className="font-mono text-rust tabular-nums">{a.hora}</span>
            <span className="text-ink [overflow-wrap:anywhere]">{a.titulo}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
