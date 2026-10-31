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
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { solucoes } from "@/content/perfil";
import { VisualSolucao } from "@/components/visuais";
import { Label, Lines } from "@/components/ui";
import { VOLTA_PROJETO } from "@/lib/bus";
import { useEnquadrarAoChegar } from "@/lib/hooks";

// Anel 3D de soluções (efeito "tornado" do garcy.studio, achatado num anel).
// Um card plano por projeto: o card i fica no ângulo a = i·PASSO + giro, todos
// na mesma altura, em volta de um eixo vertical. Cada card tem duas faces com
// backface-visibility: hidden — a frente (ilustração) e o verso (número e
// nome) —, e o navegador mostra a que estiver virada para a câmera. Tudo que
// muda a cada quadro vive em refs e vai direto para `style`, e só o que mudou é
// escrito; o React só re-renderiza quando o card da frente muda.
//
// A seção é um palco escuro: o título fica logo acima do anel e o projeto da
// frente logo abaixo. Os cards de trás escurecem até a cor do fundo e o da
// frente acende (variáveis --escuro e --frente, que só mexem em opacidade).
//
// Ao abrir um projeto: (1) foco — o giro para, o card se alinha de frente e os
// outros recuam em cascata; (2) voo — a frente do card vira a capa do estudo de
// caso (<ViewTransition name="capa-…">); (3) chegada — o resto da página sobe.

const N = solucoes.length; // um card por projeto
const CARDS = Array.from({ length: N }, (_, i) => i);
const PASSO = 360 / N; // 72° com 5 soluções
/** Ângulo normalizado em (-180, 180]. */
const norm = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
const GIRO_AUTO = 0.006; // graus/ms (~6°/s)

// ── Giro pelo usuário (arrasto, trackpad, setas) ─────────────────────────────
// O anel persegue um ângulo-alvo: acelera até VEL_MAX e não passa dela, e
// começa a frear a tempo de parar exatamente no alvo. A inércia de um
// arremesso também respeita o teto. Ajuste aqui para mudar a sensação.
const VEL_MAX = 240; // graus/s — teto da velocidade do giro
const ACELERACAO = 1400; // graus/s² — quão rápido chega ao teto (e freia)
const RESPOSTA_MS = 100; // abaixo do teto, quão rápido o anel alcança o alvo
const ATRITO = 3; // 1/s — quanto a inércia perde por segundo depois de soltar
const ATRASO_MAX = 90; // graus — o alvo não corre mais que isso à frente do anel
const GRAUS_POR_PX = 0.24; // arrasto: graus de giro por pixel
// Setas não acumulam: o alvo fica no máximo 1 card além do que está entrando
// na frente, ou seja, a 2 cards do card da frente atual.
const SETAS_MAX = 2;

const PASSO_LUZ = 0.01; // escurecimento e destaque arredondados: cards parados não são reescritos
const PERSPECTIVA = 1700;
const INCLINACAO = -7; // graus: os cards de trás aparecem um pouco acima
// Palco escuro (tom "Terra"): os cards de trás escurecem até a cor do fundo.
const FUNDO = "#1f1915";
const LUZ_PALCO = "rgb(224 118 79 / 0.09)";
const FOCO_MS = 280;
const RESERVA_MS = 4000; // sem navegação até aqui, abrir() desiste do morph e recarrega
const RECUO_MS = 200; // cada card que não foi clicado recua e some nesse tempo…
const RECUO_PASSO_MS = 40; // …começando pelos vizinhos, um passo depois do outro
const ENTRADA_MS = 3300; // quando o último card termina de montar
const PAUSA_VOLTA_MS = 900; // o voo da volta dura 540 ms; o card não pode andar antes de a capa pousar
// Fração do ângulo do anel que o card gira em torno de si. Com o ângulo inteiro,
// os vizinhos da frente param a 72°, quase de perfil: viram uma lâmina de ~20 px
// cuja borda o Chrome não suaviza (serrilha, e na volta de um projeto o anel
// fica parado nessa pose). Com 0,75 eles param a 54° e os de trás a 108° (verso).
const GIRO_CARD = 0.75;

