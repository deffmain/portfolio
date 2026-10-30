"use client";

import { useEffect, useRef, type RefObject } from "react";
import { ajustarCanvas, iniciarLaco, type Ponteiro } from "@/lib/laco-canvas";

// Campo de tokens: uma grade de caracteres em mono quase apagada atrás da
// seção. Por onde o cursor passa, as células ganham energia, embaralham e
// acendem — e apagam devagar, deixando rastro. Faíscas soltas parecem o
// modelo "pensando".
//
// Foco: elementos com [data-alvo] dentro de `alvos` são os blocos de
// informação. Quando o ponteiro chega perto de um deles, o campo se acalma
// atrás dele e o bloco recebe [data-foco] — o CSS da seção faz o destaque.

const GLIFOS = "{}[]()<>=+-*/_.:;01#$%&?!abcdefgijklmnopqrstuvxyz";
const CW = 12; // largura da célula
const CH = 20; // altura da célula
const PERTO = 28; // px ao redor do bloco que já contam como "perto"
const FOLGA = 16; // px que a área calma passa das laterais do bloco

const papel = (a: number) => `rgba(242,239,232,${a})`;
const coral = (a: number) => `rgba(224,118,79,${a})`;
const TINTA = "#141413";

export function CampoTokens({ area, alvos }: { area: RefObject<HTMLElement | null>; alvos?: RefObject<HTMLElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = area.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    let w = 0;
    let h = 0;
    let cols = 0;
    let lins = 0;
    let energia = new Float32Array(0);
    let glifo = new Uint8Array(0);
    let fundo: HTMLCanvasElement | null = null;
    let fonte = "12px monospace";

    let focado: HTMLElement | null = null;
    const calma = { x: 0, y: 0, w: 0, h: 0, a: 0 }; // a: 0 = sem área calma, 1 = calma total

    const focar = (p: Ponteiro) => {
      let novo: HTMLElement | null = null;
      if (p.real && p.ativo && alvos?.current) {
        const ra = el.getBoundingClientRect();
        const [x, y] = [p.x + ra.left, p.y + ra.top];
        for (const it of alvos.current.querySelectorAll<HTMLElement>("[data-alvo]")) {
          const r = it.getBoundingClientRect();
          if (x > r.left - PERTO && x < r.right + PERTO && y > r.top - PERTO && y < r.bottom + PERTO) {
            novo = it;
            break;
          }
        }
      }
      if (novo === focado) return;
      focado?.removeAttribute("data-foco");
      novo?.setAttribute("data-foco", "");
      focado = novo;
    };

    const parar = iniciarLaco(el, {
      medir(nw, nh, dpr) {
        w = nw;
        h = nh;
        ajustarCanvas(cv, w, h, dpr);
        cols = Math.ceil(w / CW);
        lins = Math.ceil(h / CH);
        energia = new Float32Array(cols * lins);
        glifo = new Uint8Array(cols * lins).map(() => Math.floor(Math.random() * GLIFOS.length));
        const familia = getComputedStyle(document.documentElement).getPropertyValue("--font-geist-mono").trim() || "monospace";
        fonte = `12px ${familia}`;
        // A camada de fundo (pontinhos) é desenhada uma vez só.
        fundo = document.createElement("canvas");
        fundo.width = cv.width;
        fundo.height = cv.height;
        const f = fundo.getContext("2d");
        if (!f) return;
        f.scale(dpr, dpr);
        f.font = fonte;
        f.textAlign = "center";
        f.textBaseline = "middle";
        f.fillStyle = papel(0.09);
        for (let r = 0; r < lins; r++) for (let c = 0; c < cols; c++) f.fillText("·", c * CW + CW / 2, r * CH + CH / 2);
      },

      aoMover: focar,

      quadro(dt, _t, p) {
        const k = dt / 16.67;

        // Área calma atrás do bloco focado: acompanha o bloco e entra/sai suave.
        if (focado) {
          const ra = el.getBoundingClientRect();
          const r = focado.getBoundingClientRect();
          calma.x = r.left - ra.left - FOLGA;
          calma.y = r.top - ra.top;
          calma.w = r.width + FOLGA * 2;
          calma.h = r.height;
        }
        calma.a += ((focado ? 1 : 0) - calma.a) * (1 - Math.exp(-dt / 140));
        const naCalma = (x: number, y: number) =>
          calma.a > 0.05 && x > calma.x && x < calma.x + calma.w && y > calma.y && y < calma.y + calma.h;

        if (p.ativo) {
          const R = 70 + p.vel * 30;
          const ganho = 0.12 + Math.min(p.vel, 2) * 0.25;
          const c0 = Math.max(0, Math.floor((p.x - R) / CW));
          const c1 = Math.min(cols - 1, Math.ceil((p.x + R) / CW));
          const r0 = Math.max(0, Math.floor((p.y - R) / CH));
          const r1 = Math.min(lins - 1, Math.ceil((p.y + R) / CH));
          for (let r = r0; r <= r1; r++)
            for (let c = c0; c <= c1; c++) {
              const cx = c * CW + CW / 2;
              const cy = r * CH + CH / 2;
              if (focado && naCalma(cx, cy)) continue;
              const d = Math.hypot(cx - p.x, cy - p.y);
              if (d < R) energia[r * cols + c] = Math.min(1, energia[r * cols + c] + (1 - d / R) * ganho * k);
            }
        }
        // Faíscas espontâneas (nunca dentro da área calma).
        for (let s = 0; s < 2; s++) {
          if (Math.random() >= 0.35 * k) continue;
          const i = Math.floor(Math.random() * energia.length);
          if (!naCalma((i % cols) * CW + CW / 2, ((i / cols) | 0) * CH + CH / 2)) energia[i] = 0.5;
        }

        ctx.clearRect(0, 0, w, h);
        if (fundo) ctx.drawImage(fundo, 0, 0, w, h);
        ctx.font = fonte;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const decai = Math.pow(0.955, k);
        const decaiCalma = Math.pow(0.8, k);
        for (let i = 0; i < energia.length; i++) {
          const e = energia[i];
          if (e < 0.03) continue;
          const cx = (i % cols) * CW + CW / 2;
          const cy = ((i / cols) | 0) * CH + CH / 2;
          energia[i] = e * (naCalma(cx, cy) ? decaiCalma : decai);
          if (Math.random() < e * 0.35 * k) glifo[i] = Math.floor(Math.random() * GLIFOS.length);
          ctx.fillStyle = TINTA; // apaga o pontinho do fundo
          ctx.fillRect(cx - CW / 2, cy - CH / 2, CW, CH);
          ctx.fillStyle = e > 0.65 ? coral(0.45 + e * 0.5) : papel(0.1 + e * 0.6);
          ctx.fillText(GLIFOS[glifo[i]], cx, cy);
        }

        // Cobre a área calma: o bloco focado fica sobre um fundo limpo.
        if (calma.a > 0.01) {
          ctx.fillStyle = `rgba(20,20,19,${calma.a})`;
          ctx.beginPath();
          ctx.roundRect(calma.x, calma.y, calma.w, calma.h, 8);
          ctx.fill();
          ctx.fillStyle = papel(0.03 * calma.a);
          ctx.fill();
        }
      },
    });

    return () => {
      parar();
      focado?.removeAttribute("data-foco");
    };
  }, [area, alvos]);

  return <canvas ref={canvas} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}
