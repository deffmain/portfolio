# Memória do projeto — leia antes de trabalhar

Contexto e regras combinadas com o Micael ao longo do projeto. Vale para
qualquer sessão ou conta do Claude que trabalhar aqui. Complementa o
`AGENTS.md` e o `.claude/revisoes/LEIA-ME.md`.

## Quem é e como trabalha

- **Micael Martins:** cargo de **suporte de TI** na Sysok (não é
  desenvolvedor oficialmente lá, embora crie ferramentas internas) e estudante
  de Engenharia de Software. Este portfólio é para uma candidatura a vaga. Nunca
  escrever "desenvolvedor na Sysok" no site.
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
- **Soluções no celular: roda vertical** (`components/solucoes-celular.tsx`),
  escolhida em 16/11/2026 em `/lab/solucoes-celular` (variação "Roda"; rota
  já apagada). O anel 3D travava no celular e a ideia da rolagem vertical foi
  dele:
  - abaixo de 640 px o anel não aparece. A seção tem a altura de uma tela e
    rola com a página. O projeto da vez fica em destaque, com o anterior e o
    próximo espiando acima e abaixo, na penumbra;
  - **área de troca** (pedido dele): só o card da vez e uma margem de 10% em
    volta (`[data-troca]`, com `touch-action: none`) tratam o dedo de outro
    jeito: arrastar ali para cima ou para baixo troca o projeto, um a cada
    56 px. No resto da seção o toque rola a página. A primeira versão prendia
    o palco (`sticky`) e trocava pela rolagem; ele rejeitou porque a página
    "travava" até passar pelo último projeto: não volte a prender a rolagem;
  - para testar gestos no Chrome headless use `Input.dispatchTouchEvent`
    (touchStart, touchMove, touchEnd): `Input.synthesizeScrollGesture` e
    `synthesizeTapGesture` não rolam a página nem geram clique;
  - sem 3D e sem animação por quadro em JavaScript: a troca é transição de
    CSS em `transform` e `opacity`;
  - `components/solucoes.tsx` escolhe entre os dois: o servidor manda o anel
    e a roda, o CSS mostra um (`sm:`), e depois da hidratação só o que vale
    para a tela continua montado. A âncora `#solucoes` fica nesse invólucro;
  - voltando de um projeto, a página já aparece na seção, com ele em
    destaque (`VOLTA_PROJETO`), e o cabeçalho do site recolhe sobre o palco,
    como no anel;
  - "reduzir movimento" vai em classe CSS (`motion-reduce:transition-none!`),
    não em `useReducedMotion`: o servidor não sabe a preferência e o React
    não corrige um `style` diferente na hidratação;
  - ficaram de fora: listas roladas ("Lista", "Acende", "Pilha"), porque ele
    quer um projeto por vez, e as variações "Troca" e "Encaixe".
- **Carrossel de soluções** (`components/helice.tsx`), só em tela larga:
  - **entrada em três etapas** (16/11/2026): os cards sobem do chão em pilha,
    como sempre; a pilha se abre em fileira no mesmo plano; a fileira se
    enrola até fechar o anel. Sem sorteio. Antes cada card ia em linha reta
    de uma posição sorteada e eles se atravessavam em 3D em quase toda
    entrada. Ele quis manter a subida: não troque por cards nascendo no
    lugar;
  - **luz dos cards sem variável CSS:** a opacidade do véu, da luz de cima e
    do brilho vai direto em cada elemento, cada um com `will-change:
    opacity`. Variável CSS no card é herdada: a cada mudança o navegador
    recalculava o estilo de tudo dentro dele e repintava a face em 3×;
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
- **Transição carrossel ⇄ estudo de caso: "Camadas"** (regras em
  `app/globals.css`, folhas em `app/solucoes/[slug]/page.tsx`):
  - ida: a home fica parada e três folhas (ferrugem `#b4441f`, terra
    `#3a2a20`, areia `#d4bea3`) sobem de baixo da tela, 500 ms cada, 70 ms
    uma atrás da outra; a página do projeto é a última folha (pousa aos
    710 ms, tudo assenta em ~1,05 s). Volta: o caminho inverso;
  - o clique navega na hora: não há mais a etapa de foco nem o morph da capa
    e do título entre a home e o projeto (o morph do título continua só em
    "Próxima solução", de um projeto para outro);
  - as folhas são `<div>` vazias com `<ViewTransition>`; a cor é pintada no
    `::view-transition-group`, então só existe durante a transição. A página
    não tem fundo próprio: o grupo dela também é pintado (papel), senão as
    folhas aparecem através dela;
  - na volta, o grupo do cabeçalho recebe do navegador o `backdrop-filter` do
    cabeçalho da home; só `!important` tira;
  - para conferir, use velocidade normal: com
    `Animation.setPlaybackRate` reduzido os prints mostram o anel espalhado,
    o que não acontece de verdade (o DOM fica formado).
