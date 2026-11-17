"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ArrowUpRight } from "lucide-react";
import { solucoes, type Solucao } from "@/content/perfil";
import { VisualSolucao } from "@/components/visuais";
import { lerVolta } from "@/components/helice";
import { Label, Lines } from "@/components/ui";
import { VOLTA_PROJETO, recolherCabecalho } from "@/lib/bus";

// Soluções no celular: uma roda vertical, no lugar do anel 3D (que gira na
// horizontal e pesa em aparelho fraco). O projeto da vez fica em destaque, com
// o anterior e o próximo espiando acima e abaixo, na penumbra.
//
// A seção tem a altura de uma tela e rola com a página, sem prender a rolagem.
// Só o card da vez e uma margem de 10% em volta dele (a "área de troca") tratam
// o dedo de outro jeito: arrastar ali para cima ou para baixo troca o projeto.
// No resto da seção o toque rola a página normalmente.
//
// Nada anima por quadro em JavaScript e não há 3D: o gesto só decide qual é o
// projeto da vez, e a troca é uma transição de CSS em transform e opacity.

const N = solucoes.length;
const FUNDO = "#1f1915"; // o mesmo palco "Terra" do anel
const SUAVE = "cubic-bezier(0.22, 1, 0.36, 1)";
const BRILHO = "0 0 18px 1px rgb(236 140 98 / 0.4), 0 0 48px 6px rgb(224 118 79 / 0.14)";
const MARGEM_TROCA = 1.2; // a área de troca é o card ampliado: 10% a mais de cada lado
const ARRASTO_POR_PROJETO = 56; // px de arrasto que trocam um projeto (o dedo pode seguir e trocar outro)
const ARRASTO_MINIMO = 18; // um arrasto curto, solto antes disso tudo, ainda troca um
const ALTURA_CABECALHO = 64; // h-16 do SiteHeader
// Com "reduzir movimento" a troca é seca. Vai em classe (com !important, que
// vence o transition do style) e não em JavaScript: o servidor não sabe a
// preferência, e o React não corrige um style diferente na hidratação.
const SEM_MOVIMENTO = "motion-reduce:transition-none!";
const n2 = (x: number) => String(x).padStart(2, "0");

