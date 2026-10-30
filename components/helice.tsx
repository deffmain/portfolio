"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ViewTransition,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { solucoes } from "@/content/perfil";
import { VisualSolucao } from "@/components/visuais";
import { Label, Lines } from "@/components/ui";
import { VOLTA_PROJETO } from "@/lib/bus";

// Anel 3D de soluções (efeito "tornado" do garcy.studio, achatado num anel).
// Um card por projeto: o card i fica no ângulo a = i·90° + giro, todos na
// mesma altura, em volta de um eixo vertical. Tudo que muda a cada quadro vive
// em refs e vai direto para `style`; o React só re-renderiza quando o card da
// frente muda.
//
// Ao abrir um projeto: (1) foco — o giro para, o card se alinha de frente e os
// outros recuam em cascata; (2) voo — o card vira a capa do estudo de caso
// (<ViewTransition name="capa-…">); (3) chegada — o resto da página sobe.

const N = solucoes.length; // um card por projeto
const CARDS = Array.from({ length: N }, (_, i) => i);
const PASSO = 360 / N; // 90°
/** Ângulo normalizado em (-180, 180]. */
const norm = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
// Curvatura: cada card é feito de FATIAS verticais dispostas num arco. O arco
// total vai de 0 (na frente: card reto) até CURVA_MAX nas laterais e atrás,
// o que liga visualmente os cards ao anel.
const FATIAS = 10;
const FATIAS_IDX = Array.from({ length: FATIAS }, (_, k) => k);
const CURVA_MAX = 0.9; // radianos (~52°) de arco total no card mais curvo
// Nenhuma fatia da face visível passa deste ângulo em relação à câmera: perto
// do perfil a curva diminui até zero, para o card nunca mostrar frente e verso
// ao mesmo tempo.
const LIMITE_FATIA = (78 * Math.PI) / 180;
// Folga na virada frente ⇄ verso (cosseno de ~1,5°), para não piscar.
const HISTERESE = Math.sin((1.5 * Math.PI) / 180);
// Curva (rad) a partir da qual a sombra plana já sumiu por completo.
const CURVA_SOMBRA = 0.06;
// Cada fatia invade a vizinha alguns px: o desfoque dos cards de trás borra a
// borda de cada fatia, e sem essa sobra apareceriam frestas verticais.
const SOBRA = 4;
const GIRO_AUTO = 0.006; // graus/ms (~6°/s)
const PERSPECTIVA = 1700;
const INCLINACAO = -6; // graus: os cards de trás aparecem um pouco acima
const FOCO_MS = 350;
const ENTRADA_MS = 3300; // quando o último card termina de montar
const PAUSA_VOLTA_MS = 900; // o voo da volta dura 560 ms; o card não pode andar antes de a capa pousar

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const suave = (t: number) => t * t * (3 - 2 * t);
/** Distância entre dois cards no anel (1 = vizinho). */
const distancia = (i: number, j: number) => {
  const d = Math.abs(i - j) % N;
  return Math.min(d, N - d);
};
/** No celular o anel é mais fechado, para sempre haver card perto do centro;
 *  os das laterais podem sair da tela. */
const raioDe = (w: number) => (w < 600 ? w * 0.62 : Math.min(w * 0.38, 620));
/** ~300 px no desktop; no celular, ~53% da tela (desacoplado do raio). */
const larguraDe = (w: number) => (w < 600 ? w * 0.53 : 0.545 * raioDe(w));

type Estado = {
  angulo: number; // giro automático acumulado
  yaw: number; // giro do usuário (suavizado)
  alvoYaw: number;
  vel: number; // inércia do arrasto, em graus por quadro de 16,7 ms
  voo: number; // ms desde o início da entrada (-1 = não começou)
  arrastando: boolean;
  w: number;
  h: number;
  nuvem: { espalha: number; giro: number }[];
  foco: { card: number; t0: number } | null; // t0 = -1 até o laço carimbar o início
  pausa: number; // ms sem giro automático (enquanto a capa pousa de volta no anel)
};

/** Índice do projeto de onde o usuário está voltando, se houver. */
function lerVolta(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const k = solucoes.findIndex((s) => s.slug === sessionStorage.getItem(VOLTA_PROJETO));
    return k >= 0 ? k : null;
  } catch {
    return null;
  }
}