- **Seção "Processo" ("Do problema à entrega.")**: campo de tokens interativo
  (`components/campo-tokens.tsx`). Perto de um passo, o campo se acalma e o
  passo ganha destaque. Em 17/11/2026 o texto deixou de ser "IA no processo,
  não no discurso.": o processo começa no negócio (entender o problema,
  validar a hipótese) e a IA é ferramenta diária em quase todas as etapas.
  Cada etapa leva o selo "IA no processo" ao lado do título (`ia: true` em `processo`, o mesmo selo da construção nos estudos de caso); ele rejeitou uma frase "Com IA ·" por etapa e tirou a linha de evidência (↳ …) de cada etapa.
  O Dashboard de Suporte nasceu dos chamados e da necessidade de acompanhar
  os KPIs do atendimento (exemplo real de hipótese validada).
- **Cards com imagens reais:** concluído em 17/11/2026. Os cinco cards usam
  captura ou arte (`capturas` em `visuais.tsx`), e as ilustrações SVG do
  Dashboard, do Cultiva, da Avori e da Demo Park API foram apagadas. Só a
  capa da pesquisa ainda é SVG (`Pesquisa`).
  - A captura ocupa o card inteiro. Sem `soCard`, é a mesma URL no card e
    na capa do estudo de caso.
  - Ele deixa a imagem escolhida de cada projeto em
    `Imagens_dos_projetos/<Projeto>/`. Corte no centro para 16:10 e gere três
    larguras em WebP (sem ampliar) em `content/capturas/`. Exemplo:
    `cultiva-horta-{960,1280,1440}.webp`.
  - O Cultiva fica em `C:\Cultiva` (`docker compose up -d --build`, com o
    Docker Desktop aberto). A conta de demonstração local é
    `portfolio-demo@example.com`.
- **Telas no estudo de caso** (`components/trilho-telas.tsx` e
  `components/telas-solucao.tsx`):
  - no lugar da capa fica um carrossel lateral, com rolagem nativa e
    scroll-snap. A capa não entra nele: o carrossel a substitui, e o 1º slide
    carrega com prioridade, por estar acima da dobra. Projeto sem `telas`
    mantém a capa sozinha;
  - cada slide tem uma frase à esquerda (função e valor da tela) e a captura
    à direita; no celular, a imagem vem em cima. Os dados ficam em `telas`,
    em `content/perfil.ts`, e os arquivos em
    `content/capturas/<projeto>-<tela>-<largura>.webp`;
  - **a frase diz o que a tela agrega, na linguagem do usuário**, não o que
    ela faz (pedido dele em 17/11/2026, na Avori). Em vez de "As viagens
    publicadas por quem você segue chegam com foto, datas e roteiro…", use
    "Compartilhe suas aventuras com seus amigos e receba inspiração de outras
    pessoas." Curta e simples;
  - os recortes mostram só a funcionalidade. Se ela é um painel (inspetor,
    simular solo), vai só o cartão, sem fundo em volta (`painel: true`,
    imagem no formato próprio, centralizada na área 16:10 do slide); senão,
    a tela em 16:10;
  - a partir de md, as setas ficam nas laterais, no meio da altura. No
    celular elas cobririam a frase, então vão para a barra de baixo, ao lado
    dos tracinhos;
  - **enquadramento ("auto ajuste"):** usa o mesmo `useEnquadrarAoChegar`
    (`lib/hooks.ts`) do anel da home, com `centrar` (o carrossel fica
    centrado na altura, sem ir para trás do cabeçalho, e o cabeçalho não
    recolhe) e `armadoNaCarga` (vale desde a primeira roda, tecla ou toque,
    porque o carrossel já aparece ao abrir a página). Ele rejeitou encolher o
    carrossel para caber na tela: as imagens ficavam pequenas demais;
  - os indicadores da barra encolhem quando falta espaço (a largura fica no
    botão, com `shrink`), e as setas do celular não (`shrink-0`): com 10
    telas em 390 px as setas ficavam ovais;
  - o painel reserva a altura no celular antes de carregar (largura definida
    por `--larg-painel`): com o painel longe do 1º slide, a imagem `lazy`
    fazia o carrossel crescer no meio da navegação;
  - o Cultiva tem 6 telas, a Avori tem 6 (eram 10; em 17/11/2026 ele tirou
    Busca de pessoas, Solicitações para seguir, Ajustar foto e Perfil e
    privacidade, cujas capturas continuam em `content/capturas/`) e o
    Dashboard de Suporte tem 7 (17/11/2026); os outros
    projetos ainda não têm;
  - um painel mais largo que 16:10 é espremido no slide (`h-full w-auto`
    dentro da área 16:10): capture-o numa janela mais estreita, em que o
    card fique abaixo de 1,6, ou como tela 16:10.
