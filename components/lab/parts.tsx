"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, CircleDashed, Info, Loader2, X } from "lucide-react";
import type { Step } from "@/lib/use-demo-stream";
import type { DemoMeta } from "@/lib/ai/stream";

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[11px] tracking-wider text-muted uppercase">{label}</span>
        {hint && <span className="font-mono text-[11px] text-muted">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function TextInput({ value, onChange, icon, placeholder }: { value: string; onChange: (v: string) => void; icon: ReactNode; placeholder?: string }) {
  return (
    <label className="flex items-center gap-2.5 rounded-lg border border-line-strong bg-paper px-3.5 py-2.5 transition focus-within:border-ink">
      <span className="text-muted">{icon}</span>
      <input
        value={value}
        maxLength={60}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
      />
    </label>
  );
}

const rotulo = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function Chips<T extends string | number>({ options, value, onToggle }: { options: readonly T[]; value: T | T[]; onToggle: (v: T) => void }) {
  const selected = (o: T) => (Array.isArray(value) ? value.includes(o) : value === o);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          aria-pressed={selected(o)}
          onClick={() => onToggle(o)}
          className={`rounded-full border px-3 py-1.5 text-xs transition ${
            selected(o) ? "border-ink bg-ink text-paper" : "border-line-strong text-ink-soft hover:border-ink hover:text-ink"
          }`}
        >
          {rotulo(String(o))}
        </button>
      ))}
    </div>
  );
}

export function Segmented<T extends string | number>({ options, value, onChange, label }: { options: readonly T[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full border border-line-strong p-0.5">
      {options.map((o) => (
        <button
          key={String(o)}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`flex-1 rounded-full py-1.5 text-xs tabular-nums transition ${value === o ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function RunButton({ running, onClick, children }: { running: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={running}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-paper transition enabled:hover:bg-rust disabled:cursor-wait disabled:opacity-80"
    >
      {running && <Loader2 className="size-4 animate-spin" />}
      {running ? "Gerando…" : children}
    </button>
  );
}

const icon = {
  run: <Loader2 className="size-3.5 animate-spin text-rust" />,
  ok: <Check className="size-3.5 text-ink" />,
  erro: <X className="size-3.5 text-rust" />,
  skip: <CircleDashed className="size-3.5 text-muted" />,
};

/** Cada etapa que o servidor executa, ao vivo. */
export function PipelineTrace({ steps, meta }: { steps: Step[]; meta: DemoMeta | null }) {
  if (!steps.length) return null;
  return (
    <div className="rounded-xl border border-line p-3.5">
      <p className="mb-2.5 font-mono text-[10px] tracking-[0.16em] text-muted uppercase">Pipeline</p>
      <ol className="space-y-2">
        <AnimatePresence initial={false}>
          {steps.map((s) => (
            <motion.li key={s.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 text-xs">
              <span className="flex size-4 items-center justify-center">{icon[s.status]}</span>
              <span className={s.status === "run" ? "text-ink" : "text-ink-soft"}>{s.label}</span>
              <span className="ml-auto truncate pl-2 font-mono text-[10px] text-muted">{s.detail}</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      {meta && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 font-mono text-[10px] text-muted">
          <Metric label="1º item" value={meta.primeiroItemMs != null ? `${(meta.primeiroItemMs / 1000).toFixed(1)}s` : "—"} />
          <Metric label="total" value={`${(meta.ms / 1000).toFixed(1)}s`} />
          <Metric label="itens" value={`${meta.itens}${meta.descartados ? `/${meta.itens + meta.descartados}` : ""}`} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="uppercase">{label}</div>
      <div className="mt-0.5 text-sm text-ink tabular-nums">{value}</div>
    </div>
  );
}

export function Notice({ tone, children }: { tone: "info" | "warn" | "error"; children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed ${tone === "info" ? "border-line-strong text-ink-soft" : "border-rust/40 bg-rust-soft text-ink"}`}
    >
      {tone === "info" ? <Info className="mt-0.5 size-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-rust" />}
      <span>{children}</span>
    </motion.div>
  );
}

export const itemMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-3 animate-pulse rounded bg-ink/10 ${className}`} />;
}