function estadoInicial(volta: number | null): Estado {
  const yaw = volta === null ? 0 : -volta * PASSO;
  return {
    angulo: 0,
    yaw,
    alvoYaw: yaw,
    vel: 0,
    voo: volta === null ? -1 : ENTRADA_MS, // voltando: anel já formado, sem entrada
    arrastando: false,
    w: 0,
    h: 0,
    nuvem: [],
    foco: null,
    pausa: volta === null ? 0 : PAUSA_VOLTA_MS,
  };
}

export function HeliceSolucoes() {
  const router = useRouter();
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const fatias = useRef<(HTMLSpanElement | null)[][]>(CARDS.map(() => []));
  const sombras = useRef<(HTMLSpanElement | null)[]>([]);
  // Estado aplicado em cada fatia: 1 = frente visível, -1 = verso, 0 = escondida.
  const lados = useRef(new Int8Array(N * FATIAS).fill(1));
  // Face escolhida para cada card inteiro: 1 = frente, -1 = verso.
  const faces = useRef(new Int8Array(N).fill(1));
  const reduce = useReducedMotion();
  const visivel = useInView(secao, { margin: "100px" });

  const [volta] = useState(lerVolta);
  const [estado0] = useState(() => estadoInicial(volta));
  const st = useRef(estado0);
  const frente = useRef(volta ?? 0); // card mais à frente
  const destino = useRef<number | null>(null); // card que as setas mandaram para a frente
  const formadoRef = useRef(volta !== null);
  const ponteiro = useRef<{ id: number; x0: number; y0: number; x: number; moveu: boolean } | null>(null);
  const [ativo, setAtivo] = useState(volta ?? 0);
  // A capa só ganha nome de transição com o anel montado (no meio da entrada
  // não há card "da frente" para virar capa).
  const [formado, setFormado] = useState(volta !== null);

  const medir = useCallback(() => {
    const el = palco.current;
    if (!el) return;
    const s = st.current;
    s.w = el.clientWidth;
    s.h = el.clientHeight;
    const largura = larguraDe(s.w);
    cards.current.forEach((c) => {
      if (!c) return;
      c.style.width = `${largura}px`;
      c.style.setProperty("--w", `${largura}px`);
    });
  }, []);

  /** Recalcula e aplica o transform de todos os cards. */
  const posicionar = useCallback(
    (agora = performance.now()) => {
      const s = st.current;
      if (!s.w) return;
      const raio = raioDe(s.w);
      const voo = Math.max(0, s.voo);
      const semEntrada = !!reduce;

      let melhor = -2;
      let idx = 0;
      for (let i = 0; i < N; i++) {
        const el = cards.current[i];
        if (!el) continue;
        const a = i * PASSO + s.angulo + s.yaw;
        const rad = (a * Math.PI) / 180;
        const prof = Math.cos(rad);
        const t = voo - i * 38;
        const sobe = semEntrada ? 1 : clamp(t / 1400, 0, 1);
        const monta = semEntrada ? 1 : suave(clamp((t - 950) / 1900, 0, 1));
        const ergue = 1 - Math.pow(1 - sobe, 3);
        const { espalha, giro } = s.nuvem[i] ?? { espalha: 0, giro: 0 };
        const x = mix(espalha * s.w * 0.85, Math.sin(rad) * raio, monta);
        const y = mix(s.h * 0.85 + i * 12, mix((i - (N - 1) / 2) * 27, 0, monta), ergue);
        let z = mix(-220, prof * raio, monta);
        let opacidade = clamp(sobe * 3, 0, 1);
        let desfoque = Math.max(0, -prof) * 1.6 * monta;

        // Foco: os outros recuam, desfocam e somem, a partir dos vizinhos.
        if (s.foco && s.foco.t0 >= 0 && i !== s.foco.card) {
          const p = clamp((agora - s.foco.t0 - (distancia(i, s.foco.card) - 1) * 40) / 150, 0, 1);
          z -= 200 * p;
          opacidade *= 1 - p;
          desfoque += 6 * p;
        }

        // O card gira o ângulo inteiro com o anel: de frente na frente, de
        // costas quando passa por trás.
        const giroCard = norm(a) * monta; // graus
        el.style.visibility = "visible";
        el.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotateY(${giroCard}deg) rotateZ(${giro * (1 - monta)}deg)`;

        // Filter e opacity no card achatariam as fatias num plano (perderiam a
        // curva), então ficam em cada fatia — que ainda ganha sombreado próprio.
        const brilho = 0.4 + (prof + 1) * 0.3;
        const filtroBlur = desfoque > 0.01 ? ` blur(${desfoque}px)` : "";
        const giroRad = (giroCard * Math.PI) / 180;
        const cosC = Math.cos(giroRad);
        const senC = Math.sin(giroRad);

        // Face do card inteiro, decidida no centro dele: normal · vetor
        // card→câmera. Com a perspectiva, o verso aparece antes dos 90°.
        const cvx = -x;
        const cvz = PERSPECTIVA - z;
        const cosVista = (senC * cvx + cosC * cvz) / Math.hypot(cvx, cvz);
        if (cosVista > HISTERESE) faces.current[i] = 1;
        else if (cosVista < -HISTERESE) faces.current[i] = -1;
        const face = faces.current[i];

        // Curva: cresce da frente para as laterais e atrás, mas a fatia mais
        // inclinada (ângulo de visão + metade do arco) fica abaixo do limite.
        const vista = Math.acos(Math.min(1, Math.abs(cosVista)));
        const curvaAnel = CURVA_MAX * clamp(1 - prof, 0, 1) * monta; // pela posição no anel
        const curva = Math.min(curvaAnel, Math.max(0, 2 * (LIMITE_FATIA - vista)));
        const largura = larguraDe(s.w);
        const r = curva > 1e-4 ? largura / curva : 0;
        for (let k = 0; k < FATIAS; k++) {
          const f = fatias.current[i][k];
          if (!f) continue;
          const u = (k + 0.5) / FATIAS - 0.5; // posição da fatia no card, de -0,5 a 0,5
          const phi = u * curva;
          const fx = r ? r * Math.sin(phi) - u * largura : 0;
          const fz = r ? r * (Math.cos(phi) - 1) : 0;
          f.style.transform = `translate3d(${fx}px,0,${fz}px) rotateY(${phi}rad)`;

          // Qual lado a câmera vê: normal da fatia · vetor fatia→câmera. Com a
          // perspectiva, o verso aparece antes dos 90° (nas laterais).
          const lx = u * largura + fx;
          const sx = x + lx * cosC + fz * senC;
          const sz = z - lx * senC + fz * cosC;
          const vx = -sx;
          const vz = PERSPECTIVA - sz;
          const dot = Math.sin(giroRad + phi) * vx + Math.cos(giroRad + phi) * vz;
          const luz = Math.abs(dot) / Math.hypot(vx, vz); // 1 = de frente para a câmera
          f.style.filter = `brightness(${brilho * (0.82 + 0.18 * luz)})${filtroBlur}`;
          f.style.opacity = String(opacidade);

          // A fatia mostra a face do card; se estiver de costas para a câmera
          // nessa face, some (como backface-visibility: hidden). Nunca a outra.
          const lado = (dot >= 0 ? 1 : -1) === face ? face : 0;
          const j = i * FATIAS + k;
          if (lados.current[j] !== lado) {
            lados.current[j] = lado;
            (f.firstElementChild as HTMLElement).style.visibility = lado === 1 ? "visible" : "hidden";
            (f.lastElementChild as HTMLElement).style.visibility = lado === -1 ? "visible" : "hidden";
          }
        }
        const sombra = sombras.current[i];
        // A sombra é um plano reto atrás das fatias. Com o card curvo, as bordas
        // se dobram para trás e o plano sobra para fora delas — com a GPU, como
        // uma folha clara grudada no card. Por isso só o card perto da frente
        // (reto, o que vira capa) tem sombra; ela some conforme ele sai da frente
        // e não volta nas laterais, onde o limite de 78° desfaz a curva.
        if (sombra) sombra.style.opacity = String(opacidade * clamp(1 - curvaAnel / CURVA_SOMBRA, 0, 1));
        if (prof > melhor) {
          melhor = prof;
          idx = i;
        }
      }
      if (idx !== frente.current && !s.foco) {
        frente.current = idx;
        setAtivo(idx);
      }
    },
    [reduce],
  );

  // Roda ao montar e toda vez que a página volta a aparecer: com Cache
  // Components o Next esconde a home com <Activity> em vez de desmontá-la, e o
  // estado (inclusive o modo foco) é preservado. Antes da pintura — e antes de
  // o navegador capturar o estado da transição — o anel sai do foco e, se o
  // usuário está voltando de um projeto, já aparece formado com ele na frente
  // e com a seção na rolagem certa.
  useLayoutEffect(() => {
    const s = st.current;
    s.foco = null;
    s.arrastando = false;
    ponteiro.current = null;
    const k = lerVolta();
    if (k !== null) {
      try {
        sessionStorage.removeItem(VOLTA_PROJETO);
      } catch {}
      const card = k; // um card por projeto
      s.voo = Math.max(s.voo, ENTRADA_MS);
      s.vel = 0;
      s.pausa = PAUSA_VOLTA_MS;
      s.angulo = 0;
      s.yaw = s.alvoYaw = -card * PASSO;
      destino.current = null;
      formadoRef.current = true;
      frente.current = -1; // força posicionar() a publicar o card da frente
      const sec = secao.current;
      if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    }
    medir();
    posicionar();
  }, [medir, posicionar]);

  // Trocar o card da frente recria a face dele (entra/sai o ViewTransition);
  // reaplica curva, brilho e opacidade das fatias antes da pintura.
  useLayoutEffect(() => {
    posicionar();
  }, [ativo, formado, posicionar]);

  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      medir();
      posicionar();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [medir, posicionar]);

  // O morph só acontece com a página de destino em cache.
  useEffect(() => {
    router.prefetch(`/solucoes/${solucoes[ativo].slug}`);
  }, [ativo, router]);

  // Laço de animação: só roda com a seção visível e a aba ativa.
  useEffect(() => {
    if (!visivel) return;
    const s = st.current;
    if (s.voo < 0) {
      s.nuvem = Array.from({ length: N }, () => ({ espalha: Math.random() - 0.5, giro: (Math.random() - 0.5) * 110 }));
      s.voo = reduce ? ENTRADA_MS : 0;
    }
    let raf = 0;
    let ultimo = performance.now();
    const tick = (agora: number) => {
      const dt = Math.min(agora - ultimo, 50);
      ultimo = agora;
      if (!document.hidden) {
        s.voo += dt;
        if (s.foco && s.foco.t0 < 0) s.foco.t0 = agora;
        const livre = !s.arrastando && !s.foco;
        if (s.pausa > 0) s.pausa -= dt;
        else if (!reduce && livre) s.angulo -= dt * GIRO_AUTO;
        if (livre) {
          s.alvoYaw += (s.vel * dt) / 16.67;
          s.vel *= Math.pow(0.94, dt / 16.67);
        }
        s.yaw = mix(s.yaw, s.alvoYaw, 1 - Math.exp(-dt / (s.foco ? 60 : 100)));
        posicionar(agora);
        if (!formadoRef.current && s.voo >= ENTRADA_MS) {
          formadoRef.current = true;
          setFormado(true);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visivel, reduce, posicionar]);

  // Scroll horizontal do trackpad gira; a roda vertical continua rolando a página.
  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) >= Math.abs(e.deltaX) || st.current.foco) return;
      e.preventDefault();
      st.current.alvoYaw -= e.deltaX * 0.1;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /** Gira até o card `alvo` ficar na frente, pelo caminho mais curto. */
  const trazerParaFrente = (alvo: number) => {
    const s = st.current;
    alvo = ((alvo % N) + N) % N;
    destino.current = alvo;
    s.vel = 0;
    const atual = s.angulo + s.alvoYaw;
    let desejado = -alvo * PASSO;
    desejado += Math.round((atual - desejado) / 360) * 360;
    s.alvoYaw = desejado - s.angulo;
  };

  // Cliques seguidos nas setas somam: se ainda está girando até um destino,
  // o próximo passo parte dele, não do card que está na frente agora.
  const vizinho = (dir: 1 | -1) => {
    const s = st.current;
    if (s.foco) return;
    const girando = destino.current !== null && Math.abs(s.alvoYaw - s.yaw) > 2;
    trazerParaFrente((girando ? destino.current! : frente.current) + dir);
  };

  /** Abre o estudo de caso: foco (350 ms na home) e depois navega com o morph. */
  const abrir = (card: number) => {
    const s = st.current;
    if (s.foco) return;
    const url = `/solucoes/${solucoes[card].slug}`;
    if (reduce) {
      router.push(url, { transitionTypes: ["abrir-projeto"] });
      return;
    }
    trazerParaFrente(card);
    s.foco = { card, t0: -1 };
    window.setTimeout(() => {
      s.yaw = s.alvoYaw; // alinhamento exato: rotateY(0) no card clicado
      posicionar();
      router.push(url, { transitionTypes: ["abrir-projeto"] });
    }, FOCO_MS);
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") vizinho(1);
    else if (e.key === "ArrowLeft") vizinho(-1);
    else if (e.key === "Home") trazerParaFrente(0);
    else return;
    e.preventDefault();
  };

  // Arrasto só na horizontal; vira arrasto depois de 5 px — antes disso é clique.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || st.current.foco || (e.target as HTMLElement).closest("button")) return;
    ponteiro.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, moveu: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = ponteiro.current;
    if (!p || p.id !== e.pointerId) return;
    const s = st.current;
    if (!p.moveu) {
      if (Math.hypot(e.clientX - p.x0, e.clientY - p.y0) <= 5) return;
      p.moveu = true;
      s.arrastando = true;
      s.vel = 0;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const dx = e.clientX - p.x;
    p.x = e.clientX;
    s.alvoYaw += dx * 0.24;
    s.vel = clamp(dx * 0.18, -4, 4);
  };
  const soltar = () => {
    st.current.arrastando = false;
    // Mantém `moveu` até o clique (que vem depois do pointerup) poder consultá-lo.
    if (ponteiro.current) ponteiro.current.id = -1;
  };

  const novaAba = (e: MouseEvent) => e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;

  const onCardClick = (e: MouseEvent, i: number) => {
    const arrastou = ponteiro.current?.moveu;
    ponteiro.current = null;
    if (arrastou) return e.preventDefault();
    if (novaAba(e)) return;
    e.preventDefault();
    // Enter pelo teclado (detail 0) abre direto; clique num card de trás só gira.
    if (i === frente.current || e.detail === 0) abrir(i);
    else trazerParaFrente(i);
  };

  const onCardFocus = (e: FocusEvent<HTMLAnchorElement>, i: number) => {
    if (e.currentTarget.matches(":focus-visible")) trazerParaFrente(i);
  };

  const n = solucoes.length;
  const sol = solucoes[ativo];
  const animar = !reduce; // com movimento reduzido: sem foco e sem voo, só crossfade

  return (
    <section ref={secao} id="solucoes" aria-roledescription="carrossel" aria-label="Soluções" className="scroll-mt-16 overflow-hidden py-20 md:py-28" onKeyDown={onKey}>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-5 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <Label className="whitespace-nowrap text-muted">({String(n).padStart(2, "0")}) problema → solução</Label>
          <h2 className="mt-3 font-serif text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.9]">
            <Lines lines={["Soluções"]} />
          </h2>
        </div>
        <div className="flex items-center justify-between gap-5 pb-1">
          <span className="font-mono text-sm whitespace-nowrap tabular-nums" aria-hidden>
            <span className="text-rust">{String(ativo + 1).padStart(2, "0")}</span>
            <span className="text-muted"> / {String(n).padStart(2, "0")}</span>
          </span>
          <div className="flex gap-2">
            <BotaoSeta label="Solução anterior" onClick={() => vizinho(-1)}>
              <ArrowLeft className="size-4" />
            </BotaoSeta>
            <BotaoSeta label="Próxima solução" onClick={() => vizinho(1)}>
              <ArrowRight className="size-4" />
            </BotaoSeta>
          </div>
        </div>
      </div>

      <div
        ref={palco}
        className="relative mt-4 h-[320px] cursor-grab select-none active:cursor-grabbing sm:h-[400px] md:h-[480px]"
        style={{ perspective: `${PERSPECTIVA}px`, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onLostPointerCapture={soltar}
      >
        <div className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `translateY(-6%) rotateX(${INCLINACAO}deg)` }}>
          {CARDS.map((i) => {
            const s = solucoes[i];
            // A face 16:10 é o elemento que vira a capa no estudo de caso.
            const face = (
              <span className="relative block aspect-[16/10] w-full" style={{ transformStyle: "preserve-3d" }}>
                <span
                  ref={(el) => {
                    sombras.current[i] = el;
                  }}
                  aria-hidden
                  className="absolute inset-0 rounded-xl shadow-[0_24px_50px_-18px_rgb(20_20_19/0.45)]"
                />
                {FATIAS_IDX.map((k) => (
                  <span
                    key={k}
                    ref={(el) => {
                      fatias.current[i][k] = el;
                      // Fatia (re)criada nasce com a frente visível: o cache acompanha.
                      if (el) lados.current[i * FATIAS + k] = 1;
                    }}
                    className="absolute top-0 h-full overflow-hidden"
                    style={{ left: `calc(var(--w) * ${k / FATIAS} - ${SOBRA}px)`, width: `calc(var(--w) / ${FATIAS} + ${2 * SOBRA}px)` }}
                  >
                    <span
                      className="absolute top-0 block h-full overflow-hidden rounded-xl border border-line bg-paper-2"
                      style={{ left: `calc(var(--w) * ${-k / FATIAS} + ${SOBRA}px)`, width: "var(--w)" }}
                    >
                      <VisualSolucao visual={s.visual} className="pointer-events-none block h-full w-full" />
                    </span>
                    {/* Verso: espelhado aqui para ler direito quando o card está de costas. */}
                    <span
                      aria-hidden
                      className="absolute top-0 flex h-full -scale-x-100 flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-line bg-paper-2"
                      style={{ left: `calc(var(--w) * ${-k / FATIAS} + ${SOBRA}px)`, width: "var(--w)", visibility: "hidden" }}
                    >
                      <span className="font-mono text-xs tracking-widest text-rust">{String(i + 1).padStart(2, "0")}</span>
                      <span className="px-6 text-center font-serif text-[clamp(1.1rem,2vw,1.75rem)] leading-tight text-ink/70">{s.nome}</span>
                    </span>
                  </span>
                ))}
              </span>
            );
            return (
              <Link
                key={i}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                href={`/solucoes/${s.slug}`}
                draggable={false}
                prefetch={false}
                aria-label={`${s.nome} — abrir estudo de caso`}
                onClick={(e) => onCardClick(e, i)}
                onFocus={(e) => onCardFocus(e, i)}
                className="absolute top-1/2 left-1/2 block w-[180px] rounded-xl outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-rust"
                style={{ visibility: "hidden", transformStyle: "preserve-3d" }}
              >
                {/* Só o card da frente recebe o nome capa-…: os outros ficam na
                    imagem da home e somem/aparecem junto com ela. */}
                {animar && formado && i === ativo ? (
                  <ViewTransition name={`capa-${s.slug}`} share="morph" default="none">
                    {face}
                  </ViewTransition>
                ) : (
                  face
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Projeto da frente */}
      <div className="mx-auto mt-6 max-w-xl px-5 text-center md:mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={sol.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
          >
            <Label className="text-muted">{sol.contexto}</Label>
            <h3 className="mt-2 font-serif text-[clamp(2.25rem,4vw,3rem)] leading-[0.95]">
              {animar ? (
                <ViewTransition name={`titulo-${sol.slug}`} share="morph" default="none">
                  <span className="inline-block">{sol.nome}</span>
                </ViewTransition>
              ) : (
                <span className="inline-block">{sol.nome}</span>
              )}
            </h3>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-snug text-ink-soft">{sol.problemaCurto}</p>
            <Link
              href={`/solucoes/${sol.slug}`}
              prefetch={false}
              onClick={(e) => {
                if (novaAba(e)) return;
                e.preventDefault();
                abrir(frente.current);
              }}
              className="mt-5 inline-flex items-center gap-1.5 text-sm"
            >
              <span className="link-line">Ver estudo de caso</span>
              <ArrowUpRight className="size-4 text-rust" />
            </Link>
          </motion.div>
        </AnimatePresence>
        <Label className="mt-8 block text-muted">
          <span className="hidden md:inline">Arraste para girar</span>
          <span className="md:hidden">Deslize para girar</span>
        </Label>
      </div>
    </section>
  );
}

function BotaoSeta({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-11 items-center justify-center rounded-full border border-line-strong transition hover:border-ink hover:bg-ink hover:text-paper"
    >
      {children}
    </button>
  );
}
