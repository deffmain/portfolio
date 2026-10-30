// Laço de animação para fundos em canvas: acompanha o ponteiro (mouse, toque
// e também a rolagem — com o cursor parado, a seção passa por baixo dele),
// mede a área e só anima com a área visível e a aba ativa. Quem pede menos
// movimento recebe um único quadro estático.

export type Ponteiro = {
  x: number;
  y: number;
  /** O ponteiro está sobre a área. */
  ativo: boolean;
  /** Veio de um mouse ou toque de verdade (e não do cursor fantasma do celular). */
  real: boolean;
  /** Velocidade suavizada, em px/ms. */
  vel: number;
};

export type Laco = {
  /** Tamanho da área em px CSS e a densidade de pixels já limitada. */
  medir(w: number, h: number, dpr: number): void;
  /** Um quadro (dt em ms). Devolva false para dormir até o ponteiro mexer de novo. */
  quadro(dt: number, t: number, p: Ponteiro): boolean | void;
  /** O ponteiro mudou de lugar (movimento, rolagem, toque que terminou). */
  aoMover?(p: Ponteiro): void;
};

export function iniciarLaco(area: HTMLElement, laco: Laco, { dprMax = 2 } = {}) {
  const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const semHover = matchMedia("(hover: none)").matches;
  const p: Ponteiro = { x: -1e4, y: -1e4, ativo: false, real: false, vel: 0 };
  let cx = 0;
  let cy = 0;
  let temPonteiro = false;
  let ultimoToque = -1e9;
  let raf = 0;
  let visivel = false;
  let ultimo = 0;
  let t = 0;
  let w = 0;
  let h = 0;

  const relativo = () => {
    if (!temPonteiro) return;
    const r = area.getBoundingClientRect();
    p.x = cx - r.left;
    p.y = cy - r.top;
    p.ativo = p.x >= 0 && p.y >= 0 && p.x <= r.width && p.y <= r.height;
    laco.aoMover?.(p);
  };

  const tick = (agora: number) => {
    raf = requestAnimationFrame(tick);
    const dt = Math.min(agora - ultimo, 50);
    ultimo = agora;
    t += dt;
    const [ax, ay] = [p.x, p.y];
    // No celular, sem toque recente, um "cursor fantasma" passeia sozinho —
    // só pelo trecho da área que está na tela.
    if (semHover && !p.real && t - ultimoToque > 2500) {
      const r = area.getBoundingClientRect();
      const topo = Math.min(h, Math.max(0, -r.top));
      const base = Math.min(h, Math.max(0, window.innerHeight - r.top));
      p.x = w * (0.5 + 0.38 * Math.sin(t * 0.00037));
      p.y = topo + (base - topo) * (0.5 + 0.36 * Math.sin(t * 0.00023 + 1.3));
      p.ativo = true;
    }
    const v = dt > 0 ? Math.hypot(p.x - ax, p.y - ay) / dt : 0;
    p.vel += (Math.min(v, 5) - p.vel) * 0.25;
    if (laco.quadro(dt, t, p) === false && !semHover) parar();
  };
  const iniciar = () => {
    if (raf || reduz || !visivel || document.hidden) return;
    ultimo = performance.now();
    raf = requestAnimationFrame(tick);
  };
  const parar = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const medir = () => {
    const r = area.getBoundingClientRect();
    w = r.width;
    h = r.height;
    laco.medir(w, h, Math.min(window.devicePixelRatio || 1, dprMax));
    if (reduz) laco.quadro(16, 0, p); // quadro estático
    else iniciar();
  };

  const mover = (e: PointerEvent) => {
    cx = e.clientX;
    cy = e.clientY;
    temPonteiro = true;
    p.real = true;
    if (e.pointerType !== "mouse") ultimoToque = t;
    relativo();
    iniciar();
  };
  const soltar = (e: PointerEvent) => {
    if (e.pointerType === "mouse") return;
    // O dedo saiu da tela: o toque deixa de valer como ponteiro.
    ultimoToque = t;
    p.real = false;
    p.ativo = false;
    laco.aoMover?.(p);
  };
  const sair = () => {
    p.ativo = false;
    laco.aoMover?.(p);
  };
  const rolar = () => {
    relativo();
    iniciar();
  };
  const aba = () => (document.hidden ? parar() : iniciar());

  const ro = new ResizeObserver(medir);
  ro.observe(area);
  const io = new IntersectionObserver(([e]) => {
    visivel = e.isIntersecting;
    if (visivel) iniciar();
    else parar();
  });
  io.observe(area);
  window.addEventListener("pointermove", mover, { passive: true });
  window.addEventListener("pointerdown", mover, { passive: true });
  window.addEventListener("pointerup", soltar, { passive: true });
  window.addEventListener("pointercancel", soltar, { passive: true });
  area.addEventListener("pointerleave", sair);
  window.addEventListener("scroll", rolar, { passive: true });
  document.addEventListener("visibilitychange", aba);

  return () => {
    parar();
    ro.disconnect();
    io.disconnect();
    window.removeEventListener("pointermove", mover);
    window.removeEventListener("pointerdown", mover);
    window.removeEventListener("pointerup", soltar);
    window.removeEventListener("pointercancel", soltar);
    area.removeEventListener("pointerleave", sair);
    window.removeEventListener("scroll", rolar);
    document.removeEventListener("visibilitychange", aba);
  };
}

/** Ajusta o canvas à área e à densidade de pixels; desenha em px CSS. */
export function ajustarCanvas(canvas: HTMLCanvasElement, w: number, h: number, dpr: number) {
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
}
