// Fonte única de conteúdo do portfolio. Home, estudos de caso, paleta de
// comandos e prompt da IA leem daqui — editar este arquivo atualiza o site.

export const perfil = {
  nome: "Micael Martins",
  papel: "Desenvolvedor de software",
  email: "micaelcruz46@gmail.com",
  github: "https://github.com/deffmain",
  githubUser: "deffmain",
  linkedin: "https://www.linkedin.com/in/micael-cruz-415a92248",
  intro:
    "Suporte de TI na Sysok e estudante de Engenharia de Software. Transformo problemas de operação — suporte, treinamento, planejamento — em ferramentas que as pessoas usam no dia a dia.",
  sobre: [
    "Na Sysok, meu cargo é de suporte de TI: atendo clientes e acompanho a implantação do ERP. Nesse dia a dia, desenvolvo soluções internas para os problemas que encontro. Estar perto de quem usa o sistema me ensinou a começar pelo problema e só depois escolher a tecnologia.",
    "Minha base é Java e Spring Boot, com APIs, autenticação e bancos relacionais; no front, React e Next.js. Hoje uso IA como parte do processo de engenharia, para especificar, implementar, revisar e automatizar.",
  ],
};

export type SecaoId = "inicio" | "solucoes" | "processo" | "sobre" | "contato";

export const secoes: { id: SecaoId; label: string; descricao: string }[] = [
  { id: "inicio", label: "Início", descricao: "Topo da página" },
  { id: "solucoes", label: "Soluções", descricao: "Índice do que construí" },
  { id: "processo", label: "Processo", descricao: "Como construo, do problema à entrega" },
  { id: "sobre", label: "Sobre", descricao: "Trajetória e stack" },
  { id: "contato", label: "Contato", descricao: "E-mail e GitHub" },
];

export type Visual = "dashboard" | "pesquisa" | "cultiva" | "viaja" | "park";

/** Capturas das telas de uma solução (arquivos em content/capturas, mapeados em components/telas-solucao.tsx). */
export type TelaImagem =
  | "dashboard-visao"
  | "dashboard-tempo"
  | "dashboard-mapa"
  | "dashboard-area"
  | "dashboard-motivos"
  | "dashboard-chamados"
  | "dashboard-relatorio"
  | "cultiva-planejador"
  | "cultiva-inspetor"
  | "cultiva-solo"
  | "cultiva-clima"
  | "cultiva-guia"
  | "cultiva-conceitos"
  | "viaja-roteiro"
  | "viaja-feed"
  | "viaja-busca"
  | "viaja-privado"
  | "viaja-solicitacoes"
  | "viaja-foto"
  | "viaja-perfil"
  | "viaja-viagens"
  | "viaja-viagem"
  | "viaja-acerto";

/**
 * Uma tela da solução: a captura e, ao lado, a frase com a função e o valor dela.
 * `painel`: a captura é só um painel recortado (formato próprio, sem moldura), não a tela 16:10.
 */
export type Tela = { imagem: TelaImagem; titulo: string; texto: string; alt: string; painel?: boolean };

export type Solucao = {
  slug: string;
  nome: string;
  contexto: string;
  ano: string;
  papel: string;
  /** O problema em uma frase — é o que aparece no índice. */
  problemaCurto: string;
  problema: string;
  solucao: string[];
  /** Como foi construído; `ia: true` marca onde a IA entrou no processo. */
  processo: { texto: string; ia?: boolean }[];
  resultado: string;
  numeros: { valor: string; rotulo: string }[];
  stack: string[];
  visual: Visual;
  /** Telas do carrossel do topo do estudo de caso, depois da capa. */
  telas?: Tela[];
  repo?: string;
  privado?: string;
  /** Trabalho em andamento: `selo · estagio` aparece no topo do estudo de caso. */
  status?: { selo: string; estagio: string };
  /** Títulos dos quatro blocos do estudo de caso, quando não é um produto (ex.: pesquisa). */
  blocos?: [string, string, string, string];
  /** PDF servido pelo site (em public/): vira o link "Ler o artigo (PDF)". */
  artigo?: string;
  demo?: "roteiro";
};

