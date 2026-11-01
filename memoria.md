# Memória do projeto — leia antes de trabalhar

Contexto e regras combinadas com o Micael ao longo do projeto. Vale para
qualquer sessão ou conta do Claude que trabalhar aqui. Complementa o
`AGENTS.md` e o `.claude/revisoes/LEIA-ME.md`.

## Quem é e como trabalha

- **Micael Martins:** desenvolvedor na Sysok e estudante de Engenharia de
  Software. Este portfólio é para uma candidatura a vaga.
- **Idioma:** escreva sempre em **português (pt-BR)**.
- **Pedidos de prompt:** muitas vezes ele pede um **prompt** para outra sessão
  do Claude executar, em vez da mudança em si. Ele também quer aprender a
  descrever efeitos visuais. Um bom prompt para ele tem:
  1. o diagnóstico já feito, com números;
  2. "O que fazer";
  3. "Não mexer";
  4. "Como vou conferir".
- **Decisões:** ele decide rápido e descarta muitas ideias no mesmo dia. Não
  insista numa proposta rejeitada.
- **Análise × ação:** ele não quer análise em loop. Quando a causa já está
  clara, passe para a ação.
- **Deploy:** ele quer entender e executar o deploy sozinho. Explique, não faça
  por ele.

## Regras de trabalho (obrigatórias)

1. **Submeta ideias antes de implementar.** Ideias próprias de design ou
   conteúdo viram opções concretas (página de teste, prints) com uma
   recomendação, e você espera a escolha. O que ele pediu explicitamente pode
   ser executado direto.
2. **Experimentos ficam numa rota separada**, em arquivos novos. Exemplos:
   `app/lab/<nome>/page.tsx` e `components/lab-<nome>.tsx`.
   - A home não é tocada até ele escolher.
   - Quando houver várias opções, ofereça um seletor para comparar.
   - Ao adotar ou rejeitar, apague a rota de teste.
3. **Confira o visual antes de dizer que está pronto.** Use o Chrome headless
   via DevTools Protocol, em 1440 px e 390 px.
   - O Chrome fica em `C:/Program Files/Google/Chrome/Application/chrome.exe`.
   - Para o celular, use `Emulation.setDeviceMetricsOverride` com
     `mobile: true`. O `--window-size` em linha de comando não abre janelas
     estreitas, e o print sai cortado.
   - Encerre o Chrome e os servidores que você abriu.
4. **Pergunte antes de lançar subagentes** (revisores, planejador ou
   qualquer outro). Isso vale também quando o hook Stop pede. Eles rodam no
   Opus: uma rodada dos dois revisores gastou cerca de **420 mil tokens** e
   já estourou o limite de uso uma vez.
5. **Ao terminar uma tarefa com código novo,** o hook Stop pede duas perguntas
   juntas, feitas com o AskUserQuestion:
   1. o trabalho está ok?
   2. rodar os revisores?

   Só rode os revisores com um "sim" explícito. Se a página é de teste e
   descartável, recomende "não". O hook só considera os arquivos que a própria
   sessão editou; o que outra sessão alterou não entra nas perguntas.
6. **Sessões paralelas.** Ele costuma ter outra sessão do Claude no mesmo
   repositório.
   - Antes de editar arquivos compartilhados (`components/helice.tsx`,
     `components/home.tsx`, `app/page.tsx`, `app/globals.css`,
     `components/visuais.tsx`), rode o ListAgents e veja a data de modificação
     do arquivo.
   - Se outra sessão estiver mexendo nele, use arquivos novos ou entregue um
     prompt.
   - Antes de commitar, rode `npm run build`.
   - Nunca rode `npm run build` nem `next start` na pasta do projeto com um
     `next dev` ligado (porta 3000+). Ele derruba o worker de rotas do dev.
     Faça o build numa cópia ou pergunte antes.
7. **Este não é o Next.js que você conhece** (16.4, com mudanças
   incompatíveis). Antes de afirmar algo sobre uma API, consulte
   `node_modules/next/dist/docs/`.
8. **Não exagere no escopo.** Faça o que foi pedido. Melhorias extras você
   sugere numa linha, sem implementar.

## O projeto

- **Stack:**
  - Next.js 16.4 (App Router, Turbopack), com `cacheComponents` e
    `partialPrefetching`;
  - React 19.3 (`<ViewTransition>`);
  - TypeScript estrito e Tailwind CSS 4 (tema em `app/globals.css`);
  - Motion 14 (`motion/react`), cmdk, Zod 4, lucide-react.
- **Conteúdo:** todo o texto está em `content/perfil.ts`. As ilustrações e as
  capturas ficam em `components/visuais.tsx`, e as imagens em
  `content/capturas/*.webp`.
- **IA:** `/api/comando` (paleta Ctrl+K) e `/api/roteiro` (demo de roteiros
  em streaming). Usa Groq e, de reserva, Gemini (`lib/ai/`). Sem chave, entra
  em modo demonstração.
- **Repositório:** `github.com/deffmain/portfolio` (público), branch `main`.
  O git tem um remote duplicado com erro de digitação, `oringin`, que pode
  ser removido.
- **Deploy:** na Vercel, ligado ao GitHub. Todo push na `main` vai para
  produção. As variáveis `GROQ_API_KEY`, `GEMINI_API_KEY` e
  `NEXT_PUBLIC_SITE_URL` ficam no painel da Vercel. Mudar uma `NEXT_PUBLIC_*`
  exige redeploy. O GitHub Pages foi descartado porque as rotas de IA precisam
  de servidor.
- **Commits:** em pt-BR, no estilo `feat:` / `fix:` / `perf:` / `chore:` /
  `docs:`. Ele pediu um histórico que mostre o trabalho evoluindo, com um
  commit por peça. Commit e push só quando ele pedir.