/** Link do projeto: abre o estudo de caso com a transição "Camadas". */
function Projeto({ s, className, style, inert, troca, children }: { s: Solucao; className?: string; style?: CSSProperties; inert?: boolean; troca?: boolean; children: ReactNode }) {
  return (
    <Link
      href={`/solucoes/${s.slug}`}
      // Conteúdo completo do projeto antes do toque: a transição não espera a rede.
      prefetch={true}
      transitionTypes={["abrir-projeto"]}
      aria-label={`${s.nome} — abrir estudo de caso`}
      inert={inert}
      draggable={false}
      data-troca={troca ? "" : undefined}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}

export function SolucoesCelular() {
  const secao = useRef<HTMLElement>(null);
  const [ativo, setAtivo] = useState(0);
  // Dedo (ou mouse) que começou na área de troca. `andou` fica ligado até o
  // clique que vem depois do gesto, para o arrasto não abrir o projeto.
  const toque = useRef<{ id: number; y: number; andou: boolean } | null>(null);

  const trocar = (dir: 1 | -1) => setAtivo((a) => Math.min(N - 1, Math.max(0, a + dir)));

  /**
   * Acerta a seção com o que está fora do React: recolhe o cabeçalho do site
   * enquanto o palco cobre o topo da tela e, se o usuário está voltando de um
   * projeto (guardado no sessionStorage), põe esse projeto em destaque.
   */
  const medir = useCallback((volta: number | null = null) => {
    const sec = secao.current;
    if (!sec || !sec.offsetHeight) return; // escondida (tela larga)
    if (volta !== null) setAtivo(volta);
    const r = sec.getBoundingClientRect();
    recolherCabecalho(r.top <= 1 && r.bottom > ALTURA_CABECALHO);
  }, []);

  // Roda ao montar e toda vez que a home volta a aparecer (com Cache Components
  // o Next a esconde com <Activity> em vez de desmontá-la). Voltando de um
  // projeto, a página já aparece na seção, com ele em destaque — antes da
  // pintura e antes de o navegador capturar o estado da transição.
  useLayoutEffect(() => {
    const sec = secao.current;
    if (!sec || !sec.offsetHeight) return;
    toque.current = null;
    const k = lerVolta();
    if (k !== null) {
      try {
        sessionStorage.removeItem(VOLTA_PROJETO);
      } catch {}
      window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    }
    medir(k);
  }, [medir]);

  useEffect(() => {
    let raf = 0;
    const quadro = () => {
      raf = 0;
      medir();
    };
    const agendar = () => {
      if (!raf) raf = requestAnimationFrame(quadro);
    };
    // Mede de novo no próximo quadro: na hidratação o anel ainda está montado
    // (escondido) e mexe no cabeçalho ao sair.
    agendar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
      recolherCabecalho(false);
    };
  }, [medir]);

  // ── Gesto na área de troca ──────────────────────────────────────────────────
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    toque.current = null;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (!(e.target as HTMLElement).closest("[data-troca]")) return;
    toque.current = { id: e.pointerId, y: e.clientY, andou: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const t = toque.current;
    if (!t || t.id !== e.pointerId) return;
    const dy = e.clientY - t.y;
    if (Math.abs(dy) < ARRASTO_POR_PROJETO) return;
    // O dedo pode sair da área sem perder o gesto, e seguir para trocar outro.
    if (!t.andou) e.currentTarget.setPointerCapture(e.pointerId);
    t.andou = true;
    t.y = e.clientY;
    trocar(dy < 0 ? 1 : -1); // dedo para cima: o próximo sobe
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const t = toque.current;
    if (!t || t.id !== e.pointerId) return;
    const dy = e.clientY - t.y;
    if (!t.andou && Math.abs(dy) >= ARRASTO_MINIMO) {
      t.andou = true;
      trocar(dy < 0 ? 1 : -1);
    }
    t.id = -1; // `andou` fica para o clique consultar
  };
  const onPointerCancel = () => {
    toque.current = null;
  };
  /** O clique que fecha um arrasto não abre o projeto (Enter, com detail 0, sempre abre). */
  const onClickCapture = (e: MouseEvent) => {
    const arrastou = toque.current?.andou && e.detail !== 0;
    toque.current = null;
    if (arrastou) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") trocar(1);
    else if (e.key === "ArrowUp") trocar(-1);
    else return;
    e.preventDefault();
  };

  return (
    <section
      ref={secao}
      aria-roledescription="carrossel"
      aria-label="Soluções"
      className="relative flex h-[100svh] min-h-[34rem] flex-col overflow-hidden text-paper"
      style={{ background: FUNDO }}
      onKeyDown={onKey}
    >
      {/* Luz de palco atrás da roda. */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 45% at 50% 42%, rgb(224 118 79 / 0.09), transparent 75%)" }} />

      <div className="relative z-10 flex shrink-0 items-end justify-between gap-4 px-5 pt-8">
        <div>
          <Label className="whitespace-nowrap text-paper/45">({n2(N)}) problema → solução</Label>
          <h2 className="mt-2 font-serif text-[2.5rem] leading-[0.9]">
            <Lines lines={["Soluções"]} />
          </h2>
        </div>
        <span className="pb-1 font-mono text-sm whitespace-nowrap tabular-nums" aria-hidden>
          <span className="text-[#e0764f]">{n2(ativo + 1)}</span>
          <span className="text-paper/40"> / {n2(N)}</span>
        </span>
      </div>

      {/* Os cards ficam todos no mesmo lugar; a distância até o projeto da vez
          decide onde cada um aparece. A área corta o que passa dela: os
          vizinhos não invadem o título nem o texto. */}
      <div
        className="relative mt-3 min-h-0 flex-1 overflow-hidden select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        {/* As bordas do corte somem na cor do palco. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[4] h-10" style={{ background: `linear-gradient(${FUNDO}, transparent)` }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] h-10" style={{ background: `linear-gradient(transparent, ${FUNDO})` }} />

        {/* Área de troca: o lugar do card da vez, 10% maior para cada lado. Fica
            acima dos vizinhos e abaixo do card da vez (que também faz parte
            dela). Só aqui o arrasto vertical não rola a página. */}
        <div
          data-troca=""
          aria-hidden
          className="absolute top-1/2 right-5 left-5 aspect-[16/10] cursor-grab"
          style={{ transform: `translateY(-50%) scale(${MARGEM_TROCA})`, touchAction: "none", zIndex: 2 }}
        />

        {solucoes.map((s, i) => {
          const d = i - ativo;
          const perto = Math.abs(d) <= 1;
          return (
            <Projeto
              key={s.slug}
              s={s}
              inert={d !== 0}
              troca={d === 0}
              className={`absolute top-1/2 right-5 left-5 block aspect-[16/10] rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-rust ${SEM_MOVIMENTO}`}
              style={{
                transform: `translateY(calc(-50% + ${perto ? d * 92 : Math.sign(d) * 175}%)) scale(${d === 0 ? 1 : 0.84})`,
                opacity: perto ? 1 : 0,
                transition: `transform 600ms ${SUAVE}, opacity 400ms ease-out`,
                touchAction: d === 0 ? "none" : undefined,
                zIndex: d === 0 ? 3 : 1,
              }}
            >
              {/* Brilho quente na borda do projeto da vez, como no card da frente do anel. */}
              <span aria-hidden className={`pointer-events-none absolute inset-0 rounded-xl ${SEM_MOVIMENTO}`} style={{ boxShadow: BRILHO, opacity: d === 0 ? 1 : 0, transition: "opacity 500ms ease-out" }} />
              <span className="relative block h-full overflow-hidden rounded-xl border border-paper/10 bg-paper-2 shadow-[0_24px_40px_-24px_rgb(0_0_0/0.8)]">
                <VisualSolucao visual={s.visual} className="pointer-events-none block h-full w-full" />
                {/* Penumbra na cor do palco nos vizinhos. */}
                <span aria-hidden className={`pointer-events-none absolute inset-0 ${SEM_MOVIMENTO}`} style={{ background: FUNDO, opacity: d === 0 ? 0 : 0.62, transition: "opacity 500ms ease-out" }} />
              </span>
            </Projeto>
          );
        })}
      </div>

      {/* Texto do projeto da vez. Os cinco ocupam a mesma célula: a altura do
          bloco — e a área dos cards — não muda na troca. */}
      <div className="relative z-10 grid shrink-0 px-5 pt-5 pb-8 text-center">
        {solucoes.map((s, i) => (
          <Projeto
            key={s.slug}
            s={s}
            inert={i !== ativo}
            className={`block [grid-area:1/1] ${SEM_MOVIMENTO}`}
            style={{
              opacity: i === ativo ? 1 : 0,
              transform: `translateY(${i === ativo ? 0 : Math.sign(i - ativo) * 14}px)`,
              transition: `opacity ${i === ativo ? "300ms ease-out 140ms" : "140ms ease-out"}, transform 500ms ${SUAVE}`,
            }}
          >
            <Label className="text-[#c49a74]">{s.contexto}</Label>
            <span className="mt-2 block font-serif text-[2rem] leading-none text-[#f3e3cc]">{s.nome}</span>
            <span className="mx-auto mt-2.5 block max-w-xs text-[15px] leading-snug text-[#d4bea3]">{s.problemaCurto}</span>
            <span className="mt-3.5 inline-flex items-center gap-1.5 text-sm text-[#e9a77f]">
              Ver estudo de caso <ArrowUpRight className="size-4 text-[#e0764f]" />
            </span>
          </Projeto>
        ))}
      </div>

      {/* Onde você está na roda. */}
      <div aria-hidden className="pointer-events-none absolute top-1/2 right-1.5 z-10 flex -translate-y-1/2 flex-col gap-1.5">
        {solucoes.map((s, i) => (
          <span
            key={s.slug}
            className={`w-[3px] rounded-full ${SEM_MOVIMENTO}`}
            style={{ height: i === ativo ? 22 : 8, background: i === ativo ? "#e0764f" : "rgb(242 239 232 / 0.22)", transition: "height 500ms, background-color 500ms" }}
          />
        ))}
      </div>
    </section>
  );
}
