"use client";

import { Children, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEnquadrarAoChegar } from "@/lib/hooks";

/**
 * Carrossel lateral do topo do estudo de caso: um slide por tela. A rolagem é
 * nativa com scroll-snap (deslizar no celular e no trackpad, setas do teclado
 * com o foco no trilho); os botões e os indicadores só rolam até o slide.
 *
 * Enquadramento, como no anel da home: quando a pessoa para de rolar com 30%
 * ou mais do carrossel na tela, a página desliza até ele ficar centrado.
 */
export function TrilhoTelas({ titulos, rotulo, children }: { titulos: string[]; rotulo: string; children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);
  const trilho = useRef<HTMLDivElement>(null);
  const [atual, setAtual] = useState(0);
  const slides = Children.toArray(children);
  const total = slides.length;

  // O carrossel já aparece ao abrir o projeto: o enquadramento vale desde a
  // primeira rolagem, não só depois de a pessoa sair e voltar.
  useEnquadrarAoChegar(raiz, { centrar: true, armadoNaCarga: true });

  const ir = (i: number) => {
    const el = trilho.current;
    if (!el) return;
    const alvo = Math.max(0, Math.min(total - 1, i));
    el.scrollTo({ left: alvo * el.clientWidth, behavior: "smooth" });
  };

  const aoRolar = () => {
    const el = trilho.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== atual) setAtual(i);
  };

  // A partir de md, setas nas laterais, no meio da altura. No celular elas
  // cobririam a frase, então ficam na barra de baixo, ao lado dos indicadores.
  // No começo e no fim, a seta sem destino some.
  const botao =
    "items-center justify-center rounded-full border border-line-strong bg-paper text-ink transition hover:border-ink hover:bg-ink hover:text-paper disabled:pointer-events-none disabled:opacity-0";
  const seta = `${botao} absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 shadow-[0_6px_16px_-8px_rgb(20_20_19/0.4)] md:inline-flex`;
  const setaCel = `${botao} inline-flex size-9 shrink-0 md:hidden`;

  return (
    <div ref={raiz} role="region" aria-roledescription="carrossel" aria-label={rotulo} className="overflow-hidden rounded-2xl border border-line bg-paper-2">
      <div className="relative">
        <button type="button" onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Tela anterior" className={`${seta} left-5`}>
          <ArrowLeft className="size-4" />
        </button>
        <button type="button" onClick={() => ir(atual + 1)} disabled={atual === total - 1} aria-label="Próxima tela" className={`${seta} right-5`}>
          <ArrowRight className="size-4" />
        </button>
        <div
          ref={trilho}
          onScroll={aoRolar}
          tabIndex={0}
          aria-label="Telas: deslize ou use as setas"
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain outline-none [scrollbar-width:none] focus-visible:ring-2 focus-visible:ring-rust/40 focus-visible:ring-inset [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${total}: ${titulos[i]}`}
              className="w-full shrink-0 snap-start snap-always"
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-line px-4 py-3 md:px-20 md:py-4">
        <button type="button" onClick={() => ir(atual - 1)} disabled={atual === 0} aria-label="Tela anterior" className={setaCel}>
          <ArrowLeft className="size-4" />
        </button>
        {/* A largura fica no botão e pode encolher: com muitas telas, no celular,
            os indicadores cedem espaço e as setas ao lado mantêm o tamanho. */}
        <div className="flex min-w-0 items-center gap-1.5">
          {titulos.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => ir(i)}
              aria-label={`Ir para ${t}`}
              aria-current={i === atual ? "true" : undefined}
              className={`group flex h-6 min-w-0 shrink items-center px-0.5 transition-[width] duration-300 ${i === atual ? "w-8" : "w-4"}`}
            >
              <span className={`block h-1 w-full rounded-full transition-colors duration-300 ${i === atual ? "bg-rust" : "bg-line-strong group-hover:bg-ink-soft"}`} />
            </button>
          ))}
        </div>
        {/* No celular, no lugar do contador, ficam as setas. */}
        <span className="hidden font-mono text-[11px] whitespace-nowrap text-muted tabular-nums md:inline" aria-live="polite">
          {String(atual + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => ir(atual + 1)} disabled={atual === total - 1} aria-label="Próxima tela" className={setaCel}>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