- **Simulação "Roteiros com IA, ao vivo"** (fim do estudo de caso da Avori,
  `components/lab/roteiro-demo.tsx`, 17/11/2026): segue o modelo da tela
  "Nova viagem com a Avori" que aparece nos prints, a pedido dele. Conversa de
  seis perguntas (mesmos textos e opções do app) e prévia em dias com horário
  e atividade, com a identidade do portfólio, não a verde do avori. Saíram
  resumo, orçamento e dicas. Sem chave de IA, a rota gera um roteiro genérico
  para o destino pedido (antes era sempre Pirenópolis). O "Refazer" remonta a
  demo, e o `useDemoStream` aborta o pedido ao desmontar.
- **Avori (antigo Viaja+):** em 17/11/2026 o projeto mudou de identidade.
  O nome exibido é "Avori" (feminino: "a Avori", "na Avori"). O slug
  `/solucoes/viaja-mais`, os arquivos `viaja-*.webp` e o repositório
  `viaja-mais` continuam com o nome antigo, para não quebrar links. O card é
  `Imagens_dos_projetos/ViajaMais/Avori_CardCarrossel.jfif`.
- **Capturas da Avori** (`viaja-<tela>-<largura>.webp`):
  - capturadas como o app é, com a barra do topo e o logo avori;
  - a conta dos prints é fictícia (Helena Prado) e as fotos de perfil são
    rostos gerados (thispersondoesnotexist.com), para não ligar o rosto de
    uma pessoa real a um perfil inventado. As capas de viagem e as fotos dos
    posts são do Wikimedia Commons, só CC0 ou domínio público;
  - o feed do app é uma prévia com dados fixos no código: as fotos dos posts
    entraram só no DOM, na hora da captura (escolha dele), sem alterar o
    repositório do app;
  - o app fica em `C:\Users\micae\viaja-mais`, com trabalho dele em
    andamento: não altere arquivos, não rode `npm run setup` (faz
    `db reset`) e suba o Supabase com `docker start` nos contêineres
    `supabase_*_viaja-mais` e o app em outra porta (`--port 3100`).
- **Capturas do Dashboard de Suporte** (`dashboard-<tela>-<largura>.webp`,
  17/11/2026; o card do anel continua `dashboard-suporte-*`):
  - os dados reais são chamados de clientes da Sysok e nunca entram no
    portfólio. Os prints usam dados fictícios: o servidor roda com um módulo
    de pré-carga (`node --require mock.js server/server.js`, `PORT=3200`)
    que dá variáveis falsas ao processo e troca o `fetch` para `github.com` e
    `api.github.com` (login OAuth, membership 204, token de instalação e
    ~200 issues inventadas no formato do `chamado.yml`), sem tocar em
    `C:\suporte-dashboard`. O login é feito em Node (`/auth/github` →
    `/auth/callback`) e o cookie `sd_session` vai para o Chrome;
  - empresas, pessoas e atendentes (`@ana-suporte`…) são inventados; o nome
    do repositório `SYSOK-Sistemas-Ltda/Suporte` aparece como está (escolha
    dele);
  - filtro de 90 dias. O céu do mapa tem proporção fixa (1000/620): na janela
    de 1187 px ele sai 1097×680 e o corte 16:10 tira só ~5 px por lado. A
    tabela é 1,88:1 em qualquer largura em que caiba: foi capturada sozinha
    (os outros cards escondidos só no DOM), em 16:10, no fundo do próprio app;
  - as estrelas de todos os níveis estão no DOM: clique só nas que têm
    `tabindex="0"`.