export const solucoes: Solucao[] = [
  {
    slug: "dashboard-de-suporte",
    nome: "Dashboard de Suporte",
    contexto: "Sysok Sistemas · ferramenta interna",
    ano: "2026",
    papel: "Concepção, desenvolvimento e deploy",
    problemaCurto: "A equipe de suporte não enxergava o próprio volume de chamados.",
    problema:
      "Os chamados dos clientes do ERP viviam como issues em um repositório do GitHub. Não havia visão consolidada: era impossível saber quais empresas mais demandavam, quanto tempo um chamado levava para ser resolvido ou onde estavam os gargalos de usabilidade do sistema.",
    solucao: [
      "Um painel que lê as issues pela API do GitHub, agrega as métricas no servidor e entrega KPIs, métricas por empresa, tempo de resolução e um relatório pronto.",
      "Um mapa de usabilidade mostra os pontos do sistema que mais geram chamados, com drill-down até os motivos — o suporte passa a apontar onde o produto precisa melhorar.",
    ],
    processo: [
      { texto: "Spec-driven development: especificação, tarefas e guia de deploy e segurança escritos antes da primeira linha de código.", ia: true },
      { texto: "Implementação em fases a partir da spec, com um agente de IA executando tarefa por tarefa e eu revisando cada entrega.", ia: true },
      { texto: "Zero dependências: Node 20 puro no servidor, HTML, CSS e JS no front, gráficos em SVG.", ia: true },
      { texto: "O token do GitHub nunca chega ao navegador; login via GitHub App e container Docker endurecido.", ia: true },
      { texto: "Testes automatizados com node:test e pipeline de CI.", ia: true },
    ],
    resultado:
      "A equipe de suporte da Sysok ganhou uma visão única do volume de chamados, dos clientes que mais demandam e do tempo de resolução — e um mapa de onde o sistema gera mais dúvidas.",
    numeros: [
      { valor: "0", rotulo: "dependências npm" },
      { valor: "5 min", rotulo: "de cache nas métricas" },
      { valor: "4", rotulo: "fases guiadas por spec" },
    ],
    stack: ["Node.js 20", "JavaScript", "GitHub API", "GitHub App", "SVG", "Docker", "node:test", "CI"],
    visual: "dashboard",
    telas: [
      {
        imagem: "dashboard-visao",
        titulo: "Visão geral",
        texto:
          "Os números do suporte na primeira tela: quantos chamados entraram, quantos seguem abertos, quanto tempo levam e quais empresas mais demandam.",
        alt: "Painel do Dashboard de Suporte com o filtro de 90 dias: 202 chamados (12 abertos e 190 fechados), 11 empresas atendidas, tempo médio de resolução de 24,3 h e mediano de 3,0 h; abaixo, o anel de status com quem atendeu os chamados e as barras de chamados por empresa, lideradas pelo Pet Shop Patinhas do Ipê, com 43.",
      },
      {
        imagem: "dashboard-tempo",
        painel: true,
        titulo: "Tempo de resolução por empresa",
        texto:
          "O tempo médio de resolução de cada empresa mostra onde o atendimento demora e qual cliente precisa de mais atenção.",
        alt: "Card Tempo médio de resolução por empresa com barras roxas: a Banho & Tosa Rabo Abanando no topo, com 2,5 dias, seguida do Hospital Veterinário Aurora (27,2 h) e da Agropecuária Boa Colheita (26,7 h), até a Clínica Focinho Gelado, com 9,2 h.",
      },
      {
        imagem: "dashboard-mapa",
        titulo: "Mapa de usabilidade",
        texto:
          "Cada área do sistema vira uma estrela do tamanho do volume de chamados: o suporte enxerga de relance onde o produto mais gera dúvidas.",
        alt: "Mapa de usabilidade em forma de céu: cada área do sistema é uma estrela colorida, com Comercial (69 chamados) e Financeiro (57) maiores e mais brilhantes que Configurações, Arquivos, Relatórios, Estética, Clínica e Laboratório; no canto, o resumo de todas as áreas, com 202 chamados e 12 em aberto.",
      },
      {
        imagem: "dashboard-area",
        titulo: "Dentro de uma área",
        texto:
          "Ao entrar numa área, a câmera viaja até os subgrupos e funções, até a tela exata que concentra os chamados.",
        alt: "Constelação da área Comercial, com 69 chamados: a estrela central ligada aos subgrupos Notas Fiscais (28), Vendas (16), Painel WhatsApp (9), Pedidos de Vendas (6), Orçamentos (5) e Compras (5); no canto, o resumo da área, com 30,2 h de resolução média e 5 chamados em aberto.",
      },
      {
        imagem: "dashboard-motivos",
        painel: true,
        titulo: "Motivos",
        texto:
          "No fim do caminho, a descrição e a resolução de cada chamado: o motivo real por trás do número, pronto para virar melhoria no produto.",
        alt: "Card Fechamento de venda (Comercial › Vendas), com 14 chamados e 24,2 h de média: os chamados #299 e #277, Venda duplicada no histórico, e o #261, Desconto não aparece no cupom, cada um com empresa, data, tempo de resolução, descrição e resolução.",
      },
      {
        imagem: "dashboard-chamados",
        titulo: "Chamados",
        texto:
          "A lista completa, com o local no sistema, a prioridade, o tempo de resolução e quem atendeu, e uma busca por título ou empresa.",
        alt: "Tabela Chamados com 202 itens e o campo de busca por título ou empresa: cada linha traz número, título, empresa, local no sistema, tipo, prioridade, tempo de resolução, status (Aberto ou Fechado) e quem atendeu, como o #299, Venda duplicada no histórico, um bug de prioridade alta resolvido em 4,1 h.",
      },
      {
        imagem: "dashboard-relatorio",
        titulo: "Relatório",
        texto:
          "Um clique gera o relatório para imprimir ou salvar em PDF, com o mesmo recorte dos filtros, pronto para a reunião com o cliente.",
        alt: "Relatório de Suporte em página branca, com o recorte dos últimos 90 dias e o botão Imprimir / Salvar como PDF: o resumo com 202 chamados, 12 abertos, 190 fechados, 11 empresas atendidas e os tempos médio (24,3 h) e mediano (3,0 h) de resolução, e a tabela de chamados por empresa.",
      },
    ],
    privado: "Ferramenta interna da Sysok — código privado.",
  },
  {
    slug: "codigo-de-maquina-com-ia",
    nome: "Código de máquina com IA",
    contexto: "Pesquisa acadêmica · artigo",
    ano: "2026",
    papel: "Autor",
    status: { selo: "Em desenvolvimento", estagio: "estudo inicial" },
    blocos: ["A pergunta", "Hipótese e delimitação", "Referencial e processo", "Estágio atual"],
    problemaCurto: "Quando a IA escreve o código de máquina, o que se ganha e o que se perde?",
    problema:
      "As linguagens de alto nível trocaram o controle fino da máquina por produtividade e portabilidade. Com o hardware entregando menos ganho automático e a IA barateando a escrita de código de baixo nível, essa troca volta à mesa. A pergunta: quais são os ganhos e as perdas de desenvolver em baixo nível, frente ao alto nível, quando a IA gera o código? E o ganho de desempenho compensa o custo de manter, portar e verificar?",
    solucao: [
      "Hipótese: a IA não elimina o custo do desenvolvimento em baixo nível, mas o desloca — da escrita para a verificação.",
      "Delimitação: código de máquina é a codificação binária executável; assembly é a representação simbólica dela. A evidência atual de geração por IA está no assembly e nas representações intermediárias — o que vai além disso é tratado como extrapolação, dita de forma explícita.",
    ],
    processo: [
      { texto: "Níveis de abstração e o papel do compilador: o que se ganhou e o que se perdeu ao delegar a tradução para a máquina." },
      { texto: "Desempenho de hardware: sem o escalonamento de Dennard, o próximo ganho de desempenho volta a vir do software." },
      { texto: "Custo em baixo nível: a maior parte do custo de um sistema está na manutenção, não na primeira escrita." },
      { texto: "Geração de código com IA: de programas escritos a partir de texto a rotinas de ordenação descobertas em assembly." },
      { texto: "Portabilidade, verificação e segurança: x86-64, ARM64 e RISC-V, verificação formal e falhas no código gerado." },
    ],
    resultado:
      "Até aqui: introdução, pergunta, hipótese, delimitação e referencial teórico. Ainda não há metodologia nem resultados. Próximo passo: definir como comparar desempenho e custo total — desenvolvimento, manutenção, portabilidade e verificação — sob os mesmos critérios.",
    numeros: [],
    stack: ["Compiladores", "Assembly", "Código de máquina", "Arquitetura de computadores", "IA generativa para código", "Verificação formal"],
    visual: "pesquisa",
    artigo: "/artigos/codigo-de-maquina-com-ia.pdf",
  },
  {
    slug: "cultiva",
    nome: "Cultiva",
    contexto: "Produto próprio",
    ano: "2026",
    papel: "Produto, arquitetura e desenvolvimento",
    problemaCurto: "Quem planta em pequena escala não tem como planejar a horta.",
    problema:
      "Agricultores domésticos e pequenos produtores raramente têm ferramentas para planejar o cultivo, entender o solo e reagir ao clima — o planejamento fica no caderno ou na memória.",
    solucao: [
      "Um simulador de plantio: você desenha o layout do terreno, configura solo e misturas, planta as culturas e o app simula a evolução — um gêmeo digital da horta.",
      "O motor considera o clima diário real da cidade e emite alertas de geada e de água; o espaçamento entre plantas segue medidas reais.",
    ],
    processo: [
      { texto: "Desenvolvido issue a issue com apoio de IA: cada mudança nasce de uma issue, vira PR e só entra com o CI verde.", ia: true },
      { texto: "Ícones da coleção desenhados com uma skill própria (cultiva-emoji), que mantém o traço da marca em cada novo ícone.", ia: true },
      { texto: "Evoluiu de um protótipo em HTML para uma stack full-stack dockerizada, com o motor de simulação autoritativo em Java no servidor." },
      { texto: "Pronto para produção: logs JSON com request-id, métricas Prometheus e Grafana, trilha de auditoria, ShedLock nos jobs e headers de segurança." },
      { texto: "Autenticação JWT com refresh token em cookie HttpOnly e login com Google." },
    ],
    resultado:
      "Um produto funcional, com frontend, API e banco em containers, testes no CI e a observabilidade de um sistema de produção.",
    numeros: [
      { valor: "56", rotulo: "entregas ligadas a issues" },
      { valor: "3", rotulo: "serviços em Docker Compose" },
      { valor: "7 dias", rotulo: "de clima real no motor" },
    ],
    stack: ["Java", "Spring Boot", "PostgreSQL", "React", "Vite", "JWT", "Prometheus", "Grafana", "Docker", "Vitest"],
    visual: "cultiva",
    telas: [
      {
        imagem: "cultiva-planejador",
        titulo: "Planejador da horta",
        texto:
          "Um gêmeo digital da horta: o cultivador desenha os canteiros em escala real, planta cada cultura e acompanha a simulação do ano inteiro antes de pôr a mão na terra.",
        alt: "Planejador do Cultiva: ferramentas à esquerda; no centro, a grade da horta com tomate, manjericão, cenoura, pimentão, cebola, alho, beterraba, morango e milho; à direita, a análise da cultura e as próximas colheitas.",
      },
      {
        imagem: "cultiva-inspetor",
        painel: true,
        titulo: "Inspetor",
        texto:
          "Cada pedaço do canteiro tem a sua ficha (solo, pH, fertilidade, estágio, colheita prevista e vitalidade), para o cultivador entender o que acontece com cada planta.",
        alt: "Painel Inspetor do Cultiva com a ficha de um pé de tomate: solo humoso, pH 6,6, fertilidade 100/100, estágio de floração (66%), 60 dias de idade, colheita prevista no dia 91 e vitalidade de 100%.",
      },
      {
        imagem: "cultiva-solo",
        painel: true,
        titulo: "Simulador de solo",
        texto:
          "Escolha o tipo de terra e os adubos e veja como pH, fertilidade, retenção de água e drenagem vão ficar ao fim do regime, antes de gastar com insumos.",
        alt: "Painel Simular solo do Cultiva com solo franco, um campo para adicionar insumos e o resultado ao fim do regime: pH 6,5, fertilidade 70/100, retenção de água 60/100, drenagem 65/100 e nenhum risco na mistura.",
      },
      {
        imagem: "cultiva-clima",
        titulo: "Ambiente e clima",
        texto:
          "A cidade liga o clima diário real ao motor de simulação. Com as médias e as mínimas de cada estação, o app avisa sobre geada e falta de água na hora certa.",
        alt: "Janela Ambiente & clima do Cultiva: Anápolis com o clima diário real ativado, data de início do plantio, estação automática, irrigação semanal de 45 mm e a tabela do Cerrado com média, mínima noturna e chuva de cada estação.",
      },
      {
        imagem: "cultiva-guia",
        titulo: "Guia das culturas",
        texto:
          "Catálogo completo com as informações de cada cultura (clima, solo, água, espaçamento e consórcio), capacitando e educando o cultivador.",
        alt: "Guia das culturas do Cultiva com a ficha da abóbora: ciclo de 120 dias, espaçamento de 90 cm, clima e solo ideais, água e irrigação, adubação, como plantar, tempo até a maturidade e consórcio com milho e feijão.",
      },
      {
        imagem: "cultiva-conceitos",
        titulo: "Conceitos",
        texto:
          "Agronomia explicada para quem não é agrônomo: o que é, por que importa e como agir, com fontes como a Embrapa, para o cultivador decidir com conhecimento, não no achismo.",
        alt: "Tela Conceitos do Cultiva com o verbete Análise de solo: o que é, por que importa, no que influencia, como descobrir no seu terreno, como agir e a fonte (Embrapa).",
      },
    ],
    privado: "Repositório privado — código disponível sob pedido.",
  },
  {
    slug: "viaja-mais",
    nome: "Avori",
    contexto: "Projeto Integrador · em equipe",
    ano: "2026",
    papel: "Dono do domínio Social & Descoberta e do módulo de roteiros com IA",
    problemaCurto: "Planejar viagem em grupo se espalha entre planilhas, grupos e apps.",
    problema:
      "Numa viagem em grupo, as informações se perdem entre planilhas, conversas e vários aplicativos: ninguém sabe o roteiro final, quanto cada um deve ou o que os outros já planejaram.",
    solucao: [
      "Uma plataforma única para planejar e gerir viagens em grupo — viagens, finanças compartilhadas, convites e itinerários.",
      "Na minha parte: perfis públicos e privados, seguir e deixar de seguir, busca de pessoas, foto de perfil com enquadramento servida por URL assinada a partir de um bucket privado.",
      "Em seguida, o gerador de roteiros com IA, planejado para a sprint 11 — o protótipo abaixo já funciona.",
    ],
    processo: [
      { texto: "Plano escrito antes de cada entrega da sprint, com requisitos rastreados até os testes em uma matriz de rastreabilidade.", ia: true },
      { texto: "Claude Code com regras do projeto (AGENTS.md e CLAUDE.md): convenções, dono de cada domínio e comandos de verificação.", ia: true },
      { texto: "Revisão adversarial com IA das minhas próprias mudanças, somada a testes de mutação para provar que os testes pegam bugs.", ia: true },
      { texto: "Segurança provada em teste: políticas de RLS do Supabase testadas uma a uma, integração e E2E com Playwright.", ia: true },
      { texto: "Migrations propostas por mim e aprovadas pelo dono do banco, como em um time de verdade.", ia: true },
    ],
    resultado:
      "O domínio social entregue com a segurança verificada por teste: nenhuma política de acesso entra sem um teste que prove que ela bloqueia quem não deveria ver.",
    numeros: [
      { valor: "82/82", rotulo: "testes de RLS" },
      { valor: "62/62", rotulo: "testes de integração" },
      { valor: "25", rotulo: "mutações na revisão" },
    ],
    stack: ["Next.js 16", "React 19", "TypeScript", "Supabase", "PostgreSQL + RLS", "Zod", "Vitest", "Playwright"],
    visual: "viaja",
    telas: [
      {
        imagem: "viaja-roteiro",
        titulo: "Roteiro com IA",
        texto:
          "Seis perguntas sobre destino, datas, grupo, ritmo e orçamento viram um roteiro dia a dia, que o grupo revisa e ajusta antes de criar a viagem.",
        alt: "Assistente de roteiro da Avori: à esquerda, a conversa com as perguntas já respondidas (Lisboa, uma semana, com amigos, ritmo equilibrado e orçamento moderado); à direita, a prévia do roteiro de Lisboa com os dias 1 a 3: chegada e primeiro passeio, os clássicos e um bate-volta.",
      },
      {
        imagem: "viaja-feed",
        titulo: "Feed",
        texto: "Compartilhe suas aventuras com seus amigos e receba inspiração de outras pessoas.",
        alt: "Feed da Avori: publicação de Marina Costa sobre Lisboa, com a foto de um bonde amarelo, o selo de 7 dias, as datas de 12 a 18 de junho e o botão Ver roteiro; ao lado, sugestões de pessoas para seguir e o atalho Pesquisar pessoas.",
      },
      {
        imagem: "viaja-privado",
        titulo: "Perfil privado",
        texto: "Controle sua privacidade e escolha os seus relacionamentos de acordo com o seu perfil.",
        alt: "Perfil de Lucas Andrade na Avori, com o selo Perfil privado, 3 seguidores, 4 seguindo e o botão Solicitado; abaixo, um cadeado e o aviso Esta conta é privada, com a solicitação pendente até ele aprovar.",
      },
      {
        imagem: "viaja-viagens",
        titulo: "Viagens",
        texto:
          "Todas as viagens do grupo em um só lugar, das próximas às que já passaram, cada uma com as suas datas e o seu destino.",
        alt: "Tela Viagens da Avori na aba Todas (5): cartões com foto, destino, datas, situação e orçamento de Lisboa com a turma, Chapada dos Veadeiros, Réveillon no Rio, Pirenópolis no feriado e Buenos Aires de inverno, além do cartão Nova viagem.",
      },
      {
        imagem: "viaja-viagem",
        titulo: "Página da viagem",
        texto:
          "Cada viagem reúne o roteiro dia a dia, os gastos e quem vai: o grupo inteiro planeja no mesmo lugar, sem planilha paralela.",
        alt: "Página da viagem Lisboa com a turma na Avori: capa com o destino, as datas, o orçamento de R$ 24.000,00 e a foto de um mirante de Lisboa; abas Itinerário, Despesas, Lugares e Reservas; o Dia 1 com três atividades e, à direita, o resumo (11 atividades, 5 despesas, 6 dias) e os membros da viagem.",
      },
      {
        imagem: "viaja-acerto",
        titulo: "Acerto de contas",
        texto:
          "O app soma as despesas rateadas e mostra quem deve a quem, com o menor número de transferências para zerar a conta do grupo.",
        alt: "Tela Acerto de contas da Avori: o saldo por membro, com a dona da viagem tendo R$ 16.104,00 a receber e três participantes devendo R$ 5.368,00 cada, e as três transferências sugeridas para zerar os saldos.",
      },
    ],
    repo: "https://github.com/Fernando-Oli/viaja-mais",
    demo: "roteiro",
  },
  {
    slug: "demo-park-api",
    nome: "Demo Park API",
    contexto: "Projeto de estudo · API REST",
    ano: "2026",
    papel: "Desenvolvimento completo do back-end",
    problemaCurto: "Sem sistema, vagas e cobrança por tempo viram anotação no papel.",
    problema:
      "Um projeto de estudo com um problema concreto: um estacionamento precisa saber quais vagas estão livres, registrar a entrada e a saída de cada cliente, cobrar pelo tempo exato de permanência e recompensar quem volta — com permissões diferentes para quem administra e para quem estaciona.",
    solucao: [
      "Uma API REST em Spring Boot com clientes, vagas e estacionamentos. O check-in ocupa a vaga e gera um recibo; o check-out libera a vaga e calcula o custo pela tarifa — R$ 5,00 até 15 minutos, R$ 9,25 até 1 hora e R$ 1,75 a cada 15 minutos extras —, com 30% de desconto a cada 10 estacionamentos do cliente.",
      "Dois perfis de acesso: o administrador gerencia vagas, check-ins e check-outs; o cliente consulta o próprio histórico, paginado, e baixa um relatório em PDF dos seus estacionamentos.",
    ],
    processo: [
      { texto: "Arquitetura em camadas: controllers, services, repositórios JPA e DTOs mapeados com MapStruct, com consultas paginadas por projections." },
      { texto: "Autenticação com JWT e Spring Security, e autorização por perfil em cada endpoint (@PreAuthorize)." },
      { texto: "46 testes de integração cobrindo autenticação, usuários, clientes, vagas e estacionamentos." },
      { texto: "Erros padronizados num handler único — 422 para corpo inválido, conflitos de CPF, usuário e código de vaga — com mensagens em português, inglês e espanhol." },
      { texto: "A base (camadas, exceções e testes de usuário) foi escrita por mim; a partir de agosto, autorização, clientes, vagas e a documentação OpenAPI foram construídas em par com o Claude Code, como registram os commits.", ia: true },
      { texto: "Documentação navegável com OpenAPI (Swagger UI) e relatório em PDF gerado com JasperReports." },
    ],
    resultado:
      "Um back-end completo de estacionamento, do login ao recibo, com as regras de cobrança e de permissão cobertas por testes e uma documentação que dá para explorar no navegador.",
    numeros: [
      { valor: "46", rotulo: "testes de integração" },
      { valor: "2", rotulo: "perfis de acesso" },
      { valor: "3", rotulo: "idiomas nas mensagens" },
    ],
    stack: ["Java 21", "Spring Boot", "Spring Security", "JWT", "Spring Data JPA", "MySQL", "MapStruct", "JasperReports", "OpenAPI"],
    visual: "park",
    repo: "https://github.com/deffmain/Demo-Park-API",
  },
];

