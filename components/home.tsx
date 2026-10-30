"use client";

import { ArrowDown, ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { estudos, perfil, processo, solucoes, stack, trajetoria } from "@/content/perfil";
import { Label, Lines, Reveal } from "@/components/ui";
import { GithubMarca, LinkedinMarca } from "@/components/marcas";
import { useCopiar } from "@/lib/hooks";

const wrap = "mx-auto max-w-[1400px] px-5 md:px-10";

export function Hero() {
  const { copiado, copiar } = useCopiar(perfil.email, () => (window.location.href = `mailto:${perfil.email}`));

  return (
    <section id="inicio" className={`${wrap} flex min-h-[100svh] flex-col justify-end pt-24 pb-8 md:pt-28 md:pb-10`}>
      <Reveal className="mb-5 flex items-center justify-between gap-4 text-muted md:mb-8">
        <Label>(Portfolio — 2026)</Label>
        <a href="#solucoes" className="group inline-flex items-center gap-1.5 text-ink">
          <Label className="link-line">{solucoes.length} soluções</Label>
          <ArrowDown className="size-3.5 transition group-hover:translate-y-0.5" />
        </a>
      </Reveal>

      <h1 className="font-serif text-[clamp(3.4rem,16.5vw,17rem)] leading-[0.85] tracking-[-0.03em]">
        <Lines inView={false} delay={0.05} lines={[perfil.nome]} />
      </h1>
      <p className="mt-3 max-w-[22ch] font-serif text-[clamp(1.75rem,3.6vw,3.4rem)] leading-[1.02] italic md:mt-4 md:max-w-none">
        <Lines
          inView={false}
          delay={0.2}
          lines={[
            <>
              Construo software que resolve <span className="text-rust">problemas reais.</span>
            </>,
          ]}
        />
      </p>

      <Reveal delay={0.4} className="mt-9 grid gap-7 border-t border-line pt-6 md:mt-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-6 lg:col-span-5">
          <Label className="text-muted">{perfil.papel}</Label>
          <p className="mt-2 text-[17px] leading-relaxed text-pretty text-ink-soft md:text-lg">{perfil.intro}</p>
        </div>
        <div className="md:col-span-6 lg:col-span-6 lg:col-start-7">
          <Label className="text-muted">Contato</Label>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-ink text-paper">
              <a href={`mailto:${perfil.email}`} className="inline-flex items-center gap-2 py-2.5 pr-2 pl-4 text-sm transition hover:text-[#e0764f]">
                <Mail className="size-4" />
                {perfil.email}
              </a>
              <button
                type="button"
                onClick={copiar}
                aria-label="Copiar e-mail"
                title="Copiar e-mail"
                className="mr-1 rounded-full p-2 text-paper/60 transition hover:bg-paper/10 hover:text-paper"
              >
                {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
              </button>
            </span>
            {perfil.linkedin && (
              <a
                href={perfil.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-sm transition hover:border-ink hover:bg-ink hover:text-paper"
              >
                <LinkedinMarca className="size-4" />
                LinkedIn
              </a>
            )}
            <a
              href={perfil.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2.5 text-sm transition hover:border-ink hover:bg-ink hover:text-paper"
            >
              <GithubMarca className="size-4" />
              GitHub
            </a>
            <span aria-live="polite" className="sr-only">
              {copiado ? "E-mail copiado" : ""}
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function Estudos() {
  return (
    <section className={`${wrap} pb-24 md:pb-32`}>
      <Reveal className="grid gap-6 border-t border-line pt-10 md:grid-cols-12">
        <div className="md:col-span-3">
          <Label className="text-muted">Estudos e exercícios</Label>
          <p className="mt-3 max-w-xs text-sm text-ink-soft">Projetos menores onde pratiquei os fundamentos que uso nas soluções acima.</p>
        </div>
        <ul className="md:col-span-9">
          {estudos.map((e) => (
            <li key={e.nome}>
              <a
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="group grid grid-cols-[1fr_auto] items-baseline gap-4 border-t border-line py-3.5 first:border-t-0 md:grid-cols-[1.2fr_1fr_1fr_auto]"
              >
                <span className="font-medium">{e.nome}</span>
                <span className="hidden text-sm text-ink-soft md:block">{e.descricao}</span>
                <span className="hidden font-mono text-[11px] text-muted md:block">{e.stack}</span>
                <ArrowUpRight className="size-4 text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-rust" />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}

export function Processo() {
  return (
    <section id="processo" className="scroll-mt-16 bg-ink text-paper">
      <div className={`${wrap} grid gap-14 py-24 md:grid-cols-12 md:py-36`}>
        <div className="self-start md:sticky md:top-28 md:col-span-5">
          <Label className="text-paper/50">Processo</Label>
          <h2 className="mt-6 font-serif text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.9]">
            <Lines lines={["IA no processo,", <em key="e" className="text-[#e0764f]">não no discurso.</em>]} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/70">
              A IA não é o produto — é como eu trabalho. Uso do jeito que um bom time usaria qualquer ferramenta de engenharia: com especificação,
              regras claras, revisão e testes. O resultado aparece nas soluções: entregues mais rápido e mais fáceis de confiar.
            </p>
          </Reveal>
        </div>
        <ol className="md:col-span-6 md:col-start-7">
          {processo.map((p, i) => (
            <Reveal key={p.titulo} delay={i * 0.04}>
              <li className="grid grid-cols-[3rem_1fr] gap-x-4 border-t border-paper/15 py-9">
                <span className="font-mono text-xs text-[#e0764f]">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-2xl tracking-tight md:text-3xl">{p.titulo}</h3>
                  <p className="mt-3 leading-relaxed text-paper/70">{p.texto}</p>
                  <p className="mt-5 font-mono text-[11px] leading-relaxed tracking-wide text-paper/45 uppercase">↳ {p.evidencia}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Sobre() {
  const fita = [...stack, ...stack];
  return (
    <section id="sobre" className="scroll-mt-16">
      <div className={`${wrap} grid gap-14 py-24 md:grid-cols-12 md:py-36`}>
        <div className="md:col-span-5">
          <Label className="text-muted">Sobre</Label>
          <h2 className="mt-6 font-serif text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.9]">
            <Lines lines={["Perto de quem", <em key="e" className="text-rust">usa o sistema.</em>]} />
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <Reveal>
            <div className="space-y-5 text-lg leading-relaxed text-pretty text-ink-soft">
              {perfil.sobre.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="mt-12 border-b border-line">
              {trajetoria.map((t) => (
                <li key={t.titulo} className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-line py-4 sm:grid-cols-[6.5rem_1fr_auto]">
                  <span className="font-mono text-[11px] text-muted uppercase">{t.periodo}</span>
                  <span>{t.titulo}</span>
                  <span className="col-start-2 text-sm text-muted sm:col-start-auto">{t.lugar}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
      <div className="overflow-hidden border-y border-line py-6" aria-label={`Stack: ${stack.join(", ")}`}>
        <div className="flex w-max animate-marquee gap-10 font-serif text-4xl whitespace-nowrap italic md:text-6xl" aria-hidden>
          {fita.map((s, i) => (
            <span key={i} className="flex items-center gap-10">
              {s}
              <span className="size-2 rounded-full bg-rust not-italic" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
