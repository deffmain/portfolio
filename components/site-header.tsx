"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { abrirPaleta, cabecalhoRecolhido } from "@/lib/bus";
import { useIsMac } from "@/lib/hooks";
import { perfil } from "@/content/perfil";

const links = [
  { href: "/#solucoes", label: "Soluções" },
  { href: "/#processo", label: "Processo" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
];

export function SiteHeader() {
  const isMac = useIsMac();
  const [scrolled, setScrolled] = useState(false);
  // Some para cima enquanto o palco de soluções ocupa a tela; volta com o
  // foco do teclado num link dele.
  const recolhido = useSyncExternalStore(cabecalhoRecolhido.assinar, cabecalhoRecolhido.ler, cabecalhoRecolhido.lerNoServidor);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,translate] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${scrolled ? "bg-paper/95 backdrop-blur-md" : ""} ${recolhido ? "-translate-y-full focus-within:translate-y-0" : ""}`}
      style={{ viewTransitionName: "site-header" }} // fica parado durante as transições de página
    >
      <div className={`mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-6 px-5 md:px-10 ${scrolled ? "border-b border-line" : "border-b border-transparent"}`}>
        <Link href="/" className="text-sm font-medium tracking-tight">
          {perfil.nome}
          <span className="ml-2 hidden text-muted sm:inline">— {perfil.papel.toLowerCase()}</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="link-line text-ink-soft hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => abrirPaleta()}
          className="flex items-center gap-2 rounded-full border border-line-strong px-3.5 py-1.5 text-sm transition hover:border-ink hover:bg-ink hover:text-paper"
        >
          Índice
          <span className="hidden font-mono text-[11px] opacity-60 [@media(pointer:fine)]:inline">{isMac ? "⌘K" : "Ctrl K"}</span>
        </button>
      </div>
    </header>
  );
}
