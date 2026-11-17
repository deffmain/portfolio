import { ArrowUpRight, FileText } from "lucide-react";
import type { Solucao } from "@/content/perfil";

// Selo de trabalho em andamento (`status` em content/perfil.ts) e o link do
// artigo em PDF, no topo do estudo de caso. Os projetos sem `status` não mostram nada.

/** Selo do topo do estudo de caso: "● Em desenvolvimento · estudo inicial". */
export function SeloPagina({ status }: { status: NonNullable<Solucao["status"]> }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-rust-soft px-3 py-1.5 font-mono text-[11px] tracking-[0.12em] text-rust uppercase">
      <span aria-hidden className="size-1.5 rounded-full bg-rust" />
      {status.selo} · {status.estagio}
    </span>
  );
}

/** Link discreto para o artigo, ao lado do selo do topo. Abre o PDF numa aba nova. */
export function LinkArtigo({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
      <FileText className="size-4" />
      <span className="link-line">Ler o artigo (PDF)</span>
      <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}
