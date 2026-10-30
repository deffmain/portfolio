"use client";

import { useCallback, useRef, useState } from "react";
import type { DemoMeta, StepStatus } from "@/lib/ai/stream";

export type Step = { id: string; label: string; status: StepStatus; detail?: string; at: number };

type State<Item, Extra> = {
  status: "idle" | "running" | "done" | "error";
  steps: Step[];
  items: Item[];
  extra: Extra | null;
  aviso: string | null;
  error: string | null;
  meta: DemoMeta | null;
};

const initial = { status: "idle", steps: [], items: [], extra: null, aviso: null, error: null, meta: null } as const;

/**
 * Consome uma rota de demo que responde em NDJSON e vai montando o estado
 * conforme os eventos chegam — passos do pipeline, itens validados e metadados.
 */
export function useDemoStream<Item, Extra = never>(url: string, extraType?: string) {
  const [state, setState] = useState<State<Item, Extra>>({ ...initial, steps: [], items: [] });
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (body: unknown) => {
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const t0 = performance.now();
      setState({ ...initial, steps: [], items: [], status: "running" });

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const msg = (await res.json().catch(() => null))?.error ?? "Não foi possível falar com o servidor.";
          setState((s) => ({ ...s, status: "error", error: msg }));
          return;
        }

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = "";
        let finished = false;
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += value;
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            const ev = JSON.parse(line);
            const at = Math.round(performance.now() - t0);
            if (ev.type === "done" || ev.type === "error") finished = true;
            setState((s) => {
              switch (ev.type) {
                case "step": {
                  const idx = s.steps.findIndex((x) => x.id === ev.id);
                  const step: Step = { id: ev.id, label: ev.label, status: ev.status, detail: ev.detail ?? s.steps[idx]?.detail, at };
                  const steps = idx === -1 ? [...s.steps, step] : s.steps.map((x, i) => (i === idx ? step : x));
                  return { ...s, steps };
                }
                case "item":
                  return { ...s, items: [...s.items, ev.data as Item] };
                case "aviso":
                  return { ...s, aviso: ev.message };
                case "done":
                  return { ...s, status: "done", meta: ev.meta };
                case "error":
                  return { ...s, status: "error", error: ev.message };
                default:
                  return ev.type === extraType ? { ...s, extra: ev.data as Extra } : s;
              }
            });
          }
        }
        if (!finished) setState((s) => (s.status === "running" ? { ...s, status: "error", error: "A conexão foi encerrada antes do fim." } : s));
      } catch (err) {
        if (ctrl.signal.aborted) return;
        console.error(err);
        setState((s) => ({ ...s, status: "error", error: "Falha de rede. Tente de novo." }));
      }
    },
    [url, extraType],
  );

  return { ...state, run };
}
