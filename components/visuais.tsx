import type { StaticImageData } from "next/image";
import type { Visual } from "@/content/perfil";
import cultiva960 from "@/content/capturas/cultiva-horta-960.webp";
import cultiva1280 from "@/content/capturas/cultiva-horta-1280.webp";
import cultiva1440 from "@/content/capturas/cultiva-horta-1440.webp";
import dashboard960 from "@/content/capturas/dashboard-suporte-960.webp";
import dashboard1280 from "@/content/capturas/dashboard-suporte-1280.webp";
import dashboard1440 from "@/content/capturas/dashboard-suporte-1440.webp";
import viaja960 from "@/content/capturas/viaja-mais-960.webp";
import viaja1280 from "@/content/capturas/viaja-mais-1280.webp";
import viaja1440 from "@/content/capturas/viaja-mais-1440.webp";
import pesquisa960 from "@/content/capturas/pesquisa-capa-960.webp";
import pesquisa1280 from "@/content/capturas/pesquisa-capa-1280.webp";
import pesquisa1440 from "@/content/capturas/pesquisa-capa-1440.webp";
import park960 from "@/content/capturas/park-capa-960.webp";
import park1280 from "@/content/capturas/park-capa-1280.webp";
import park1440 from "@/content/capturas/park-capa-1440.webp";
import parkArq960 from "@/content/capturas/park-arquitetura-960.webp";
import parkArq1280 from "@/content/capturas/park-arquitetura-1280.webp";
import parkArq1440 from "@/content/capturas/park-arquitetura-1440.webp";

// Imagem de cada solução no card do anel e na capa do estudo de caso. Todas
// usam capturas ou artes (abaixo); só a capa da pesquisa é uma ilustração em
// SVG, desenhada com a paleta do site.

/** Capturas reais (16:10), em três larguras, da menor para a maior. Aparecem no
 *  card do anel e na capa do estudo de caso — menos as `soCard`, que ficam só
 *  no card (a capa do estudo de caso continua com a ilustração). */
const capturas: Partial<Record<Visual, { versoes: StaticImageData[]; alt: string; legenda?: string; soCard?: boolean }>> = {
  // REVISAO[ADV-20261030-2152-05] info — a captura mostra "Início 01/12/2026" e "Dia 160 · 01 de dez. de 2026" ao mesmo tempo → .claude/revisoes/2026-10-30-2152-adversarial.md
  cultiva: {
    versoes: [cultiva960, cultiva1280, cultiva1440],
    alt: "O Cultiva num monitor, com o planejador da horta, e num celular, com as ferramentas e o painel de ambiente e clima, entre legumes ilustrados.",
    legenda: "Telas reais do Cultiva no computador e no celular, com uma horta de demonstração e clima real de Anápolis.",
  },
  dashboard: {
    versoes: [dashboard960, dashboard1280, dashboard1440],
    alt: "O título “Suporte Inteligente — Dados estratégicos para o desenvolvimento do seu negócio” ao lado de um tablet com o painel de chamados: indicadores no topo, gráfico de status dos chamados e chamados por empresa.",
    legenda: "Arte de apresentação do Dashboard de Suporte, com o painel de chamados num tablet.",
  },
  viaja: {
    versoes: [viaja960, viaja1280, viaja1440],
    alt: "A marca avori com a frase “Para experiências inesquecíveis”, em fundo verde-escuro, ao lado de um celular com a página de uma viagem no aplicativo: Férias, em Brasília, com o selo Planejando e os botões Editor e Publicar.",
    legenda: "Arte de apresentação da Avori, com a página de uma viagem num celular.",
  },
  pesquisa: {
    versoes: [pesquisa960, pesquisa1280, pesquisa1440],
    alt: "Arte da pesquisa em fundo vinho: o título “Ganhos e perdas do desenvolvimento em código de máquina” e o subtítulo, ao lado de um bloco de código que, com a IA, vira um bloco de bits.",
    soCard: true,
  },
  park: {
    versoes: [park960, park1280, park1440],
    alt: "Arte da Demo Park API em fundo preto: o título “API REST — Controle de Estacionamento” ao lado de um servidor ligado a vagas, carros e cancelas por setas com os métodos POST, GET, PUT e DELETE.",
    soCard: true,
  },
};

