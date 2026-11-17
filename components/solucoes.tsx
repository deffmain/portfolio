"use client";

import { useSyncExternalStore } from "react";
import { HeliceSolucoes } from "@/components/helice";
import { SolucoesCelular } from "@/components/solucoes-celular";

// Seção "Soluções": o anel 3D na tela larga e a roda vertical no celular.
//
// O servidor não sabe o tamanho da tela, então manda os dois, e o CSS mostra só
// um (sm = 640 px): a página nunca aparece com o carrossel errado. Depois da
// hidratação, só o que vale para a tela continua montado — o outro sai, com o
// seu laço de animação, os seus ouvintes e o seu DOM.

const TELA_LARGA = "(min-width: 40rem)"; // o mesmo corte do `sm:` do Tailwind

function assinar(aviso: () => void) {
  const m = window.matchMedia(TELA_LARGA);
  m.addEventListener("change", aviso);
  return () => m.removeEventListener("change", aviso);
}
const noCliente = () => (window.matchMedia(TELA_LARGA).matches ? "anel" : "celular");
const noServidor = () => "ambos";

export function Solucoes() {
  const modo = useSyncExternalStore(assinar, noCliente, noServidor);
  return (
    // A âncora #solucoes fica aqui, e não em cada carrossel: só pode haver uma.
    <div id="solucoes">
      {/* O do celular vem primeiro: voltando de um projeto, é ele quem lê (e
          consome) o projeto de onde o usuário voltou, se estiver na tela. */}
      {modo !== "anel" && (
        <div className="sm:hidden">
          <SolucoesCelular />
        </div>
      )}
      {modo !== "celular" && (
        <div className="hidden sm:block">
          <HeliceSolucoes />
        </div>
      )}
    </div>
  );
}