// Texto do projeto da frente (as cópias que reservam a altura usam as mesmas classes).
const CL_NOME = "mt-2 font-serif text-[clamp(2rem,4vw,3rem)] leading-none";
const CL_DESCRICAO = "mx-auto mt-3 max-w-md text-[15px] leading-snug";
const CL_LINK = "mt-4 inline-flex items-center gap-1.5 text-sm";

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const quantiza = (v: number, passo: number) => Math.round(v / passo) * passo;
const f2 = (v: number) => Math.round(v * 100) / 100;

/** Escreve uma propriedade de estilo só se o valor mudou desde a última vez. */
const ultimos = new WeakMap<HTMLElement, Record<string, string>>();
function definir(el: HTMLElement, prop: "transform" | "opacity" | "visibility" | "--escuro" | "--frente" | "--visivel", valor: string) {
  let c = ultimos.get(el);
  if (!c) ultimos.set(el, (c = {}));
  if (c[prop] === valor) return;
  c[prop] = valor;
  el.style.setProperty(prop, valor);
}
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const suave = (t: number) => t * t * (3 - 2 * t);
/** Distância entre dois cards no anel (1 = vizinho). */
const distancia = (i: number, j: number) => {
  const d = Math.abs(i - j) % N;
  return Math.min(d, N - d);
};
/** Quantos cards de `de` até `ate`, pelo caminho mais curto (com sinal). */
const passosAte = (de: number, ate: number) => {
  const d = (((ate - de) % N) + N) % N;
  return d > N / 2 ? d - N : d;
};
/** Raio só o bastante para os vizinhos não se sobreporem. */
const raioDe = (largura: number) => largura * 1.12;
const FOLGA_ANEL = 12; // px livres em cima e embaixo do anel, dentro do palco

/**
 * Altura do anel na tela. Com a inclinação, o card da frente desce e cresce
 * (perspectiva) e o de trás sobe e encolhe; `centro` é quanto subir o anel para
 * os dois ficarem à mesma distância do meio do palco, e `meia` é essa distância.
 */
function alturaDoAnel(largura: number) {
  const r = raioDe(largura);
  const sen = Math.sin((-INCLINACAO * Math.PI) / 180);
  const cos = Math.cos((-INCLINACAO * Math.PI) / 180);
  const borda = (largura / 1.6 / 2) * cos + r * sen; // da linha do meio até a borda de fora
  const prof = r * cos - (largura / 1.6 / 2) * sen;
  const frente = PERSPECTIVA / (PERSPECTIVA - prof);
  const tras = PERSPECTIVA / (PERSPECTIVA + prof);
  return { centro: (borda * (frente - tras)) / (frente + tras), meia: (2 * borda * frente * tras) / (frente + tras) };
}

/**
 * Cards grandes — ~31% da largura no desktop (340–500 px), ~70% no celular —,
 * mas nunca maiores que o palco: a seção ocupa a tela, então em telas baixas o
 * anel encolhe para caber inteiro.
 */
function larguraDe(w: number, h: number) {
  let largura = w < 640 ? clamp(w * 0.7, 220, 320) : clamp(w * 0.31, 340, 500);
  while (largura > 140 && alturaDoAnel(largura).meia > h / 2 - FOLGA_ANEL) largura -= 4;
  return largura;
}

type Estado = {
  angulo: number; // giro automático acumulado
  yaw: number; // giro do usuário (com velocidade e aceleração limitadas)
  alvoYaw: number;
  velYaw: number; // velocidade atual do giro do usuário, graus/s (|v| ≤ VEL_MAX)
  inercia: number; // graus/s que o alvo continua andando depois de um arremesso
  voo: number; // ms desde o início da entrada (-1 = não começou)
  arrastando: boolean;
  w: number;
  h: number;
  largura: number; // dos cards, em px (depende da largura e da altura do palco)
  nuvem: { espalha: number; giro: number }[];
  foco: { card: number; t0: number } | null; // t0 = -1 até o laço carimbar o início
  pausa: number; // ms sem giro automático (enquanto a capa pousa de volta no anel)
};

/**
 * No arrasto, no trackpad e na inércia o alvo não corre mais que ATRASO_MAX à
 * frente do anel: senão ele ficaria girando sozinho muito depois de o usuário
 * parar. Destinos das setas e do Home não passam por aqui.
 */
