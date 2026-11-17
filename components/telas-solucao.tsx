import type { StaticImageData } from "next/image";
import type { Solucao, Tela, TelaImagem } from "@/content/perfil";
import { Label } from "@/components/ui";
import { TrilhoTelas } from "@/components/trilho-telas";
import planejador960 from "@/content/capturas/cultiva-planejador-960.webp";
import planejador1280 from "@/content/capturas/cultiva-planejador-1280.webp";
import planejador1440 from "@/content/capturas/cultiva-planejador-1440.webp";
import inspetor480 from "@/content/capturas/cultiva-inspetor-480.webp";
import inspetor720 from "@/content/capturas/cultiva-inspetor-720.webp";
import inspetor960 from "@/content/capturas/cultiva-inspetor-960.webp";
import solo345 from "@/content/capturas/cultiva-solo-345.webp";
import solo518 from "@/content/capturas/cultiva-solo-518.webp";
import solo690 from "@/content/capturas/cultiva-solo-690.webp";
import clima960 from "@/content/capturas/cultiva-clima-960.webp";
import clima1280 from "@/content/capturas/cultiva-clima-1280.webp";
import clima1440 from "@/content/capturas/cultiva-clima-1440.webp";
import guia960 from "@/content/capturas/cultiva-guia-960.webp";
import guia1280 from "@/content/capturas/cultiva-guia-1280.webp";
import guia1440 from "@/content/capturas/cultiva-guia-1440.webp";
import conceitos960 from "@/content/capturas/cultiva-conceitos-960.webp";
import conceitos1280 from "@/content/capturas/cultiva-conceitos-1280.webp";
import conceitos1440 from "@/content/capturas/cultiva-conceitos-1440.webp";
import viajaRoteiro960 from "@/content/capturas/viaja-roteiro-960.webp";
import viajaRoteiro1280 from "@/content/capturas/viaja-roteiro-1280.webp";
import viajaRoteiro1440 from "@/content/capturas/viaja-roteiro-1440.webp";
import viajaFeed960 from "@/content/capturas/viaja-feed-960.webp";
import viajaFeed1280 from "@/content/capturas/viaja-feed-1280.webp";
import viajaFeed1440 from "@/content/capturas/viaja-feed-1440.webp";
import viajaBusca960 from "@/content/capturas/viaja-busca-960.webp";
import viajaBusca1280 from "@/content/capturas/viaja-busca-1280.webp";
import viajaBusca1440 from "@/content/capturas/viaja-busca-1440.webp";
import viajaPrivado960 from "@/content/capturas/viaja-privado-960.webp";
import viajaPrivado1280 from "@/content/capturas/viaja-privado-1280.webp";
import viajaPrivado1440 from "@/content/capturas/viaja-privado-1440.webp";
import viajaSolicitacoes960 from "@/content/capturas/viaja-solicitacoes-960.webp";
import viajaSolicitacoes1280 from "@/content/capturas/viaja-solicitacoes-1280.webp";
import viajaSolicitacoes1440 from "@/content/capturas/viaja-solicitacoes-1440.webp";
import viajaFoto576 from "@/content/capturas/viaja-foto-576.webp";
import viajaFoto864 from "@/content/capturas/viaja-foto-864.webp";
import viajaFoto1152 from "@/content/capturas/viaja-foto-1152.webp";
import viajaPerfil960 from "@/content/capturas/viaja-perfil-960.webp";
import viajaPerfil1280 from "@/content/capturas/viaja-perfil-1280.webp";
import viajaPerfil1440 from "@/content/capturas/viaja-perfil-1440.webp";
import viajaViagens960 from "@/content/capturas/viaja-viagens-960.webp";
import viajaViagens1280 from "@/content/capturas/viaja-viagens-1280.webp";
import viajaViagens1440 from "@/content/capturas/viaja-viagens-1440.webp";
import viajaViagem960 from "@/content/capturas/viaja-viagem-960.webp";
import viajaViagem1280 from "@/content/capturas/viaja-viagem-1280.webp";
import viajaViagem1440 from "@/content/capturas/viaja-viagem-1440.webp";
import viajaAcerto960 from "@/content/capturas/viaja-acerto-960.webp";
import viajaAcerto1280 from "@/content/capturas/viaja-acerto-1280.webp";
import viajaAcerto1440 from "@/content/capturas/viaja-acerto-1440.webp";

/** Capturas em três larguras, da menor para a maior: telas em 16:10; painéis no formato próprio, com cantos transparentes. */
const versoes: Record<TelaImagem, StaticImageData[]> = {
  "cultiva-planejador": [planejador960, planejador1280, planejador1440],
  "cultiva-inspetor": [inspetor480, inspetor720, inspetor960],
  "cultiva-solo": [solo345, solo518, solo690],
  "cultiva-clima": [clima960, clima1280, clima1440],
  "cultiva-guia": [guia960, guia1280, guia1440],
  "cultiva-conceitos": [conceitos960, conceitos1280, conceitos1440],
  "viaja-roteiro": [viajaRoteiro960, viajaRoteiro1280, viajaRoteiro1440],
  "viaja-feed": [viajaFeed960, viajaFeed1280, viajaFeed1440],
  "viaja-busca": [viajaBusca960, viajaBusca1280, viajaBusca1440],
  "viaja-privado": [viajaPrivado960, viajaPrivado1280, viajaPrivado1440],
  "viaja-solicitacoes": [viajaSolicitacoes960, viajaSolicitacoes1280, viajaSolicitacoes1440],
  "viaja-foto": [viajaFoto576, viajaFoto864, viajaFoto1152],
  "viaja-perfil": [viajaPerfil960, viajaPerfil1280, viajaPerfil1440],
  "viaja-viagens": [viajaViagens960, viajaViagens1280, viajaViagens1440],
  "viaja-viagem": [viajaViagem960, viajaViagem1280, viajaViagem1440],
  "viaja-acerto": [viajaAcerto960, viajaAcerto1280, viajaAcerto1440],
};