## Decisões de design já tomadas

- **Identidade:** "papel & tinta", com fundo creme, tinta escura e acento
  ferrugem `#b4441f` / `#e0764f`. Os títulos usam Instrument Serif, o texto
  usa Geist e os rótulos usam Geist Mono.
- **Carrossel de soluções** (`components/helice.tsx`):
  - anel 3D de **cards planos** (a simulação de curva foi abandonada por
    desempenho), num **palco escuro "Terra" `#1f1915`**;
  - o título e as informações ficam dentro do palco;
  - o **card da frente acende**: brilho quente na borda, luz de cima e filete;
  - textos abaixo do card: rótulo `#c49a74`, nome `#f3e3cc`, descrição
    `#d4bea3`, link `#e9a77f`;
  - atenção ao ângulo: o card i está em `ângulo − i·passo`. Com o sinal
    trocado, o destaque cai no card errado.
  - **cards giram 75% do ângulo do anel** (`GIRO_CARD`): com o ângulo
    inteiro os vizinhos paravam a 72°, quase de perfil, e a borda serrilhava
    (o Chrome não suaviza a borda de camada 3D tão inclinada). Borda
    transparente e desenhar a face maior não resolvem. Com 75%, o card que
    passa pelo fundo (180°) pulava de +135° para -135° (um "pisque" no vão entre
    os da frente): agora o ângulo de cada card é contínuo (`giroAcum`) e ele
    troca de pose só quando está escondido nas duas poses — atrás do card de
    destaque ou fora do palco (`caixaNaTela`, mesma conta do CSS). No celular
    (palco < 640 px, `giroDe`) o card nunca fica escondido, mas os vizinhos a
    72° ficam fora da tela: lá o card gira o ângulo inteiro e não há pulo;
  - **o card cresce conforme avança** (variação "Forte", escolhida em
    /lab/crescer): 0,75× no fundo até 1,2× na frente (`ENCOLHE`/`CRESCE`), com
    teto menor no celular (`LARGURA_MAX_FRENTE`). Cards base ~36% da largura
    (380–580 px). `alturaDoAnel` mede os cantos de cada card ao longo da volta
    (com escala, giro, inclinação e perspectiva) e o anel se centra no espaço
    livre entre o título e o texto (refs `cabecalho`/`rodape`), com
    `FOLGA_ANEL` de 20 px; em telas de ~900 px de altura, a altura é o limite;
  - **sem `filter` no voo do morph:** um `blur(2.5px)` na capa e no título
    derrubava a ida para ~30 fps (GPU). Sem ele, ~110 fps. As seções da home
    usam `.adiar-render` (`content-visibility` só durante a transição; ligado
    sempre, as âncoras do menu erram no celular). Meça fluidez no build de
    produção: o `next dev` deixa a transição ~2× mais lenta.
- **Seção "IA no processo":** campo de tokens interativo
  (`components/campo-tokens.tsx`). Perto de um passo, o campo se acalma e o
  passo ganha destaque.
- **Cards com imagens reais:** as ilustrações estão sendo trocadas por
  capturas reais, um projeto por vez.
  - O Cultiva já foi trocado. A captura ocupa o card inteiro e é a mesma URL
    no card e na capa, por causa do morph.
  - O Cultiva fica em `C:\Cultiva` (`docker compose up -d --build`, com o
    Docker Desktop aberto). A conta de demonstração local é
    `portfolio-demo@example.com`.
- **O que ele não gostou** (não proponha de novo):
  - personagem animado desenhado à mão (o "monstrinho" / macaco);
  - o estilo Moebius/Sable aplicado ao site;
  - as primeiras ideias para "impressionar" o carrossel: nome gigante, brilho,
    reflexo e afins;
  - as seis primeiras propostas de transição: morph, mergulho, íris,
    persianas, virar e título.

## Em andamento

- **Transição do carrossel para o estudo de caso:**
  - **Problema medido:** cerca de 2 s até a página assentar. Somam-se o foco
    de 350 ms, a busca do conteúdo depois do clique (o `router.prefetch` só
    traz o App Shell com `partialPrefetching`; só um
    `<Link prefetch={true}>` traz o conteúdo por URL), o voo de 560 ms e a
    cascata de chegada (480 ms + 90 ms por bloco).
  - **Correção:** já existe um prompt pronto com o diagnóstico e a meta de
    ≤ 1,1 s. O usuário quis ver novas transições antes de aplicar.
  - **2ª rodada de propostas** em `/lab/transicoes`
    (`components/lab-transicoes.tsx`): "O card se abre", "Camadas", "Blocos",
    "Decodificação" e "Película". Ele ainda não escolheu. Depois da escolha,
    junte o efeito com a correção de velocidade num prompt só e apague a rota
    de teste.
- **Revisões:** os relatórios e as tarefas ficam em `.claude/revisoes/`, fora
  do git. A lista mais recente, `2026-10-30-2152-tarefas.md`, tem tarefas
  P1/P3 sobre as capturas do Cultiva. Há marcações `REVISAO[...]` abertas em
  `components/visuais.tsx` e `app/solucoes/[slug]/page.tsx`
  (`git grep -n "REVISAO\["`).
- **Servidor de desenvolvimento:** se não houver nenhum rodando, suba com
  `npx next dev -p 3000`. O `next build` **não** pode rodar na mesma pasta
  com o dev ligado (veja a regra 6). Se `/solucoes/*` der "Jest worker
  encountered 2 child process exceptions", o worker de rotas do dev morreu
  (build em paralelo, ou o Claude Code encerrou o dev em segundo plano por
  falta de memória e deixou o servidor órfão na porta): mate a árvore do
  processo da porta 3000 e suba o dev de novo. Prefira o dev num terminal do
  próprio Micael.