- **Pesquisa "Código de máquina com IA"** (17/11/2026): entrou no lugar dos
  Manuais de implantação, na 2ª posição do anel e da roda
  (`/solucoes/codigo-de-maquina-com-ia`; o slug antigo dá 404, escolha dele):
  - é o artigo "Ganhos e perdas do desenvolvimento em código de máquina…",
    **estudo inicial**: tem introdução, hipótese, delimitação e referencial
    (5 eixos, 13 referências, 6 páginas), sem metodologia nem resultados.
    Não escreva resultado que o artigo não tem. Ele pediu para tirar os
    números do bloco "Estágio atual" (`numeros: []`; a página só mostra a
    grade quando há números);
  - **só o nome do Micael** no site e no PDF. O PDF original
    (`Imagens_dos_projetos/Pesquisa_IA_Binario/`) tem mais dois nomes e não é
    alterado. A cópia publicada, `public/artigos/codigo-de-maquina-com-ia.pdf`,
    foi editada com PyMuPDF: redação real dos nomes e a página 1 subindo duas
    linhas, com `/Author` = Micael. Não há o HTML de origem;
  - campos opcionais em `Solucao`: `status` (selo "Em desenvolvimento ·
    estudo inicial" só no topo do estudo de caso, em
    `components/selo-status.tsx`; ele pediu para tirar a pílula do card do
    anel e da roda), `blocos` (títulos de pesquisa nos quatro
    blocos) e `artigo` (link "Ler o artigo (PDF)" no topo e no lugar do
    botão do GitHub);
  - o card do anel e da roda usa a arte dele
    (`Imagens_dos_projetos/Pesquisa_IA_Binario/Gemini_Generated_Image_*.jfif`
    → `content/capturas/pesquisa-capa-{960,1280,1440}.webp`), **só no card**
    (`soCard: true` em `capturas`; a Demo Park API usa o mesmo esquema desde
    17/11/2026: `Imagens_dos_projetos/Demo Park/Gemini_Generated_Image_*.jfif`
    → `park-capa-*.webp` no card; a capa do estudo de caso dela é o diagrama
    "Visão geral das camadas" do artefato de arquitetura dele, capturado só o
    SVG, no tema claro e em 2×, com margem até 16:10 (`park-arquitetura-*.webp`,
    no mapa `capas` de `visuais.tsx`, que vale só para a capa). A capa do
    estudo de caso da pesquisa continua com o
    diagrama SVG (`Pesquisa` em `visuais.tsx`): a mesma instrução em C,
    assembly x86-64 e bytes (`01 D8`), com a IA indo "direto ao binário?";
  - contexto "Pesquisa acadêmica · artigo" e papel "Autor" são provisórios:
    ele não disse a instituição nem se a IA entrou no processo (por isso,
    nenhum selo "IA no processo" ali).
- **O que ele não gostou** (não proponha de novo):
  - a fita de tecnologias rolando no fim da seção Sobre e o item "Plano de
    12 meses para AI Engineer" na trajetória (removidos em 17/11/2026);
  - personagem animado desenhado à mão (o "monstrinho" / macaco);
  - o estilo Moebius/Sable aplicado ao site;
  - as primeiras ideias para "impressionar" o carrossel: nome gigante, brilho,
    reflexo e afins;
  - as seis primeiras propostas de transição: morph, mergulho, íris,
    persianas, virar e título;
  - da 2ª rodada, ficaram de fora: "O card se abre", "Blocos",
    "Decodificação" e "Película".

## Em andamento

- **Revisões:** os relatórios e as tarefas ficam em `.claude/revisoes/`, fora
  do git. Da lista mais recente, `2026-10-30-2152-tarefas.md`, já foram
  feitas T-01 e T-02 (WebP responsivo e `<img>` com `srcSet`), T-03 (SVGs
  inalcançáveis apagados) e T-06 (README). Seguem abertas a T-04 (modo
  decorativo, `alt=""`, no card do anel) e as marcações informativas em
  `components/visuais.tsx` (`git grep -n "REVISAO\["`).
- **Servidor de desenvolvimento:** se não houver nenhum rodando, suba com
  `node node_modules/next/dist/bin/next dev --port 3000` (pelo terminal do
  Claude, `npx next dev -p 3000` falha com "unknown option '-p'"). O
  `next build` **não** pode rodar na mesma pasta
  com o dev ligado (veja a regra 6). Se `/solucoes/*` der "Jest worker
  encountered 2 child process exceptions", o worker de rotas do dev morreu
  (build em paralelo, ou o Claude Code encerrou o dev em segundo plano por
  falta de memória e deixou o servidor órfão na porta): mate a árvore do
  processo da porta 3000 e suba o dev de novo. Prefira o dev num terminal do
  próprio Micael.