/** Imagens só da capa do estudo de caso (16:10), quando ela é diferente do card. */
const capas: Partial<Record<Visual, { versoes: StaticImageData[]; alt: string; legenda: string }>> = {
  park: {
    versoes: [parkArq960, parkArq1280, parkArq1440],
    alt: "Diagrama das camadas da Demo Park API: a requisição do cliente HTTP passa por CorsFilter, JwtAuthorizationFilter e authorizeHttpRequests, chega a cinco controllers, que chamam sete services, que usam quatro repositórios JPA sobre MySQL; o JasperService acessa o MySQL direto via JDBC. Exceções vão para o ApiExceptionHandler, que devolve JSON de erro, e requisições sem token recebem 401 pelo EntryPoint.",
    legenda: "Visão geral das camadas da API: segurança JWT, controllers, services, repositórios e banco.",
  },
};

/**
 * Largura em que a captura aparece na capa do estudo de caso (a maior das duas):
 * no celular, a tela menos as margens (px-5 + px-4 + borda); a partir de md,
 * até 896 px (max-w-4xl) menos as margens (px-10 + px-16 + borda). O card do
 * anel nunca passa disso, então usa a mesma conta — e pede o mesmo arquivo.
 */
const SIZES_CAPTURA = "(max-width: 767px) calc(100vw - 74px), min(896px, calc(100vw - 210px))";

/** Ilustrações que não são de uma interface: legenda e texto alternativo próprios. */
const ilustracoes: Partial<Record<Visual, { alt: string; legenda: string }>> = {
  pesquisa: {
    alt: "A mesma instrução em três níveis: a += b em C, add eax, ebx em assembly e os bytes 01 D8 em código de máquina; uma seta tracejada sai da IA direto para o binário, com a pergunta “direto ao binário?”.",
    legenda: "A mesma instrução em três níveis: C, assembly e código de máquina.",
  },
};

/** Legenda da capa: diz se a imagem é uma captura real ou uma ilustração. */
export function legendaVisual(visual: Visual) {
  const captura = capturas[visual];
  return (
    capas[visual]?.legenda ??
    (captura && !captura.soCard ? captura.legenda : undefined) ??
    ilustracoes[visual]?.legenda ??
    "Ilustração esquemática da interface."
  );
}

const INK = "var(--ink)";
const RUST = "var(--rust)";
const PAPER = "var(--paper)";
const LINE = "rgb(20 20 19 / 0.14)";

/** A mesma instrução em três níveis (C, assembly x86-64 e os bytes reais dela,
 *  01 D8) e a IA indo direto ao binário: a pergunta da pesquisa. */