function limitarAtraso(s: Estado) {
  s.alvoYaw = s.yaw + clamp(s.alvoYaw - s.yaw, -ATRASO_MAX, ATRASO_MAX);
}

/**
 * Leva o giro do usuário (yaw) até o alvo com velocidade e aceleração
 * limitadas: acelera até VEL_MAX, mantém, e freia a tempo de parar no alvo.
 * No foco (abrindo um projeto) usa a aproximação rápida, para o card se
 * alinhar nos 350 ms da etapa.
 */
function girarAteAlvo(s: Estado, dt: number, livre: boolean) {
  if (s.foco) {
    s.velYaw = 0;
    s.yaw = mix(s.yaw, s.alvoYaw, 1 - Math.exp(-(dt * 1000) / 60));
    return;
  }
  if (livre && s.inercia !== 0) {
    s.alvoYaw += s.inercia * dt;
    limitarAtraso(s);
    s.inercia *= Math.exp(-ATRITO * dt);
    if (Math.abs(s.inercia) < 1) s.inercia = 0;
  }
  const falta = s.alvoYaw - s.yaw;
  const dist = Math.abs(falta);
  if (dist < 0.005 && Math.abs(s.velYaw) < 2) {
    s.yaw = s.alvoYaw;
    s.velYaw = 0;
    return;
  }
  const desejada = Math.sign(falta) * Math.min(dist / (RESPOSTA_MS / 1000), VEL_MAX, Math.sqrt(2 * ACELERACAO * dist));
  s.velYaw += clamp(desejada - s.velYaw, -ACELERACAO * dt, ACELERACAO * dt);
  const passo = s.velYaw * dt;
  // Não ultrapassa o alvo num quadro longo.
  if (Math.abs(passo) >= dist && Math.sign(passo) === Math.sign(falta)) {
    s.yaw = s.alvoYaw;
    s.velYaw = 0;
  } else s.yaw += passo;
}

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
const semInscricao = () => () => {};

function estadoInicial(volta: number | null): Estado {
  const yaw = volta === null ? 0 : -volta * PASSO;
  return {
    angulo: 0,
    yaw,
    alvoYaw: yaw,
    velYaw: 0,
    inercia: 0,
    voo: volta === null ? -1 : ENTRADA_MS, // voltando: anel já formado, sem entrada
    arrastando: false,
    w: 0,
    h: 0,
    largura: 0,
    nuvem: [],
    foco: null,
    pausa: volta === null ? 0 : PAUSA_VOLTA_MS,
  };
}

