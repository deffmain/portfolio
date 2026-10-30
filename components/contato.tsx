"use client";

import { ArrowUpRight, Check, Copy } from "lucide-react";
import { perfil } from "@/content/perfil";
import { Label, Lines } from "@/components/ui";
import { GithubMarca, LinkedinMarca } from "@/components/marcas";
import { useCopiar } from "@/lib/hooks";

export function Contato() {
  const { copiado, copiar } = useCopiar(perfil.email, () => (window.location.href = `mailto:${perfil.email}`));

  const redes = [
    ...(perfil.linkedin ? [{ label: "LinkedIn", href: perfil.linkedin, Marca: LinkedinMarca }] : []),
    { label: "GitHub", href: perfil.github, Marca: GithubMarca },
  ];

  return (
    <footer id="contato" className="scroll-mt-16 bg-ink text-paper">
      <div className="mx-auto max-w-[1400px] px-5 pt-24 pb-10 md:px-10 md:pt-36">
        <Label className="text-paper/50">Contato</Label>
        <h2 className="mt-6 font-serif text-[clamp(3.5rem,12vw,12rem)] leading-[0.88] tracking-[-0.02em]">
          <Lines lines={["Tem um problema", <em key="e" className="text-[#e0764f]">para resolver?</em>]} />
        </h2>

        <div className="mt-14 flex flex-col gap-8 border-t border-paper/15 pt-8 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-4">
            <a href={`mailto:${perfil.email}`} className="link-line text-[clamp(1.25rem,3vw,2.25rem)] tracking-tight">
              {perfil.email}
            </a>
            <button
              onClick={copiar}
              aria-label="Copiar e-mail"
              className="rounded-full border border-paper/25 p-2.5 text-paper/70 transition hover:border-paper hover:text-paper"
            >
              {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
            </button>
            <span aria-live="polite" className="sr-only">
              {copiado ? "E-mail copiado" : ""}
            </span>
          </div>
          <div className="flex gap-6">
            {redes.map((r) => (
              <a key={r.label} href={r.href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-2 text-lg">
                <r.Marca className="size-4 text-paper/70" />
                <span className="link-line">{r.label}</span>
                <ArrowUpRight className="size-4 text-paper/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-2 font-mono text-[11px] text-paper/45 sm:flex-row sm:justify-between">
          <span>© 2026 {perfil.nome}</span>
          <span>Projetado e construído com Next.js e Claude Code</span>
        </div>
      </div>
    </footer>
  );
}
