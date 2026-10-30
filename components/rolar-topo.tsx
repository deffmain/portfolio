"use client";

import { useLayoutEffect } from "react";

/**
 * Leva a página ao topo durante o commit — antes de o navegador capturar o
 * estado novo da view transition. Sem isso, vindo da home rolada até as
 * soluções, a capa seria capturada na rolagem antiga e pousaria no lugar errado.
 */
export function RolarParaTopo() {
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  return null;
}
