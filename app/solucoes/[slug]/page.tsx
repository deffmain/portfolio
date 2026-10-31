import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { ArrowLeft, ArrowUpRight, Lock } from "lucide-react";
import { perfil, solucoes } from "@/content/perfil";
import { SiteHeader } from "@/components/site-header";
import { Contato } from "@/components/contato";
import { CommandPalette } from "@/components/command-palette";
import { VisualSolucao, legendaVisual } from "@/components/visuais";
import { Label, Lines, Reveal } from "@/components/ui";
import { VoltarLink } from "@/components/voltar-link";
import { RolarParaTopo } from "@/components/rolar-topo";
import { RoteiroDemo } from "@/components/lab/roteiro-demo";

export function generateStaticParams() {
  return solucoes.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/solucoes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = solucoes.find((x) => x.slug === slug);
  if (!s) return {};
  return {
    title: `${s.nome} — ${perfil.nome}`,
    description: `${s.problemaCurto} ${s.resultado}`,
  };
}

const wrap = "mx-auto max-w-[1400px] px-5 md:px-10";

/** Ordem na cascata de chegada (classe .chegada em globals.css). */
const atraso = (d: number) => ({ "--d": d }) as React.CSSProperties;

export default async function SolucaoPage({ params }: PageProps<"/solucoes/[slug]">) {
  // REVISAO[ADV-20261030-2152-01] baixa — await params fora de <Suspense> com partialPrefetching gera o erro "URL data during prerendering" no dev (pré-existente, não vem deste diff) → .claude/revisoes/2026-10-30-2152-adversarial.md
  const { slug } = await params;
  const idx = solucoes.findIndex((s) => s.slug === slug);
  if (idx === -1) notFound();
  const s = solucoes[idx];
  const proxima = solucoes[(idx + 1) % solucoes.length];

  return (
    <>
      <RolarParaTopo />
      <SiteHeader />
      {/* Entrada/saída da página nas transições home ⇄ estudo de caso */}
      <ViewTransition
        enter={{ "abrir-projeto": "caso-entra", default: "none" }}
        exit={{ "voltar-projeto": "caso-sai", default: "none" }}
        default="none"
      >
        <div>
      <main>
        <section className={`${wrap} pt-28 md:pt-32`}>
          <div className="chegada flex items-center justify-between border-b border-line pb-4" style={atraso(0)}>
            <VoltarLink slug={s.slug} className="group inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
              <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              <span className="link-line">Todas as soluções</span>
            </VoltarLink>
            <Label className="text-muted">
              {String(idx + 1).padStart(2, "0")} / {String(solucoes.length).padStart(2, "0")}
            </Label>
          </div>

          <h1 className="mt-8 font-serif text-[clamp(3.5rem,11vw,11rem)] leading-[0.88] tracking-[-0.025em] md:mt-12">
            <ViewTransition name={`titulo-${s.slug}`} share="morph" default="none">
              <span className="inline-block">{s.nome}</span>
            </ViewTransition>
          </h1>

          {/* Capa: o card da frente do anel pousa aqui (morph capa-…). Sem Reveal:
              o morph já é a entrada. */}
          <div className="mt-8 rounded-2xl border border-line bg-paper-2 px-4 py-6 md:mt-12 md:px-16 md:py-12">
            <ViewTransition name={`capa-${s.slug}`} share="morph" default="none">
              <div className="mx-auto max-w-4xl overflow-hidden rounded-xl border border-line bg-paper-2 shadow-[0_24px_50px_-18px_rgb(20_20_19/0.45)]">
                <VisualSolucao visual={s.visual} className="block aspect-[16/10] h-auto w-full" destaque />
              </div>
            </ViewTransition>
          </div>
          <p className="chegada mt-3 font-mono text-[11px] text-muted" style={atraso(1)}>
            {legendaVisual(s.visual)}
          </p>

          <div className="mt-12 grid gap-10 md:mt-16 md:grid-cols-12">
            <p className="chegada font-serif text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.1] italic md:col-span-7" style={atraso(2)}>
              {s.problemaCurto}
            </p>
            <div className="chegada md:col-span-4 md:col-start-9" style={atraso(3)}>
              <dl className="divide-y divide-line border-y border-line text-sm">
                {[
                  ["Contexto", s.contexto],
                  ["Ano", s.ano],
                  ["Papel", s.papel],
                ].map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[6rem_1fr] gap-4 py-3">
                    <dt className="font-mono text-[11px] text-muted uppercase">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <div className={`${wrap} py-20 md:py-32`}>
          <Bloco n="01" titulo="O problema">
            <p className="text-[clamp(1.25rem,2vw,1.6rem)] leading-snug text-pretty">{s.problema}</p>
          </Bloco>

          <Bloco n="02" titulo="O que construí">
            <div className="space-y-5 text-lg leading-relaxed text-pretty text-ink-soft">
              {s.solucao.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Bloco>

          <Bloco n="03" titulo="Como construí">
            <ul className="border-b border-line">
              {s.processo.map((p) => (
                <li key={p.texto} className="grid gap-2 border-t border-line py-5 md:grid-cols-[1fr_auto] md:gap-8">
                  <span className="leading-relaxed">{p.texto}</span>
                  {p.ia && (
                    <span className="self-start justify-self-start rounded-full bg-rust-soft px-2.5 py-1 font-mono text-[10px] tracking-wide text-rust uppercase md:justify-self-end">
                      IA no processo
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-2">
              {s.stack.map((t) => (
                <span key={t} className="rounded-full border border-line-strong px-3 py-1 text-sm text-ink-soft">
                  {t}
                </span>
              ))}
            </div>
          </Bloco>

          <Bloco n="04" titulo="Resultado">
            <p className="text-[clamp(1.25rem,2vw,1.6rem)] leading-snug text-pretty">{s.resultado}</p>
            <dl className="mt-12 grid gap-8 sm:grid-cols-3">
              {s.numeros.map((n) => (
                <div key={n.rotulo} className="flex flex-col border-t border-ink pt-4">
                  <dt className="order-2 mt-1 text-sm text-muted">{n.rotulo}</dt>
                  <dd className="order-1 font-serif text-6xl leading-none md:text-7xl">{n.valor}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10">
              {s.repo ? (
                <a href={s.repo} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm text-paper transition hover:bg-rust">
                  Ver o código no GitHub
                  <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Lock className="size-4" /> {s.privado}
                </span>
              )}
            </div>
          </Bloco>
        </div>

        {s.demo === "roteiro" && (
          <section id="experimente" className="scroll-mt-20 border-t border-line bg-paper-2/60">
            <div className={`${wrap} py-20 md:py-28`}>
              <div className="mb-10 grid gap-6 md:grid-cols-12">
                <div className="md:col-span-5">
                  <Label className="text-rust">Experimente</Label>
                  <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.92]">
                    <Lines lines={["Roteiros com IA,", <em key="e">ao vivo.</em>]} />
                  </h2>
                </div>
                <p className="self-end text-ink-soft md:col-span-5 md:col-start-8">
                  Protótipo da tela de roteiros planejada para o Viaja+. A resposta chega em streaming e cada item é validado antes de virar interface —
                  se o modelo errar o formato, a tela não quebra.
                </p>
              </div>
              <RoteiroDemo />
            </div>
          </section>
        )}

        <Link href={`/solucoes/${proxima.slug}`} className={`group block border-t border-line`}>
          <div className={`${wrap} flex items-end justify-between gap-6 py-16 md:py-24`}>
            <div>
              <Label className="text-muted">Próxima solução</Label>
              <p className="mt-4 font-serif text-[clamp(2.75rem,8vw,8rem)] leading-[0.9] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-4">
                <ViewTransition name={`titulo-${proxima.slug}`} share="morph" default="none">
                  <span className="inline-block">{proxima.nome}</span>
                </ViewTransition>
              </p>
              <p className="mt-3 text-ink-soft">{proxima.problemaCurto}</p>
            </div>
            <ArrowUpRight className="mb-4 size-10 shrink-0 text-muted transition group-hover:rotate-45 group-hover:text-rust md:size-16" />
          </div>
        </Link>
      </main>
      <Contato />
        </div>
      </ViewTransition>
      <CommandPalette />
    </>
  );
}

function Bloco({ n, titulo, children }: { n: string; titulo: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-6 border-t border-line py-12 md:grid-cols-12 md:py-16">
      <div className="md:col-span-3">
        <Label className="text-muted">
          {n} — {titulo}
        </Label>
      </div>
      <div className="md:col-span-8 md:col-start-5">{children}</div>
    </Reveal>
  );
}
