"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { VOLTA_PROJETO } from "@/lib/bus";

/**
 * "Todas as soluções": volta para a home com a transição inversa. Guarda o
 * projeto para a home montar o anel já formado, com ele na frente, e a capa
 * encolher de volta para o card. A home cuida da rolagem (scroll={false}).
 */
export function VoltarLink({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  return (
    <Link
      href="/"
      scroll={false}
      transitionTypes={["voltar-projeto"]}
      onClick={() => {
        try {
          sessionStorage.setItem(VOLTA_PROJETO, slug);
        } catch {}
      }}
      className={className}
    >
      {children}
    </Link>
  );
}
