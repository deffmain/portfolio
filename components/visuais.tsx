import type { Visual } from "@/content/perfil";

// Composições ilustrativas de cada solução, desenhadas em SVG com a paleta do
// site. São esquemáticas de propósito (sem dados reais); podem ser trocadas
// por capturas de tela das aplicações.

const INK = "var(--ink)";
const RUST = "var(--rust)";
const PAPER = "var(--paper)";
const LINE = "rgb(20 20 19 / 0.14)";
const SOFT = "rgb(20 20 19 / 0.06)";

function Janela({ children, titulo }: { children: React.ReactNode; titulo: string }) {
  return (
    <g>
      <rect x="40" y="36" width="720" height="428" rx="14" fill={PAPER} stroke={LINE} />
      <line x1="40" x2="760" y1="74" y2="74" stroke={LINE} />
      {[64, 80, 96].map((x) => (
        <circle key={x} cx={x} cy="55" r="4.5" fill={LINE} />
      ))}
      <text x="400" y="59" textAnchor="middle" fontSize="11" fill="rgb(20 20 19 / 0.5)" style={{ fontFamily: "var(--font-geist-mono)" }}>
        {titulo}
      </text>
      {children}
    </g>
  );
}

function Dashboard() {
  const barras = [0.92, 0.74, 0.61, 0.48, 0.4, 0.31, 0.22];
  return (
    <Janela titulo="suporte / dashboard">
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${64 + i * 172} 96)`}>
          <rect width="156" height="78" rx="8" fill={i === 0 ? INK : SOFT} />
          <rect x="14" y="16" width="56" height="6" rx="3" fill={i === 0 ? "rgb(242 239 232 / 0.45)" : LINE} />
          <rect x="14" y="36" width={[72, 54, 88, 40][i]} height="24" rx="4" fill={i === 0 ? PAPER : INK} />
        </g>
      ))}
      <g transform="translate(64 196)">
        <rect width="330" height="244" rx="8" fill="none" stroke={LINE} />
        <rect x="18" y="18" width="110" height="6" rx="3" fill={LINE} />
        {barras.map((b, i) => (
          <g key={i} transform={`translate(18 ${46 + i * 27})`}>
            <rect width="54" height="6" y="5" rx="3" fill={LINE} />
            <rect x="70" width={b * 220} height="16" rx="3" fill={i === 0 ? RUST : INK} opacity={i === 0 ? 1 : 0.82 - i * 0.08} />
          </g>
        ))}
      </g>
      <g transform="translate(410 196)">
        <rect width="326" height="112" rx="8" fill="none" stroke={LINE} />
        <rect x="18" y="16" width="120" height="6" rx="3" fill={LINE} />
        <path d="M18 92 C60 80 80 50 120 58 S190 88 230 52 S290 30 308 36" fill="none" stroke={INK} strokeWidth="2" />
        <path d="M18 92 C60 80 80 50 120 58 S190 88 230 52 S290 30 308 36 V96 H18 Z" fill={SOFT} />
        <circle cx="230" cy="52" r="5" fill={RUST} />
      </g>
      <g transform="translate(410 322)">
        <rect width="326" height="118" rx="8" fill="none" stroke={LINE} />
        <rect x="18" y="16" width="96" height="6" rx="3" fill={LINE} />
        {Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 12 }, (_, c) => {
            const v = ((r * 7 + c * 13) % 10) / 10;
            const quente = (r === 1 && c === 8) || (r === 2 && c === 3);
            return <rect key={`${r}-${c}`} x={18 + c * 25} y={34 + r * 19} width="21" height="15" rx="3" fill={quente ? RUST : INK} opacity={quente ? 1 : 0.06 + v * 0.3} />;
          }),
        )}
      </g>
    </Janela>
  );
}

function Pagina({ x, y, r, capa }: { x: number; y: number; r: number; capa?: boolean }) {
  const TEAL = "#2f6f6b";
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <rect width="236" height="320" rx="4" fill={PAPER} stroke={LINE} />
      {capa ? (
        <>
          <rect width="236" height="120" rx="4" fill={TEAL} />
          <rect x="20" y="70" width="140" height="10" rx="2" fill={PAPER} />
          <rect x="20" y="88" width="96" height="6" rx="2" fill="rgb(242 239 232 / 0.6)" />
          <rect x="20" y="144" width="196" height="96" rx="4" fill={SOFT} stroke={LINE} />
          <rect x="34" y="158" width="168" height="12" rx="2" fill={LINE} />
          <rect x="34" y="178" width="120" height="44" rx="3" fill="rgb(20 20 19 / 0.08)" />
          <rect x="20" y="256" width="150" height="6" rx="2" fill={LINE} />
          <rect x="20" y="270" width="110" height="6" rx="2" fill={LINE} />
          <rect x="0" y="300" width="236" height="20" fill={TEAL} opacity="0.12" />
          <rect x="196" y="306" width="24" height="6" rx="2" fill={TEAL} />
        </>
      ) : (
        <>
          <rect width="236" height="22" rx="4" fill={TEAL} opacity="0.9" />
          {[44, 58, 72].map((yy) => (
            <rect key={yy} x="20" y={yy} width={yy === 72 ? 120 : 196} height="6" rx="2" fill={LINE} />
          ))}
          <rect x="20" y="92" width="196" height="110" rx="4" fill={SOFT} stroke={LINE} />
          <rect x="20" y="218" width="196" height="44" rx="4" fill={TEAL} opacity="0.1" />
          <rect x="20" y="218" width="4" height="44" fill={TEAL} />
        </>
      )}
    </g>
  );
}

function Manuais() {
  return (
    <g>
      <Pagina x={170} y={110} r={-8} />
      <Pagina x={300} y={84} r={4} />
      <Pagina x={418} y={96} r={-2} capa />
      <g transform="translate(108 404)">
        {["vendas", "orçamentos", "compras", "permissões", "O.S."].map((t, i) => (
          <g key={t} transform={`translate(${i * 96} 0)`}>
            <rect width="88" height="26" rx="13" fill={i === 0 ? INK : "none"} stroke={i === 0 ? INK : LINE} />
            <text x="44" y="17" textAnchor="middle" fontSize="11" fill={i === 0 ? PAPER : INK} style={{ fontFamily: "var(--font-geist-mono)" }}>
              {t}
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}

function Cultiva() {
  const OLIVE = "#5d6b35";
  return (
    <Janela titulo="cultiva / planejar">
      <g transform="translate(64 96)">
        <rect width="420" height="268" rx="8" fill="#ece5d3" stroke={LINE} />
        {Array.from({ length: 6 }, (_, r) =>
          Array.from({ length: 9 }, (_, c) => {
            const k = (r * 5 + c * 3) % 7;
            return (
              <g key={`${r}-${c}`} transform={`translate(${22 + c * 44} ${20 + r * 41})`}>
                <rect width="40" height="37" rx="5" fill="rgb(93 107 53 / 0.08)" stroke="rgb(93 107 53 / 0.18)" />
                {k < 5 && <circle cx="20" cy="18.5" r={6 + k * 2} fill={k === 2 ? RUST : OLIVE} opacity={k === 2 ? 0.9 : 0.35 + k * 0.1} />}
              </g>
            );
          }),
        )}
      </g>
      <g transform="translate(500 96)">
        <rect width="236" height="268" rx="8" fill="none" stroke={LINE} />
        <rect x="16" y="16" width="90" height="6" rx="3" fill={LINE} />
        {[0.5, 0.65, 0.8, 0.55, 0.4, 0.72, 0.6].map((h, i) => (
          <g key={i} transform={`translate(${18 + i * 30} 40)`}>
            <rect width="22" height="90" rx="11" fill={SOFT} />
            <rect y={90 - h * 90} width="22" height={h * 90} rx="11" fill={i === 1 ? RUST : INK} opacity={i === 1 ? 1 : 0.75} />
          </g>
        ))}
        <rect x="16" y="150" width="204" height="44" rx="6" fill="rgb(180 68 31 / 0.1)" />
        <rect x="16" y="150" width="4" height="44" fill={RUST} />
        <rect x="30" y="162" width="150" height="6" rx="3" fill={RUST} opacity="0.6" />
        <rect x="30" y="176" width="100" height="6" rx="3" fill={RUST} opacity="0.35" />
        {[210, 226, 242].map((yy) => (
          <rect key={yy} x="16" y={yy} width={yy === 242 ? 120 : 204} height="6" rx="3" fill={LINE} />
        ))}
      </g>
      <g transform="translate(64 380)">
        <line x1="0" x2="672" y1="30" y2="30" stroke={LINE} strokeWidth="2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i} transform={`translate(${i * 134} 0)`}>
            <circle cx="0" cy="30" r={i === 2 ? 7 : 5} fill={i <= 2 ? INK : PAPER} stroke={INK} />
            <rect x="-20" y="46" width="40" height="5" rx="2.5" fill={LINE} />
          </g>
        ))}
      </g>
    </Janela>
  );
}

function Viaja() {
  return (
    <g>
      <g transform="translate(120 34)">
        <rect width="236" height="440" rx="30" fill={INK} />
        <rect x="10" y="10" width="216" height="420" rx="22" fill={PAPER} />
        <rect x="88" y="18" width="60" height="8" rx="4" fill={INK} />
        <circle cx="118" cy="92" r="34" fill="rgb(180 68 31 / 0.18)" stroke={RUST} strokeWidth="2" />
        <circle cx="118" cy="84" r="11" fill={RUST} opacity="0.7" />
        <path d="M98 112 C104 98 132 98 138 112" fill={RUST} opacity="0.7" />
        <rect x="74" y="138" width="88" height="8" rx="4" fill={INK} />
        <rect x="88" y="154" width="60" height="6" rx="3" fill={LINE} />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${40 + i * 56} 176)`}>
            <rect x="8" width="24" height="8" rx="3" fill={INK} />
            <rect y="14" width="40" height="5" rx="2.5" fill={LINE} />
          </g>
        ))}
        <rect x="30" y="206" width="176" height="30" rx="15" fill={RUST} />
        <text x="118" y="226" textAnchor="middle" fontSize="12" fill={PAPER} style={{ fontFamily: "var(--font-geist-sans)", fontWeight: 600 }}>
          Seguir
        </text>
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={24 + (i % 3) * 64} y={252 + Math.floor(i / 3) * 70} width="60" height="66" rx="6" fill={i === 1 ? "rgb(180 68 31 / 0.2)" : SOFT} />
        ))}
      </g>
      <g transform="translate(400 96)">
        <rect width="300" height="320" rx="14" fill={PAPER} stroke={LINE} />
        <rect x="22" y="22" width="150" height="10" rx="3" fill={INK} />
        <rect x="22" y="40" width="100" height="6" rx="3" fill={LINE} />
        <line x1="40" x2="40" y1="72" y2="296" stroke={LINE} strokeWidth="2" />
        {[0, 1, 2].map((d) => (
          <g key={d} transform={`translate(0 ${74 + d * 76})`}>
            <circle cx="40" cy="8" r="8" fill={d === 0 ? RUST : PAPER} stroke={d === 0 ? RUST : INK} strokeWidth="1.5" />
            <text x="62" y="12" fontSize="11" fill={RUST} style={{ fontFamily: "var(--font-geist-mono)" }}>
              DIA {d + 1}
            </text>
            <rect x="110" y="3" width={[120, 96, 136][d]} height="9" rx="3" fill={INK} />
            <rect x="62" y="24" width="210" height="6" rx="3" fill={LINE} />
            <rect x="62" y="36" width="160" height="6" rx="3" fill={LINE} />
          </g>
        ))}
      </g>
    </g>
  );
}

