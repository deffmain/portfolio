"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, AtSign, CornerDownLeft, Hash, Loader2, MapPin, Search } from "lucide-react";
import { perfil, secoes, solucoes } from "@/content/perfil";
import type { Comando } from "@/lib/comando";
import { ROTEIRO_PENDENTE, emit, on } from "@/lib/bus";
import { Kbd } from "@/components/ui";

type Item = { id: string; label: string; hint?: string; grupo: string; icon: typeof Hash; keywords: string; comando: Comando };

type Ia =
  | { status: "loading"; pergunta: string }
  | { status: "done"; pergunta: string; comando: Comando; via: string; ms: number }
  | { status: "error"; pergunta: string; message: string };

const itens: Item[] = [
  ...solucoes.map(
    (s, i): Item => ({
      id: `sol-${s.slug}`,
      grupo: "Soluções",
      label: `${String(i + 1).padStart(2, "0")}  ${s.nome}`,
      hint: s.contexto,
      icon: ArrowRight,
      keywords: `${s.problemaCurto} ${s.stack.join(" ")}`,
      comando: { acao: "abrir_solucao", alvo: s.slug, resposta: "" },
    }),
  ),
  { id: "demo-roteiro", grupo: "Experimente", label: "Gerador de roteiros (Viaja+)", hint: "protótipo ao vivo", icon: MapPin, keywords: "viagem ia demo roteiro", comando: { acao: "demo_roteiro", parametros: {}, resposta: "" } },
  ...secoes.map((s): Item => ({ id: `sec-${s.id}`, grupo: "Página inicial", label: s.label, hint: s.descricao, icon: Hash, keywords: s.descricao, comando: { acao: "navegar", alvo: s.id, resposta: "" } })),
  { id: "link-email", grupo: "Contato", label: "Enviar e-mail", hint: perfil.email, icon: AtSign, keywords: "contato email falar", comando: { acao: "link", alvo: "email", resposta: "" } },
  { id: "link-github", grupo: "Contato", label: "GitHub", hint: `@${perfil.githubUser}`, icon: ArrowUpRight, keywords: "codigo repositorios", comando: { acao: "link", alvo: "github", resposta: "" } },
  ...(perfil.linkedin
    ? [{ id: "link-linkedin", grupo: "Contato", label: "LinkedIn", icon: ArrowUpRight, keywords: "rede contato", comando: { acao: "link", alvo: "linkedin", resposta: "" } } satisfies Item]
    : []),
];

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const descricaoAcao: Record<Comando["acao"], string> = {
  navegar: "Ir para",
  abrir_solucao: "Abrir estudo de caso",
  demo_roteiro: "Abrir o gerador de roteiros",
  link: "Abrir",
  responder: "",
};