export function HeliceSolucoes() {
  const router = useRouter();
  const secao = useRef<HTMLElement>(null);
  const palco = useRef<HTMLDivElement>(null);
  const anel = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLAnchorElement | null)[]>([]);
  const frentes = useRef<(HTMLSpanElement | null)[]>([]);
  const versos = useRef<(HTMLSpanElement | null)[]>([]);
  const reduce = useReducedMotion();
  const visivel = useInView(palco, { amount: 0.15 });

  // Voltando de um projeto numa montagem nova, o anel já nasce formado com ele
  // na frente (o morph da volta precisa disso no primeiro render). Na
  // hidratação vale o valor do servidor (nenhum), e o efeito de volta assume.
  const volta = useSyncExternalStore(semInscricao, lerVolta, () => null);
  const [estado0] = useState(() => estadoInicial(volta));
  const st = useRef(estado0);
  const frente = useRef(volta ?? 0); // card mais à frente
  const destino = useRef<number | null>(null); // card que as setas mandaram para a frente
  const formadoRef = useRef(volta !== null);
  const ponteiro = useRef<{ id: number; x0: number; y0: number; x: number; t: number; tReal: number; moveu: boolean } | null>(null);
  // Religa o laço de animação quando ele dorme (movimento reduzido, anel parado).
  const acordar = useRef(() => {});
  const [ativo, setAtivo] = useState(volta ?? 0);
  // A capa só ganha nome de transição com o anel montado (no meio da entrada
  // não há card "da frente" para virar capa).
  const [formado, setFormado] = useState(volta !== null);
  useEnquadrarAoChegar(secao);

  const medir = useCallback(() => {
    const el = palco.current;
    if (!el) return;
    const s = st.current;
    s.w = el.clientWidth;
    s.h = el.clientHeight;
    s.largura = larguraDe(s.w, s.h);
    const largura = `${s.largura}px`;
    cards.current.forEach((c) => {
      if (c) c.style.width = largura;
    });
    if (anel.current) anel.current.style.transform = `translateY(${f2(-alturaDoAnel(s.largura).centro)}px) rotateX(${INCLINACAO}deg)`;
  }, []);

  /** Recalcula e aplica o transform de todos os cards. */
  const posicionar = useCallback(
    (agora = performance.now()) => {
      const s = st.current;
      if (!s.w) return;
      const raio = raioDe(s.largura);
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

        // Foco: os outros recuam e somem, a partir dos vizinhos.
        if (s.foco && s.foco.t0 >= 0 && i !== s.foco.card) {
          const p = suave(clamp((agora - s.foco.t0 - (distancia(i, s.foco.card) - 1) * RECUO_PASSO_MS) / RECUO_MS, 0, 1));
          z -= 200 * p;
          opacidade *= 1 - p;
        }

        // O card gira com o anel, mas só GIRO_CARD do ângulo: de frente na
        // frente, de costas quando passa por trás (aí aparece o verso).
        const giroCard = norm(a) * GIRO_CARD * monta; // graus
        definir(el, "visibility", "visible");
        definir(el, "transform", `translate(-50%,-50%) translate3d(${f2(x)}px,${f2(y)}px,${f2(z)}px) rotateY(${f2(giroCard)}deg) rotateZ(${f2(giro * (1 - monta))}deg)`);

        // Luz por card, em variáveis CSS que só mexem em opacidade: os de trás
        // escurecem até a cor do palco e o da frente acende nos últimos ~30°,
        // com curva suave. `prof` é o cosseno do ângulo real do card (o mesmo
        // de x, z e do rotateY acima), então o card do centro tem prof = 1.
        const escuro = ((1 - prof) / 2) * 0.75;
        const acende = suave(clamp((prof - 0.86) / 0.14, 0, 1));
        const opacidadeTxt = String(f2(opacidade));
        definir(el, "--escuro", quantiza(escuro, PASSO_LUZ).toFixed(2));
        definir(el, "--frente", quantiza(acende, PASSO_LUZ).toFixed(2));
        definir(el, "--visivel", opacidadeTxt);
        // Opacity no card achataria as faces num plano só (o verso deixaria de
        // existir), então fica em cada face.
        for (const face of [frentes.current[i], versos.current[i]]) {
          if (face) definir(face, "opacity", opacidadeTxt);
        }
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
      s.voo = Math.max(s.voo, ENTRADA_MS);
      s.velYaw = 0;
      s.inercia = 0;
      s.pausa = PAUSA_VOLTA_MS;
      s.angulo = 0;
      s.yaw = s.alvoYaw = -k * PASSO;
      destino.current = null;
      formadoRef.current = true;
      frente.current = -1; // força posicionar() a publicar o card da frente
      // Seção enquadrada na tela inteira (o cabeçalho recolhe), como na chegada rolando.
      const sec = secao.current;
      if (sec) window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
    }
    medir();
    posicionar();
    acordar.current();
  }, [medir, posicionar]);

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

  // Laço de animação: só roda com o palco na tela. Com movimento reduzido e o
  // anel parado ele dorme, e `acordar` o religa na próxima interação.
  useEffect(() => {
    if (!visivel) return;
    const s = st.current;
    if (s.voo < 0) {
      s.nuvem = Array.from({ length: N }, () => ({ espalha: Math.random() - 0.5, giro: (Math.random() - 0.5) * 110 }));
      s.voo = reduce ? ENTRADA_MS : 0;
    }
    let raf = 0;
    let ultimo = 0;
    let ultimaChave = NaN;
    const tick = (agora: number) => {
      const dt = Math.min(agora - ultimo, 50);
      ultimo = agora;
      if (!document.hidden) {
        s.voo += dt;
        if (s.foco && s.foco.t0 < 0) s.foco.t0 = agora;
        const livre = !s.arrastando && !s.foco;
        if (s.pausa > 0) s.pausa -= dt;
        else if (!reduce && livre) s.angulo -= dt * GIRO_AUTO;
        girarAteAlvo(s, dt / 1000, livre);
        // Anel parado (movimento reduzido, pausa da volta): nada a recalcular.
        const chave = s.angulo + s.yaw;
        const animando = s.voo < ENTRADA_MS + 100 || s.foco !== null;
        if (animando || chave !== ultimaChave) posicionar(agora);
        ultimaChave = chave;
        if (!formadoRef.current && s.voo >= ENTRADA_MS) {
          formadoRef.current = true;
          setFormado(true);
        }
        const parado = reduce && !animando && !s.arrastando && s.pausa <= 0 && s.inercia === 0 && s.velYaw === 0 && s.yaw === s.alvoYaw;
        if (parado) {
          raf = 0;
          return;
        }
      }
      raf = requestAnimationFrame(tick);
    };
    acordar.current = () => {
      if (raf) return;
      ultimo = performance.now();
      raf = requestAnimationFrame(tick);
    };
    acordar.current();
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      acordar.current = () => {};
    };
  }, [visivel, reduce, posicionar]);

  // Scroll horizontal do trackpad gira; a roda vertical continua rolando a página.
  useEffect(() => {
    const el = palco.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || Math.abs(e.deltaY) >= Math.abs(e.deltaX) || st.current.foco) return;
      e.preventDefault();
      destino.current = null;
      st.current.alvoYaw -= e.deltaX * 0.1;
      limitarAtraso(st.current);
      acordar.current();
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  /** Gira até o card `alvo` ficar na frente, pelo caminho mais curto. */
  const trazerParaFrente = (alvo: number) => {
    const s = st.current;
    alvo = ((alvo % N) + N) % N;
    destino.current = alvo;
    s.inercia = 0;
    const atual = s.angulo + s.alvoYaw;
    let desejado = -alvo * PASSO;
    desejado += Math.round((atual - desejado) / 360) * 360;
    s.alvoYaw = desejado - s.angulo;
    acordar.current();
  };

  // Toques seguidos nas setas do teclado somam: se ainda está girando até um destino,
  // o próximo passo parte dele — mas sem passar de SETAS_MAX cards além do da
  // frente, para a seta segurada não deixar o anel girando sozinho depois.
  const vizinho = (dir: 1 | -1) => {
    const s = st.current;
    if (s.foco) return;
    const girando = destino.current !== null && Math.abs(s.alvoYaw - s.yaw) > 2;
    const base = girando ? destino.current! : frente.current;
    const passos = clamp(passosAte(frente.current, base) + dir, -SETAS_MAX, SETAS_MAX);
    trazerParaFrente(frente.current + passos);
  };

  // Plano B de abrir(): se o router.push não completar (servidor fora do ar,
  // rota com erro), a home não pode ficar travada no foco.
  const reserva = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(reserva.current), []);

  const navegar = (url: string) => {
    const origem = window.location.pathname;
    router.push(url, { transitionTypes: ["abrir-projeto"] });
    window.clearTimeout(reserva.current);
    reserva.current = window.setTimeout(() => {
      if (window.location.pathname !== origem) return; // a navegação aconteceu
      st.current.foco = null; // os cards voltam
      posicionar();
      acordar.current();
      window.location.assign(url);
    }, RESERVA_MS);
  };

  /** Abre o estudo de caso: foco (350 ms na home) e depois navega com o morph. */
  const abrir = (card: number) => {
    const s = st.current;
    if (s.foco) return;
    const url = `/solucoes/${solucoes[card].slug}`;
    if (reduce) {
      navegar(url);
      return;
    }
    trazerParaFrente(card);
    s.foco = { card, t0: -1 };
    window.setTimeout(() => {
      s.yaw = s.alvoYaw; // alinhamento exato: rotateY(0) no card clicado
      posicionar();
      navegar(url);
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
    ponteiro.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, t: e.timeStamp, tReal: performance.now(), moveu: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const p = ponteiro.current;
    if (!p || p.id !== e.pointerId) return;
    const s = st.current;
    if (!p.moveu) {
      if (Math.hypot(e.clientX - p.x0, e.clientY - p.y0) <= 5) return;
      // Vira arrasto: o usuário assume o giro. `p.t` continua no pointerdown,
      // para a velocidade do 1º movimento ser medida no tempo que ele levou.
      p.moveu = true;
      s.arrastando = true;
      s.inercia = 0;
      destino.current = null;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const dx = e.clientX - p.x;
    const dtEvento = Math.max(8, e.timeStamp - p.t);
    p.x = e.clientX;
    p.t = e.timeStamp;
    p.tReal = performance.now();
    s.alvoYaw += dx * GRAUS_POR_PX;
    limitarAtraso(s);
    // Velocidade do arremesso (graus/s), suavizada e limitada ao teto.
    const instantanea = ((dx * GRAUS_POR_PX) / dtEvento) * 1000;
    s.inercia = clamp(mix(s.inercia, instantanea, 0.5), -VEL_MAX, VEL_MAX);
    acordar.current();
  };
  const soltar = () => {
    const p = ponteiro.current;
    // Soltou com o ponteiro já parado: sem inércia.
    if (p?.moveu && performance.now() - p.tReal > 80) st.current.inercia = 0;
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
    <section
      ref={secao}
      id="solucoes"
      aria-roledescription="carrossel"
      aria-label="Soluções"
      className="relative flex h-[max(32rem,100svh)] flex-col overflow-hidden text-paper"
      style={{ background: FUNDO }}
      onKeyDown={onKey}
    >
      {/* Luz de palco atrás do anel. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 55% 50% at 50% 52%, ${LUZ_PALCO}, transparent 75%)` }}
      />

      {/* A seção ocupa a tela inteira (o cabeçalho do site recolhe enquanto ela
          cobre o topo): título em cima, projeto embaixo e o anel com a altura
          que sobrar. */}
      {/* Cabeçalho dentro do palco, logo acima do anel. */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] shrink-0 flex-col gap-4 px-5 pt-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6 md:px-10 md:pt-12">
        <div>
          <Label className="whitespace-nowrap text-paper/45">({String(n).padStart(2, "0")}) problema → solução</Label>
          <h2 className="mt-2 font-serif text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9]">
            <Lines lines={["Soluções"]} />
          </h2>
        </div>
        <span className="pb-1 font-mono text-sm whitespace-nowrap tabular-nums" aria-hidden>
          <span className="text-[#e0764f]">{String(ativo + 1).padStart(2, "0")}</span>
          <span className="text-paper/40"> / {String(n).padStart(2, "0")}</span>
        </span>
      </div>

      <div
        ref={palco}
        className="relative -mt-4 min-h-0 flex-1 cursor-grab select-none active:cursor-grabbing"
        style={{ perspective: `${PERSPECTIVA}px`, touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onLostPointerCapture={soltar}
      >
        <div ref={anel} className="absolute inset-0" style={{ transformStyle: "preserve-3d", transform: `rotateX(${INCLINACAO}deg)` }}>
          {CARDS.map((i) => {
            const s = solucoes[i];
            return (
              <Link
                key={i}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                href={`/solucoes/${s.slug}`}
                draggable={false}
                // Conteúdo completo do projeto antes do clique (a página é
                // estática): o morph não espera a rede.
                prefetch={true}
                aria-label={`${s.nome} — abrir estudo de caso`}
                onClick={(e) => onCardClick(e, i)}
                onFocus={(e) => onCardFocus(e, i)}
                className="absolute top-1/2 left-1/2 block w-[180px] rounded-xl outline-none will-change-transform focus-visible:ring-2 focus-visible:ring-rust"
                style={{ visibility: "hidden", transformStyle: "preserve-3d" }}
              >
                {/* Destaque da frente: brilho quente que nasce na borda do card
                    (só a opacidade muda por quadro; a sombra em si é fixa). */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-xl backface-hidden"
                  style={{
                    boxShadow: "0 0 18px 1px rgb(236 140 98 / 0.4), 0 0 48px 6px rgb(224 118 79 / 0.14)",
                    opacity: "calc(var(--frente, 0) * var(--visivel, 0))",
                    transform: "translateZ(-2px)",
                  }}
                />
                {/* Frente: vira a capa no estudo de caso. Todo card fica sempre
                    dentro do mesmo <ViewTransition> e só o nome muda: o da
                    frente se chama capa-…; os outros ficam sem nome e somem e
                    aparecem junto com a home. */}
                <ViewTransition name={animar && formado && i === ativo ? `capa-${s.slug}` : "auto"} share="morph" default="none">
                  <span
                    ref={(el) => {
                      frentes.current[i] = el;
                    }}
                    className="relative block aspect-[16/10] w-full overflow-hidden rounded-xl border border-paper/10 bg-paper-2 shadow-[0_30px_60px_-25px_rgb(0_0_0/0.8)] backface-hidden"
                  >
                    <VisualSolucao visual={s.visual} className="pointer-events-none block h-full w-full" />
                    {/* Escurece na cor do palco quanto mais para trás. */}
                    <span aria-hidden className="pointer-events-none absolute inset-0" style={{ background: FUNDO, opacity: "var(--escuro, 0)" }} />
                    {/* Luz de cima sobre a face e um filete de luz na borda. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-xl"
                      style={{
                        background: "linear-gradient(180deg, rgb(255 236 214 / 0.28), transparent 45%)",
                        boxShadow: "inset 0 0 0 1.5px rgb(245 172 136 / 0.85)",
                        mixBlendMode: "soft-light",
                        opacity: "var(--frente, 0)",
                      }}
                    />
                  </span>
                </ViewTransition>
                {/* Verso: já virado 180°, lê direito quando o card está de costas. */}
                <span
                  ref={(el) => {
                    versos.current[i] = el;
                  }}
                  aria-hidden
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-paper/10 backface-hidden"
                  style={{ transform: "rotateY(180deg)", background: "rgb(255 255 255 / 0.04)" }}
                >
                  <span className="font-mono text-xs tracking-widest text-[#e0764f]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="px-6 text-center font-serif text-[clamp(1.1rem,2vw,1.75rem)] leading-tight text-paper/60">{s.nome}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Projeto da frente, colado no anel. Paleta de areia sobre o marrom:
          caramelo no rótulo, creme no nome, areia na descrição, cobre no link. */}
      <div className="relative z-10 mx-auto mt-6 grid w-full max-w-xl shrink-0 px-5 pb-8 text-center md:pb-10">
        {/* Cópias invisíveis dos cinco textos no mesmo lugar: o bloco fica com a
            altura do maior, então o palco — e o anel — não mudam de tamanho ao
            trocar de projeto, em nenhuma largura de tela. */}
        {solucoes.map((p) => (
          <div key={p.slug} aria-hidden className="invisible [grid-area:1/1]">
            <Label>{p.contexto}</Label>
            <p className={CL_NOME}>
              <span className="inline-block">{p.nome}</span>
            </p>
            <p className={CL_DESCRICAO}>{p.problemaCurto}</p>
            <span className={CL_LINK}>
              Ver estudo de caso <ArrowUpRight className="size-4" />
            </span>
          </div>
        ))}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            className="[grid-area:1/1]"
            key={sol.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
          >
            <Label className="text-[#c49a74]">{sol.contexto}</Label>
            <h3 className={`${CL_NOME} text-[#f3e3cc]`}>
              {animar ? (
                <ViewTransition name={`titulo-${sol.slug}`} share="morph" default="none">
                  <span className="inline-block">{sol.nome}</span>
                </ViewTransition>
              ) : (
                <span className="inline-block">{sol.nome}</span>
              )}
            </h3>
            <p className={`${CL_DESCRICAO} text-[#d4bea3]`}>{sol.problemaCurto}</p>
            <Link
              href={`/solucoes/${sol.slug}`}
              prefetch={true}
              onClick={(e) => {
                if (novaAba(e)) return;
                e.preventDefault();
                abrir(frente.current);
              }}
              className={`${CL_LINK} text-[#e9a77f]`}
            >
              <span className="link-line">Ver estudo de caso</span>
              <ArrowUpRight className="size-4 text-[#e0764f]" />
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
