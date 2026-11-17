# Portfolio — Micael Martins

"Construo software que resolve problemas reais." Um portfolio editorial (papel & tinta) organizado em torno de soluções: cada uma tem um estudo de caso com problema → o que construí → como construí → resultado. A IA aparece como método de engenharia, na seção **Processo** e nos selos "IA no processo" de cada caso.

## Estrutura do site

- **/** — hero, soluções (anel 3D em tela larga, roda vertical no celular), estudos e exercícios, processo, sobre e contato
- **/solucoes/[slug]** — estudo de caso, gerado estaticamente. Ao abrir, três folhas sobem e a página chega por último (transição "Camadas", com `<ViewTransition>`); projetos com telas mostram um carrossel no lugar da capa
- **/solucoes/viaja-mais#experimente** — protótipo ao vivo do gerador de roteiros com IA (Avori)
- **/artigos/** — o PDF do artigo da pesquisa, servido de `public/`
- **⌘K / Ctrl+K** — índice de navegação; frases livres são interpretadas por IA (ou por um roteador local, sem chave)

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # opcional: GROQ_API_KEY e/ou GEMINI_API_KEY (gratuitos)
npm run dev
```

Sem chave, o gerador de roteiros mostra um exemplo pré-gerado e a paleta usa o roteador local.

| Variável | Padrão |
|---|---|
| `GROQ_API_KEY` | — |
| `GROQ_MODEL` | `openai/gpt-oss-120b` |
| `GEMINI_API_KEY` | — |
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |

## Editando o conteúdo

Tudo está em [`content/perfil.ts`](content/perfil.ts): perfil, soluções (com problema, solução, processo, resultado e números), estudos, processo e trajetória. Para exibir o LinkedIn, preencha `perfil.linkedin`.

As imagens ficam em `content/capturas/`, em WebP 16:10 com três larguras (960, 1280 e 1440), e são mapeadas em [`components/visuais.tsx`](components/visuais.tsx):

- `capturas` — a imagem do card do anel e da roda (e da capa do estudo de caso, a menos que tenha `soCard: true`);
- `capas` — uma imagem só para a capa do estudo de caso, quando ela é diferente do card;
- `ilustracoes` — legenda e texto alternativo das ilustrações em SVG (hoje, só a da pesquisa).

As telas do carrossel do estudo de caso ficam em `telas`, em `content/perfil.ts`, e os arquivos são mapeados em [`components/telas-solucao.tsx`](components/telas-solucao.tsx).

## Código

```
app/page.tsx                 home
app/solucoes/[slug]/page.tsx estudo de caso
app/api/roteiro              gerador de roteiros — streaming NDJSON, cada item validado com Zod
app/api/comando              paleta: a IA escolhe uma ação de um catálogo fechado
lib/ai/                      provedores (Groq → Gemini), parser SSE, JSON Lines + Zod, rate limit
components/                  home, anel e roda de soluções, telas, cabeçalho, contato, visuais, paleta, demo
content/perfil.ts            conteúdo
content/capturas/            imagens das soluções e das telas (WebP)
public/artigos/              PDF do artigo da pesquisa
```

## Deploy (Vercel)

1. Suba o repositório no GitHub e importe em [vercel.com/new](https://vercel.com/new).
2. Opcional: em *Settings → Environment Variables*, adicione `GROQ_API_KEY` e `NEXT_PUBLIC_SITE_URL`.
3. Deploy.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Motion · cmdk · Zod.