export function CommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [ia, setIa] = useState<Ia | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abort = useRef<AbortController | null>(null);

  const fechar = useCallback(() => {
    clearTimeout(timer.current);
    abort.current?.abort();
    setOpen(false);
    setQuery("");
    setIa(null);
  }, []);

  const executar = useCallback(
    (c: Comando) => {
      fechar();
      if (c.acao === "navegar" && c.alvo) {
        if (pathname === "/") document.getElementById(c.alvo)?.scrollIntoView({ behavior: "smooth" });
        else router.push(c.alvo === "inicio" ? "/" : `/#${c.alvo}`);
      } else if (c.acao === "abrir_solucao" && c.alvo) {
        router.push(`/solucoes/${c.alvo}`);
      } else if (c.acao === "demo_roteiro") {
        if (pathname === "/solucoes/viaja-mais") {
          document.getElementById("experimente")?.scrollIntoView({ behavior: "smooth" });
          emit("portfolio:acao", c);
        } else {
          try {
            if (c.parametros && Object.keys(c.parametros).length) sessionStorage.setItem(ROTEIRO_PENDENTE, JSON.stringify(c.parametros));
          } catch {}
          router.push("/solucoes/viaja-mais#experimente");
        }
      } else if (c.acao === "link") {
        if (c.alvo === "email") window.location.href = `mailto:${perfil.email}`;
        else window.open(c.alvo === "linkedin" ? perfil.linkedin : perfil.github, "_blank", "noopener");
      }
    },
    [fechar, pathname, router],
  );

  const perguntar = useCallback(
    async (pergunta: string) => {
      const q = pergunta.trim();
      if (q.length < 2) return;
      clearTimeout(timer.current);
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      setIa({ status: "loading", pergunta: q });
      try {
        const res = await fetch("/api/comando", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pergunta: q }),
          signal: ctrl.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Erro");
        setIa({ status: "done", pergunta: q, comando: data.comando, via: data.via, ms: data.ms });
        if (data.comando.acao !== "responder") timer.current = setTimeout(() => executar(data.comando), 1500);
      } catch (err) {
        if (ctrl.signal.aborted) return;
        setIa({ status: "error", pergunta: q, message: err instanceof Error ? err.message : "Não consegui responder agora." });
      }
    },
    [executar],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    const off = on("portfolio:paleta", ({ query: q, perguntar: ask }) => {
      setOpen(true);
      setQuery(q ?? "");
      setIa(null);
      if (q && ask) perguntar(q);
    });
    return () => {
      window.removeEventListener("keydown", onKey);
      off();
    };
  }, [perguntar]);

  const q = norm(query.trim());
  const palavras = q.split(/\s+/).filter(Boolean);
  const filtrados = q ? itens.filter((i) => palavras.every((w) => norm(`${i.label} ${i.hint ?? ""} ${i.keywords}`).includes(w))) : itens;
  const grupos = [...new Set(filtrados.map((i) => i.grupo))];
  const perguntaPrimeiro = palavras.length >= 3 || filtrados.length === 0;

  const itemPergunta = q && (
    <Command.Group heading="Perguntar">
      <Command.Item value="__perguntar__" onSelect={() => perguntar(query)} className="flex items-center gap-3 rounded-lg px-3 py-3">
        <Search className="size-4 shrink-0 text-rust" />
        <span className="min-w-0 flex-1 truncate text-sm">
          “{query.trim()}”
          <span className="ml-2 text-muted">— interpretar o pedido</span>
        </span>
        <CornerDownLeft className="size-3.5 text-muted" />
      </Command.Item>
    </Command.Group>
  );

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(o) => (o ? setOpen(true) : fechar())}
      label="Índice do portfolio"
      shouldFilter={false}
      loop
      className="overflow-hidden rounded-xl border border-line-strong bg-paper text-ink shadow-[0_40px_100px_-20px_rgb(20_20_19/0.45)]"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <Search className="size-4 shrink-0 text-muted" />
        <Command.Input
          value={query}
          onValueChange={(v) => {
            setQuery(v);
            if (ia) {
              clearTimeout(timer.current);
              setIa(null);
            }
          }}
          placeholder="Buscar ou pedir — ex.: “projetos com Spring”"
          className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted"
        />
        <Kbd>esc</Kbd>
      </div>

      {ia ? (
        <RespostaIa ia={ia} onRun={executar} onRetry={() => perguntar(ia.pergunta)} />
      ) : (
        <Command.List className="max-h-[min(60vh,440px)] overflow-y-auto p-2">
          {perguntaPrimeiro && itemPergunta}
          {grupos.map((g) => (
            <Command.Group key={g} heading={g}>
              {filtrados
                .filter((i) => i.grupo === g)
                .map((i) => (
                  <Command.Item key={i.id} value={i.id} onSelect={() => executar(i.comando)} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                    <i.icon className="size-4 shrink-0 text-muted" />
                    <span className="text-sm whitespace-pre">{i.label}</span>
                    {i.hint && <span className="ml-auto truncate pl-4 text-xs text-muted">{i.hint}</span>}
                  </Command.Item>
                ))}
            </Command.Group>
          ))}
          {!perguntaPrimeiro && itemPergunta}
        </Command.List>
      )}

      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10px] text-muted">
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> navegar <Kbd>↵</Kbd> abrir
        </span>
        <span className="hidden sm:inline">frases livres são interpretadas por IA</span>
      </div>
    </Command.Dialog>
  );
}

function RespostaIa({ ia, onRun, onRetry }: { ia: Ia; onRun: (c: Comando) => void; onRetry: () => void }) {
  if (ia.status === "loading") {
    return (
      <div className="flex items-center gap-3 px-5 py-8 text-sm text-ink-soft">
        <Loader2 className="size-4 animate-spin text-rust" />
        Interpretando o pedido…
      </div>
    );
  }
  if (ia.status === "error") {
    return (
      <div className="space-y-3 px-5 py-6 text-sm">
        <p className="text-rust">{ia.message}</p>
        <button onClick={onRetry} className="rounded-full border border-line-strong px-3 py-1.5 hover:border-ink">
          Tentar de novo
        </button>
      </div>
    );
  }

  const { comando } = ia;
  const alvo =
    comando.acao === "abrir_solucao" ? solucoes.find((s) => s.slug === comando.alvo)?.nome : comando.acao === "navegar" ? secoes.find((s) => s.id === comando.alvo)?.label : comando.alvo;
  return (
    <div className="px-5 py-5">
      <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-serif text-2xl leading-snug">
        {comando.resposta}
      </motion.p>
      {comando.acao !== "responder" && (
        <button
          autoFocus
          onClick={() => onRun(comando)}
          className="relative mt-4 flex w-full items-center gap-3 overflow-hidden rounded-lg border border-ink px-4 py-3 text-left text-sm outline-none focus-visible:ring-2 focus-visible:ring-rust/40"
        >
          <motion.span className="absolute inset-y-0 left-0 bg-rust-soft" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "linear" }} />
          <span className="relative shrink-0 whitespace-nowrap">
            {descricaoAcao[comando.acao]}
            {alvo ? ` · ${alvo}` : ""}
          </span>
          {comando.parametros && Object.keys(comando.parametros).length > 0 && (
            <span className="relative hidden min-w-0 truncate font-mono text-[11px] text-muted sm:block">
              {Object.entries(comando.parametros)
                .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
                .join(" · ")}
            </span>
          )}
          <ArrowRight className="relative ml-auto size-4 shrink-0 text-rust" />
        </button>
      )}
      <p className="mt-4 font-mono text-[10px] text-muted">
        {ia.via === "offline" ? "roteador local" : ia.via} · {ia.ms} ms
      </p>
    </div>
  );
}