export const estudos: { nome: string; descricao: string; stack: string; url: string }[] = [
  { nome: "Login API com JWT", descricao: "Autenticação stateless", stack: "Spring Security · JWT", url: "https://github.com/deffmain/login-backend-spring" },
  { nome: "ShopFast — Plano de Qualidade", descricao: "SQAP com quality gates", stack: "IEEE 730 · ISO 25010 · DORA", url: "https://github.com/deffmain/ShopFast-QualityAssurance" },
  { nome: "Employee Management", descricao: "Persistência sem ORM", stack: "Java · JDBC · PostgreSQL", url: "https://github.com/deffmain/Employee-Management-System" },
  { nome: "Software Engineering Lab", descricao: "Laboratório de system design", stack: "ADRs · requisitos · modelagem", url: "https://github.com/deffmain/software-engineering-lab" },
];

// "Como eu construo" — o processo começa no negócio; `ia: true` põe o selo "IA no processo" na etapa.
export const processo: { titulo: string; texto: string; ia?: boolean }[] = [
  {
    titulo: "Entender o problema",
    texto: "Começo por quem sofre o problema e pelo que precisa mudar. Antes de construir, valido a hipótese com o que já existe: o Dashboard de Suporte nasceu dos chamados e da necessidade de acompanhar os KPIs do atendimento.",
    ia: true,
  },
  {
    titulo: "Especificar",
    texto: "Transformo o problema em spec, tarefas e critérios de aceite. Esse é o contrato do que vai ser entregue.",
    ia: true,
  },
  {
    titulo: "Construir com agentes",
    texto: "Implemento em passos pequenos, com as regras do projeto escritas em AGENTS.md: convenções, limites e como verificar.",
    ia: true,
  },
  {
    titulo: "Provar que funciona",
    texto: "Nada entra sem teste. RLS, E2E e testes de mutação mostram que a regra de negócio se mantém.",
    ia: true,
  },
  {
    titulo: "Automatizar o repetitivo",
    texto: "O que se repete vira procedimento e passa a sair igual toda vez.",
    ia: true,
  },
];

export const trajetoria: { periodo: string; titulo: string; lugar: string }[] = [
  { periodo: "Atual", titulo: "Suporte de TI e implantação do ERP", lugar: "Sysok Sistemas" },
  { periodo: "Atual", titulo: "Criador", lugar: "Cultiva" },
  { periodo: "2026", titulo: "Dev — Social & roteiros com IA", lugar: "Avori · Projeto Integrador" },
  { periodo: "Em curso", titulo: "Engenharia de Software · 7º período", lugar: "UniEVANGÉLICA" },
];

export const stack = ["Java", "Spring Boot", "Spring Security", "PostgreSQL", "Node.js", "TypeScript", "React", "Next.js", "Supabase", "Docker", "Python", "Claude Code"];
