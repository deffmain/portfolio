"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";
import { recolherCabecalho } from "@/lib/bus";

const noop = () => () => {};

export function useIsMac() {
  return useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.userAgent),
    () => false,
  );
}

/** Copia um texto e sinaliza por 1,8 s; sem acesso à área de transferência, abre o fallback. */
export function useCopiar(texto: string, fallback: () => void) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      fallback();
    }
  };
  return { copiado, copiar };
}

/**
 * Enquadra a seção quando o usuário chega nela, rolando para baixo ou para
 * cima: ao parar de rolar com 30% ou mais da seção na tela, a página desliza
 * até a seção ocupar a tela inteira. Só na chegada: depois de enquadrar, a
 * rolagem fica livre dentro da seção, e o ajuste só volta a valer depois que
 * menos de 30% dela ficar na tela (o usuário saiu).
 *
 * O cabeçalho fixo recolhe junto com o ajuste e fica recolhido enquanto a
 * seção cobre o topo da tela; volta quando o usuário sai dela, para cima ou
 * para baixo.
 */
export function useEnquadrarAoChegar(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const CHEGOU = 0.3; // fração da seção na tela a partir da qual ela "chegou"
    // Só enquadra depois desse tempo sem rolagem, roda, tecla ou toque. O
    // scrollend não serve: o Chrome o dispara entre um clique e outro da roda,
    // e o ajuste começaria com o usuário ainda rolando.
    const PARADO_MS = 180;
    const ALTURA_CABECALHO = 64; // h-16 do SiteHeader

    /** Fração da seção visível na tela. */
    const naTela = () => {
      const r = el.getBoundingClientRect();
      return Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0)) / r.height;
    };

    // Abrindo a página já na seção, ou voltando de um projeto, não há chegada.
    let armado = naTela() < CHEGOU;
    let espera = 0;
    let tocando = false;
    let raf = 0;
    let ultimoY = 0; // posição que a animação escreveu no último quadro

    const parar = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    /** Recolhido durante o ajuste e enquanto a seção cobre o topo da tela. */
    const atualizarCabecalho = () => {
      const r = el.getBoundingClientRect();
      recolherCabecalho(raf !== 0 || (r.top <= 1 && r.bottom > ALTURA_CABECALHO));
    };

    /** Desliza até `destino` com aceleração e freada suaves (0,55 a 1 s). */
    const deslizar = (destino: number) => {
      const inicio = window.scrollY;
      const distancia = destino - inicio;
      const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const duracao = reduz ? 350 : Math.min(1000, Math.max(550, 450 + Math.abs(distancia) * 0.8));
      const suave = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
      const t0 = performance.now();
      ultimoY = inicio;
      const quadro = (agora: number) => {
        // A página saiu de onde a animação a deixou (barra de rolagem, âncora):
        // o usuário assumiu.
        if (Math.abs(window.scrollY - ultimoY) > 1) return void (raf = 0);
        const p = Math.min(1, (agora - t0) / duracao);
        ultimoY = Math.round(inicio + distancia * suave(p));
        window.scrollTo({ top: ultimoY, behavior: "instant" });
        raf = p < 1 ? requestAnimationFrame(quadro) : 0;
      };
      raf = requestAnimationFrame(quadro);
    };

    const onFim = () => {
      if (tocando || raf || !armado || naTela() < CHEGOU) return;
      armado = false;
      const t = el.getBoundingClientRect().top;
      if (Math.abs(t) >= 2) deslizar(window.scrollY + t);
      atualizarCabecalho();
    };
    const aguardar = () => {
      window.clearTimeout(espera);
      espera = window.setTimeout(onFim, PARADO_MS);
    };
    // O usuário mexeu no meio do ajuste: ele para, e a chegada volta a valer
    // para quando o usuário parar de novo.
    const interromper = () => {
      if (!raf) return;
      parar();
      armado = true;
      atualizarCabecalho();
    };

    const onScroll = () => {
      if (!raf && naTela() < CHEGOU) armado = true;
      atualizarCabecalho();
      aguardar();
    };
    const onEntrada = () => {
      interromper();
      aguardar();
    };
    const onTecla = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(e.key)) onEntrada();
    };
    // Com o dedo na tela o usuário ainda está rolando, mesmo parado.
    const onToque = (e: TouchEvent) => {
      tocando = e.type === "touchstart";
      if (tocando) interromper();
      aguardar();
    };

    const eventos = [
      ["scroll", onScroll],
      ["wheel", onEntrada],
      ["keydown", onTecla],
      ["touchstart", onToque],
      ["touchend", onToque],
      ["touchcancel", onToque],
    ] as const;
    for (const [nome, fn] of eventos) window.addEventListener(nome, fn as EventListener, { passive: true });
    atualizarCabecalho();
    return () => {
      parar();
      recolherCabecalho(false);
      window.clearTimeout(espera);
      for (const [nome, fn] of eventos) window.removeEventListener(nome, fn as EventListener);
    };
  }, [ref]);
}
