"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Clock, MapPin, Minus, Moon, Plus, Sun, Sunrise, Users } from "lucide-react";
import { estilos, grupos, orcamentos, roteiroDefaults, roteiroInput, type RoteiroInput, type RoteiroItem } from "@/lib/demos/roteiro";
import { useDemoStream } from "@/lib/use-demo-stream";
import { ROTEIRO_PENDENTE, on } from "@/lib/bus";
import { Chips, Field, Notice, PipelineTrace, RunButton, Segmented, SkeletonLine, TextInput, itemMotion } from "./parts";

const exemplos: { label: string; input: Partial<RoteiroInput> }[] = [
  { label: "Fim de semana em Ouro Preto a dois", input: { destino: "Ouro Preto, MG", dias: 2, pessoas: 2, grupo: "casal", estilos: ["cultura", "gastronomia"] } },
  { label: "Chapada dos Veadeiros com a galera", input: { destino: "Chapada dos Veadeiros, GO", dias: 4, pessoas: 6, grupo: "amigos", orcamento: "econômico", estilos: ["aventura", "natureza"] } },
  { label: "Rio de Janeiro em família", input: { destino: "Rio de Janeiro, RJ", dias: 5, pessoas: 4, grupo: "família", orcamento: "confortável", estilos: ["natureza", "cultura"] } },
];