function Park() {
  // Mapa de vagas (ocupadas em tinta, a do check-in em ferrugem), recibo do
  // check-out e a linha do tempo entrada → saída.
  const ocupadas = new Set([1, 2, 5, 8, 9, 12, 14]);
  return (
    <Janela titulo="demo-park / api">
      <g transform="translate(64 96)">
        <rect width="420" height="268" rx="8" fill="none" stroke={LINE} />
        <rect x="18" y="16" width="96" height="6" rx="3" fill={LINE} />
        {Array.from({ length: 2 }, (_, fila) =>
          Array.from({ length: 8 }, (_, c) => {
            const n = fila * 8 + c;
            const atual = n === 6;
            const ocupada = ocupadas.has(n);
            return (
              <g key={n} transform={`translate(${22 + c * 49} ${fila === 0 ? 40 : 170})`}>
                <rect width="42" height="74" rx="4" fill={atual ? "rgb(180 68 31 / 0.12)" : "none"} stroke={atual ? RUST : LINE} strokeWidth={atual ? 2 : 1} />
                {(ocupada || atual) && <rect x="9" y="14" width="24" height="44" rx="6" fill={atual ? RUST : INK} opacity={atual ? 1 : 0.75} />}
                <rect x="13" y={fila === 0 ? 64 : 4} width="16" height="4" rx="2" fill={LINE} />
              </g>
            );
          }),
        )}
        <line x1="18" x2="402" y1="134" y2="134" stroke={LINE} strokeDasharray="10 8" strokeWidth="2" />
      </g>
      <g transform="translate(500 96)">
        <rect width="236" height="268" rx="8" fill={PAPER} stroke={LINE} />
        <rect x="18" y="18" width="70" height="7" rx="3" fill={INK} />
        <rect x="18" y="32" width="120" height="5" rx="2.5" fill={LINE} />
        {[60, 84, 108, 132].map((y, k) => (
          <g key={y}>
            <rect x="18" y={y} width={[90, 70, 110, 60][k]} height="6" rx="3" fill={LINE} />
            <rect x={218 - [40, 52, 34, 46][k]} y={y} width={[40, 52, 34, 46][k]} height="6" rx="3" fill={k === 3 ? RUST : LINE} opacity={k === 3 ? 0.7 : 1} />
          </g>
        ))}
        <line x1="18" x2="218" y1="158" y2="158" stroke={LINE} strokeDasharray="4 4" />
        <rect x="18" y="174" width="50" height="7" rx="3" fill={LINE} />
        <rect x="140" y="170" width="78" height="14" rx="3" fill={INK} />
        <rect x="18" y="208" width="200" height="40" rx="6" fill="rgb(180 68 31 / 0.1)" />
        <rect x="18" y="208" width="4" height="40" fill={RUST} />
        <rect x="32" y="220" width="110" height="6" rx="3" fill={RUST} opacity="0.6" />
        <rect x="32" y="232" width="70" height="6" rx="3" fill={RUST} opacity="0.35" />
      </g>
      <g transform="translate(64 380)">
        <line x1="0" x2="672" y1="30" y2="30" stroke={LINE} strokeWidth="2" />
        <line x1="0" x2="470" y1="30" y2="30" stroke={INK} strokeWidth="2" />
        <circle cx="0" cy="30" r="6" fill={INK} />
        <circle cx="470" cy="30" r="7" fill={RUST} />
        <circle cx="672" cy="30" r="5" fill={PAPER} stroke={INK} />
        {[0, 470].map((x) => (
          <rect key={x} x={x - 22} y="46" width="44" height="5" rx="2.5" fill={LINE} />
        ))}
      </g>
    </Janela>
  );
}

export function VisualSolucao({ visual, className }: { visual: Visual; className?: string }) {
  return (
    <svg viewBox="0 0 800 500" className={className} role="img" aria-label="Ilustração esquemática da solução">
      {visual === "dashboard" && <Dashboard />}
      {visual === "manuais" && <Manuais />}
      {visual === "cultiva" && <Cultiva />}
      {visual === "viaja" && <Viaja />}
      {visual === "park" && <Park />}
    </svg>
  );
}