/**
 * Largura da captura no slide: no celular, a tela menos as margens (px-5 +
 * px-4 + bordas); a partir de md, 8 de 12 colunas do quadro (wrap de 1400 px,
 * px-10 + px-20 + gap-10).
 */
const SIZES = "(max-width: 767px) calc(100vw - 74px), min(800px, calc((100vw - 240px) * 0.66))";
const ALTURA_PAINEL_CEL = 440; // px: teto do painel no celular

const sombra = "shadow-[0_24px_50px_-18px_rgb(20_20_19/0.45)]";
const moldura = `overflow-hidden rounded-xl border border-line bg-paper-2 ${sombra}`;

/**
 * Largura em que um painel aparece: no celular, a coluna ou o teto de altura;
 * a partir de md, a altura da área 16:10 (largura × 0,625) vezes a proporção do painel.
 */
const sizesPainel = (proporcao: number) =>
  `(max-width: 767px) min(calc(100vw - 74px), ${Math.round(ALTURA_PAINEL_CEL * proporcao)}px), ` +
  `calc(min(800px, calc((100vw - 240px) * 0.66)) * ${(0.625 * proporcao).toFixed(3)})`;

function Slide({ n, tela, children }: { n: number; tela: Tela; children: React.ReactNode }) {
  return (
    // md:px-20 deixa o vão das setas laterais (trilho-telas.tsx) livre do texto e da imagem.
    <div className="grid items-center gap-5 px-4 py-6 md:grid-cols-12 md:gap-10 md:px-20 md:py-12">
      {/* No celular a imagem vem primeiro: ela fica no mesmo lugar enquanto se desliza. */}
      <div className="order-2 md:order-1 md:col-span-4">
        <Label className="text-muted">
          {String(n).padStart(2, "0")} — {tela.titulo}
        </Label>
        <p className="mt-3 font-serif text-[clamp(1.35rem,2.1vw,1.9rem)] leading-[1.15] text-pretty md:mt-4">{tela.texto}</p>
      </div>
      {/* Painel: sem moldura, centrado na mesma área 16:10 das telas, para o carrossel não mudar de altura. */}
      <div className={`order-1 md:order-2 md:col-span-8 ${tela.painel ? "flex justify-center md:relative md:block md:aspect-[16/10]" : moldura}`}>
        {children}
      </div>
    </div>
  );
}

/** `destaque` = primeiro slide, acima da dobra: carrega na hora e com prioridade. */
function Captura({ tela, destaque = false }: { tela: Tela; destaque?: boolean }) {
  const vs = versoes[tela.imagem];
  const maior = vs.at(-1)!;
  return (
    // Um <img> à mão, como na capa (visuais.tsx): as versões já vêm prontas.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={maior.src}
      srcSet={vs.map((v) => `${v.src} ${v.width}w`).join(", ")}
      sizes={tela.painel ? sizesPainel(maior.width / maior.height) : SIZES}
      width={maior.width}
      height={maior.height}
      alt={tela.alt}
      loading={destaque ? "eager" : "lazy"}
      fetchPriority={destaque ? "high" : undefined}
      decoding="async"
      draggable={false}
      // Painel no celular: largura definida (a da coluna ou a que dá o teto de altura), para a
      // altura já estar reservada antes de a imagem carregar. Sem isso o carrossel cresce no
      // meio da navegação quando o painel não está entre os primeiros slides.
      style={tela.painel ? ({ "--larg-painel": `${Math.floor(ALTURA_PAINEL_CEL * (maior.width / maior.height))}px` } as React.CSSProperties) : undefined}
      className={
        tela.painel
          ? `block h-auto max-h-[440px] w-[min(100%,var(--larg-painel))] max-w-full rounded-2xl ${sombra} md:absolute md:inset-0 md:m-auto md:h-full md:max-h-none md:w-auto`
          : "block aspect-[16/10] h-auto w-full"
      }
    />
  );
}

/** Topo do estudo de caso com telas: no lugar da capa, as telas num carrossel lateral, cada uma com a sua frase. */
export function CapaComTelas({ solucao: s }: { solucao: Solucao & { telas: Tela[] } }) {
  return (
    <TrilhoTelas titulos={s.telas.map((t) => t.titulo)} rotulo={`Telas do ${s.nome}`}>
      {s.telas.map((t, i) => (
        <Slide key={t.imagem} n={i + 1} tela={t}>
          <Captura tela={t} destaque={i === 0} />
        </Slide>
      ))}
    </TrilhoTelas>
  );
}