function Pesquisa() {
  const MONO = { fontFamily: "var(--font-geist-mono)" };
  const camadas = [
    { y: 92, rotulo: "alto nível · C", codigo: "a += b;" },
    { y: 208, rotulo: "assembly · x86-64", codigo: "add eax, ebx" },
    { y: 324, rotulo: "código de máquina", codigo: "01 D8", bits: "00000001 11011000" },
  ];
  return (
    <g>
      <rect width="800" height="500" fill={PAPER} />
      {camadas.map((c) => (
        <g key={c.rotulo} transform={`translate(56 ${c.y})`}>
          <rect width="470" height="92" rx="12" fill={c.bits ? "rgb(180 68 31 / 0.07)" : "var(--paper-2)"} stroke={c.bits ? "rgb(180 68 31 / 0.45)" : LINE} />
          <text x="24" y="28" fontSize="13" letterSpacing="1.8" fill="var(--muted)" style={MONO}>
            {c.rotulo.toUpperCase()}
          </text>
          <text x="24" y={c.bits ? 64 : 72} fontSize="34" fill={c.bits ? RUST : INK} style={MONO}>
            {c.codigo}
          </text>
          {c.bits && (
            <text x="24" y="83" fontSize="14" letterSpacing="1" fill="var(--muted)" style={MONO}>
              {c.bits}
            </text>
          )}
        </g>
      ))}
      {[
        { y: 186, t: "compilador" },
        { y: 302, t: "montador" },
      ].map((s) => (
        <g key={s.t} transform={`translate(96 ${s.y})`}>
          <line x1="0" x2="0" y1="0" y2="20" stroke="var(--ink-soft)" strokeWidth="1.5" />
          <path d="M-5 14 L0 20 L5 14" fill="none" stroke="var(--ink-soft)" strokeWidth="1.5" />
          <text x="14" y="15" fontSize="12" fill="var(--ink-soft)" style={MONO}>
            {s.t}
          </text>
        </g>
      ))}
      <circle cx="636" cy="138" r="34" fill={RUST} />
      <text x="636" y="147" fontSize="24" textAnchor="middle" fill={PAPER} style={MONO}>
        IA
      </text>
      <path d="M636 174 C 650 270, 630 340, 538 372" fill="none" stroke={RUST} strokeWidth="2" strokeDasharray="7 6" />
      <path d="M549 361 L537 372 L552 376" fill="none" stroke={RUST} strokeWidth="2" />
      <text fontSize="28" fill={RUST} style={{ fontFamily: "var(--font-instrument-serif)", fontStyle: "italic" }}>
        <tspan x="664" y="262">
          direto ao
        </tspan>
        <tspan x="664" dy="30">
          binário?
        </tspan>
      </text>
    </g>
  );
}

export function VisualSolucao({ visual, className, destaque = false }: { visual: Visual; className?: string; destaque?: boolean }) {
  // `destaque` = capa do estudo de caso: usa a imagem própria da capa, se houver;
  // as capturas `soCard` não vão para lá.
  const captura = (destaque && capas[visual]) || capturas[visual];
  if (captura && !("soCard" in captura && captura.soCard && destaque)) {
    // REVISAO[OTM-20261030-2152-04] info — as 10 fatias dividem 1 decodificação (3,3 MB + 4,4 MB na GPU, upload 3,5 ms uma vez, sem custo por quadro); arquivo só do anel pouparia ~6,8 MB mas tiraria a capa do cache no morph → .claude/revisoes/2026-10-30-2152-otimizacao.md
    // Sem otimização: o card e a capa pedem o mesmo arquivo, então no morph
    // capa-… a imagem da página nova já está baixada e decodificada.
    // `destaque` = capa do estudo de caso, acima da dobra.
    // REVISAO[ADV-20261030-2152-02] baixa — alt descritivo repetido nas 10 fatias do card do anel (o link já tem aria-label); falta um modo decorativo (alt="") → .claude/revisoes/2026-10-30-2152-adversarial.md
    const maior = captura.versoes.at(-1)!;
    return (
      // Um <img> à mão em vez de next/image: as versões já vêm prontas, e o
      // srcSet/sizes é o mesmo no card e na capa — cada aparelho baixa uma
      // versão só (960 px num celular), e o morph a reaproveita.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={maior.src}
        srcSet={captura.versoes.map((v) => `${v.src} ${v.width}w`).join(", ")}
        sizes={SIZES_CAPTURA}
        width={maior.width}
        height={maior.height}
        alt={captura.alt}
        draggable={false}
        decoding="async"
        loading={destaque ? "eager" : "lazy"}
        fetchPriority={destaque ? "high" : undefined}
        className={`object-cover ${className ?? ""}`}
      />
    );
  }
  // Sem captura para este lugar: a ilustração em SVG (hoje, só a da pesquisa).
  return (
    <svg viewBox="0 0 800 500" className={className} role="img" aria-label={ilustracoes[visual]?.alt ?? "Ilustração esquemática da solução"}>
      {visual === "pesquisa" && <Pesquisa />}
    </svg>
  );
}
