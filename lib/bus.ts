"use client";

import type { Comando } from "@/lib/comando";

// Barramento de eventos minúsculo: a paleta dispara ações e os componentes
// escutam só o que lhes interessa, sem estado global compartilhado.

type Eventos = {
  "portfolio:acao": Comando;
  "portfolio:paleta": { query?: string; perguntar?: boolean };
};

export function emit<K extends keyof Eventos>(name: K, detail: Eventos[K]) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<K extends keyof Eventos>(name: K, fn: (detail: Eventos[K]) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<Eventos[K]>).detail);
  window.addEventListener(name, handler);
  return () => window.removeEventListener(name, handler);
}

export function abrirPaleta(query?: string, perguntar = false) {
  emit("portfolio:paleta", { query, perguntar });
}

// Pedido de roteiro vindo de outra página: guardado até a demo montar.
export const ROTEIRO_PENDENTE = "portfolio:roteiro-pendente";

// Projeto de onde o usuário está voltando ("Todas as soluções"): a home monta
// o anel já formado, com ele na frente, para a capa encolher de volta ao card.
export const VOLTA_PROJETO = "portfolio:volta-projeto";


// Cabeçalho recolhido enquanto o palco de soluções ocupa o topo da tela. Um
// estado só de exibição, lido pelo cabeçalho com useSyncExternalStore.
let recolhido = false;
const ouvintesCabecalho = new Set<() => void>();

export function recolherCabecalho(valor: boolean) {
  if (valor === recolhido) return;
  recolhido = valor;
  ouvintesCabecalho.forEach((fn) => fn());
}

export const cabecalhoRecolhido = {
  assinar(fn: () => void) {
    ouvintesCabecalho.add(fn);
    return () => ouvintesCabecalho.delete(fn);
  },
  ler: () => recolhido,
  lerNoServidor: () => false,
};