export function RoteiroDemo() {
  const [form, setForm] = useState<RoteiroInput>(roteiroDefaults);
  const [enviado, setEnviado] = useState<RoteiroInput>(roteiroDefaults);
  const formRef = useRef(form);
  const demo = useDemoStream<RoteiroItem>("/api/roteiro");
  const { run } = demo;

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  useEffect(() => {
    const rodar = (params: Partial<RoteiroInput>) => {
      const next = { ...formRef.current, ...params };
      setForm(next);
      setEnviado(next);
      run(next);
    };

    // Pedido feito pela paleta em outra página: chega via sessionStorage.
    const timer = setTimeout(() => {
      let pendente: string | null = null;
      try {
        pendente = sessionStorage.getItem(ROTEIRO_PENDENTE);
        sessionStorage.removeItem(ROTEIRO_PENDENTE);
      } catch {}
      if (!pendente) return;
      const parsed = roteiroInput.partial().safeParse(JSON.parse(pendente));
      rodar(parsed.success ? parsed.data : {});
    }, 0);

    const off = on("portfolio:acao", (c) => {
      if (c.acao === "demo_roteiro") rodar((c.parametros ?? {}) as Partial<RoteiroInput>);
    });
    return () => {
      clearTimeout(timer);
      off();
    };
  }, [run]);

  const go = (patch: Partial<RoteiroInput> = {}) => {
    const next = { ...form, ...patch };
    setForm(next);
    setEnviado(next);
    run(next);
  };

  const set = <K extends keyof RoteiroInput>(k: K, v: RoteiroInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const running = demo.status === "running";

  return (
    <div className="grid overflow-hidden rounded-2xl border border-line-strong bg-paper lg:grid-cols-[360px_1fr]">
      <aside className="space-y-5 border-b border-line p-5 md:p-6 lg:border-r lg:border-b-0">
        <Field label="Destino">
          <TextInput value={form.destino} onChange={(v) => set("destino", v)} icon={<MapPin className="size-4" />} placeholder="Ex.: Bonito, MS" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Dias">
            <Segmented label="Dias" options={[1, 2, 3, 4, 5] as const} value={form.dias} onChange={(v) => set("dias", v)} />
          </Field>
          <Field label="Pessoas">
            <div className="flex items-center justify-between rounded-full border border-line-strong px-1 py-0.5">
              <button type="button" aria-label="Menos pessoas" onClick={() => set("pessoas", Math.max(1, form.pessoas - 1))} className="rounded-full p-1 text-ink-soft hover:bg-paper-2 hover:text-ink">
                <Minus className="size-3.5" />
              </button>
              <span className="flex items-center gap-1.5 text-sm tabular-nums">
                <Users className="size-3.5 text-muted" />
                {form.pessoas}
              </span>
              <button type="button" aria-label="Mais pessoas" onClick={() => set("pessoas", Math.min(12, form.pessoas + 1))} className="rounded-full p-1 text-ink-soft hover:bg-paper-2 hover:text-ink">
                <Plus className="size-3.5" />
              </button>
            </div>
          </Field>
        </div>
        <Field label="Grupo">
          <Chips options={grupos} value={form.grupo} onToggle={(v) => set("grupo", v)} />
        </Field>
        <Field label="Orçamento">
          <Chips options={orcamentos} value={form.orcamento} onToggle={(v) => set("orcamento", v)} />
        </Field>
        <Field label="Estilo" hint={`${form.estilos.length}/3`}>
          <Chips
            options={estilos}
            value={form.estilos}
            onToggle={(v) =>
              set(
                "estilos",
                form.estilos.includes(v) ? (form.estilos.length > 1 ? form.estilos.filter((x) => x !== v) : form.estilos) : [...form.estilos, v].slice(-3),
              )
            }
          />
        </Field>
        <RunButton running={running} onClick={() => go()}>
          Gerar roteiro
        </RunButton>
        <PipelineTrace steps={demo.steps} meta={demo.meta} />
      </aside>

      <div className="min-h-[520px] space-y-4 p-5 md:p-8 lg:max-h-[860px] lg:overflow-y-auto">
        {demo.aviso && <Notice tone="info">{demo.aviso}</Notice>}
        {demo.error && <Notice tone="error">{demo.error}</Notice>}
        {demo.status === "idle" ? <Vazio onPick={go} /> : <Resultado items={demo.items} running={running} pedido={enviado} />}
      </div>
    </div>
  );
}

function Vazio({ onPick }: { onPick: (p: Partial<RoteiroInput>) => void }) {
  return (
    <div className="flex h-full min-h-[460px] flex-col items-start justify-center">
      <p className="max-w-md font-serif text-4xl leading-[1.05] italic">O roteiro aparece aqui, dia a dia, enquanto é gerado.</p>
      <p className="mt-4 max-w-md text-sm text-ink-soft">Ajuste o formulário ou comece por um exemplo:</p>
      <div className="mt-6 flex w-full max-w-md flex-col">
        {exemplos.map((e) => (
          <button key={e.label} onClick={() => onPick(e.input)} className="group flex items-center justify-between border-t border-line py-3 text-left text-sm last:border-b">
            <span className="link-line">{e.label}</span>
            <MapPin className="size-4 text-muted transition group-hover:text-rust" />
          </button>
        ))}
      </div>
    </div>
  );
}

const periodoIcon = { manhã: Sunrise, tarde: Sun, noite: Moon } as const;
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const tons = ["var(--ink)", "var(--rust)", "#8a8578", "#c9a27e", "#5d6b35", "#46443f"];

function Resultado({ items, running, pedido }: { items: RoteiroItem[]; running: boolean; pedido: RoteiroInput }) {
  const resumo = items.find((i) => i.t === "resumo");
  const dias = items.filter((i) => i.t === "dia");
  const orcamento = items.find((i) => i.t === "orcamento");
  const dicas = items.filter((i) => i.t === "dica");
  const erro = items.find((i) => i.t === "erro");

  if (erro) return <Notice tone="warn">{erro.mensagem}</Notice>;

  return (
    <div className="space-y-4">
      {resumo ? (
        <motion.div {...itemMotion} className="border-b border-line pb-6">
          <h3 className="font-serif text-4xl leading-tight md:text-5xl">{resumo.titulo}</h3>
          <p className="mt-3 leading-relaxed text-ink-soft">{resumo.descricao}</p>
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-mono text-[10px] text-muted uppercase">Quando ir</dt>
              <dd>{resumo.melhorEpoca}</dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] text-muted uppercase">Como chegar</dt>
              <dd>{resumo.comoChegar}</dd>
            </div>
          </dl>
        </motion.div>
      ) : (
        running && <CardSkeleton />
      )}

      {dias.map((d) => (
        <motion.div key={d.dia} {...itemMotion} className="grid gap-4 border-b border-line py-5 md:grid-cols-[110px_1fr]">
          <div>
            <span className="font-mono text-xs text-rust">DIA {String(d.dia).padStart(2, "0")}</span>
            <h4 className="mt-1 font-serif text-2xl leading-tight">{d.tema}</h4>
          </div>
          <ol className="space-y-4">
            {d.atividades.map((a, i) => {
              const Icon = periodoIcon[a.periodo as keyof typeof periodoIcon] ?? Sun;
              return (
                <li key={i} className="grid grid-cols-[1.25rem_1fr] gap-3">
                  <Icon className="mt-0.5 size-4 text-muted" />
                  <div>
                    <p className="font-medium">
                      {a.titulo} <span className="ml-1 font-mono text-[10px] font-normal text-muted uppercase">{a.periodo}</span>
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{a.descricao}</p>
                    <p className="mt-1.5 flex gap-3 font-mono text-[11px] text-muted">
                      <span className={a.custo === "grátis" ? "text-rust" : ""}>{a.custo}</span>
                      {a.duracao && (
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" /> {a.duracao}
                        </span>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </motion.div>
      ))}
      {running && dias.length < pedido.dias && <CardSkeleton />}

      {orcamento && <Orcamento itens={orcamento.itens} observacao={orcamento.observacao} pessoas={pedido.pessoas} />}

      {dicas.length > 0 && (
        <motion.div {...itemMotion} className="pt-2">
          <p className="mb-3 font-mono text-[11px] tracking-wider text-muted uppercase">Dicas</p>
          <ul className="space-y-2.5">
            {dicas.map((d, i) => (
              <motion.li key={i} {...itemMotion} className="grid grid-cols-[1.25rem_1fr] gap-3 text-sm text-ink-soft">
                <span className="text-rust">→</span>
                {d.texto}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
}

function Orcamento({ itens, observacao, pessoas }: { itens: { categoria: string; valor: number }[]; observacao: string; pessoas: number }) {
  const total = itens.reduce((s, i) => s + i.valor, 0) || 1;
  return (
    <motion.div {...itemMotion} className="border-b border-line py-5">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <p className="font-mono text-[11px] tracking-wider text-muted uppercase">Orçamento estimado do grupo</p>
        <p className="text-right">
          <span className="font-serif text-3xl tabular-nums">{brl.format(total)}</span>
          {pessoas > 1 && <span className="block font-mono text-[11px] text-rust">{brl.format(total / pessoas)} por pessoa</span>}
        </p>
      </div>
      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full">
        {itens.map((i, idx) => (
          <motion.div
            key={i.categoria}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: `${(i.valor / total) * 100}%`, background: tons[idx % tons.length], transformOrigin: "left" }}
            title={`${i.categoria}: ${brl.format(i.valor)}`}
          />
        ))}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {itens.map((i, idx) => (
          <li key={i.categoria} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: tons[idx % tons.length] }} />
            <span className="text-ink-soft">{i.categoria}</span>
            <span className="ml-auto tabular-nums">{brl.format(i.valor)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted">{observacao} Valores estimados pela IA — confira antes de reservar.</p>
    </motion.div>
  );
}

function CardSkeleton() {
  return (
    <div className="space-y-3 border-b border-line py-5">
      <SkeletonLine className="w-1/3" />
      <SkeletonLine className="w-full" />
      <SkeletonLine className="w-4/5" />
    </div>
  );
}
