"use client";

import { useState, useSyncExternalStore } from "react";

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
