# Portfolio — Micael Martins

"Construo software que resolve problemas reais." Um portfolio editorial (papel & tinta) organizado em torno de soluções: cada uma tem um estudo de caso com problema → o que construí → como construí → resultado. A IA aparece como método de engenharia, na seção **Processo** e nos selos "IA no processo" de cada caso.

## Estrutura do site

- **/** — hero, índice de soluções (prévia que segue o cursor), processo, sobre, contato
- **/solucoes/[slug]** — estudo de caso, gerado estaticamente; o título faz *morph* a partir do índice com `<ViewTransition>`
- **/solucoes/viaja-mais#experimente** — protótipo ao vivo do gerador de roteiros com IA
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

As ilustrações das soluções ficam em [`components/visuais.tsx`](components/visuais.tsx) — são esquemáticas e podem ser trocadas por capturas de tela reais.

## Código

```
app/page.tsx                 home
app/solucoes/[slug]/page.tsx estudo de caso
app/api/roteiro              gerador de roteiros — streaming NDJSON, cada item validado com Zod
app/api/comando              paleta: a IA escolhe uma ação de um catálogo fechado
lib/ai/                      provedores (Groq → Gemini), parser SSE, JSON Lines + Zod, rate limit
components/                  home, cabeçalho, contato, visuais, paleta, demo
content/perfil.ts            conteúdo
```

## Deploy (Vercel)

1. Suba o repositório no GitHub e importe em [vercel.com/new](https://vercel.com/new).
2. Opcional: em *Settings → Environment Variables*, adicione `GROQ_API_KEY` e `NEXT_PUBLIC_SITE_URL`.
3. Deploy.

Stack: Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Motion · cmdk · Zod.
