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
    "Desenvolvedor na Sysok e estudante de Engenharia de Software. Transformo problemas de operação — suporte, treinamento, planejamento — em ferramentas que as pessoas usam no dia a dia.",
  sobre: [
    "Trabalho na Sysok com suporte, implantação do ERP e desenvolvimento de soluções internas. Estar perto de quem usa o sistema me ensinou a começar pelo problema e só depois escolher a tecnologia.",
    "Minha base é Java e Spring Boot, com APIs, autenticação e bancos relacionais; no front, React e Next.js. Hoje uso IA como parte do processo de engenharia — para especificar, implementar, revisar e automatizar — e sigo um plano de estudos para me tornar AI Engineer.",
  ],
};

export type SecaoId = "inicio" | "solucoes" | "processo" | "sobre" | "contato";

export const secoes: { id: SecaoId; label: string; descricao: string }[] = [
  { id: "inicio", label: "Início", descricao: "Topo da página" },
  { id: "solucoes", label: "Soluções", descricao: "Índice do que construí" },
  { id: "processo", label: "Processo", descricao: "Como construo, com IA no processo" },
  { id: "sobre", label: "Sobre", descricao: "Trajetória e stack" },
  { id: "contato", label: "Contato", descricao: "E-mail e GitHub" },
];

export type Visual = "dashboard" | "manuais" | "cultiva" | "viaja" | "park";

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
  repo?: string;
  privado?: string;
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
      { texto: "Zero dependências: Node 20 puro no servidor, HTML, CSS e JS no front, gráficos em SVG." },
      { texto: "O token do GitHub nunca chega ao navegador; login via GitHub App e container Docker endurecido." },
      { texto: "Testes automatizados com node:test e pipeline de CI." },
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
    privado: "Ferramenta interna da Sysok — código privado.",
  },
  {
    slug: "manuais-de-implantacao",
    nome: "Manuais de implantação",
    contexto: "Sysok Sistemas · treinamento de clientes",
    ano: "2026",
    papel: "Conteúdo, padrão visual e automação",
    problemaCurto: "Cada cliente novo aprendia o ERP do zero, com materiais sem padrão.",
    problema:
      "Na implantação do ERP, o treinamento dependia de explicação ao vivo e de documentos feitos cada um de um jeito — difíceis de manter, de reaproveitar e de entregar com cara profissional.",
    solucao: [
      "Uma série de manuais passo a passo cobrindo os fluxos que o cliente usa no dia a dia: vendas, orçamentos, pedidos de compra, cadastros, permissões de usuários, ordens de serviço e recebimento em terminais integrados.",
      "Todos com a mesma identidade visual: capa, faixas na cor da marca, capturas de tela emolduradas, blocos de destaque, cabeçalho e rodapé com autor, data e paginação.",
    ],
    processo: [
      { texto: "Criei uma skill de IA (sysok-docs) que aplica o padrão da empresa a partir de rascunhos, anotações e prints — a formatação repetitiva virou automação.", ia: true },
      { texto: "O conteúdo é escrito por mim a partir do uso real do sistema na implantação; a IA cuida da estrutura e da consistência visual.", ia: true },
      { texto: "Um padrão único para procedimentos, treinamentos e materiais de cliente — qualquer pessoa da equipe consegue gerar um manual novo no mesmo formato." },
    ],
    resultado:
      "Onze manuais publicados com o mesmo padrão, prontos para treinar clientes e novos colaboradores sem depender de explicação ao vivo.",
    numeros: [
      { valor: "11", rotulo: "manuais publicados" },
      { valor: "1", rotulo: "padrão visual automatizado" },
      { valor: "7+", rotulo: "módulos do ERP cobertos" },
    ],
    stack: ["Skill de IA personalizada", "Word (.docx)", "Identidade visual Sysok", "Documentação técnica"],
    visual: "manuais",
    privado: "Material interno da Sysok.",
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
    privado: "Repositório privado — código disponível sob pedido.",
  },
  {
    slug: "viaja-mais",
    nome: "Viaja+",
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
      { texto: "Plano escrito antes de cada entrega da sprint, com requisitos rastreados até os testes em uma matriz de rastreabilidade." },
      { texto: "Claude Code com regras do projeto (AGENTS.md e CLAUDE.md): convenções, dono de cada domínio e comandos de verificação.", ia: true },
      { texto: "Revisão adversarial com IA das minhas próprias mudanças, somada a testes de mutação para provar que os testes pegam bugs.", ia: true },
      { texto: "Segurança provada em teste: políticas de RLS do Supabase testadas uma a uma, integração e E2E com Playwright." },
      { texto: "Migrations propostas por mim e aprovadas pelo dono do banco, como em um time de verdade." },
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

// "Como eu construo" — a IA aparece aqui, como método.
export const processo: { titulo: string; texto: string; evidencia: string }[] = [
  {
    titulo: "Entender o problema",
    texto: "Começo por quem sofre o problema. Requisitos e decisões ficam registrados antes de existir código.",
    evidencia: "Catálogo de requisitos no Viaja+ · ADRs no Software Engineering Lab",
  },
  {
    titulo: "Especificar",
    texto: "Spec, tarefas e critérios de aceite primeiro. A especificação vira o contrato que eu e a IA seguimos.",
    evidencia: "Spec-driven no Dashboard de Suporte · planos por sprint no Viaja+",
  },
  {
    titulo: "Construir com agentes",
    texto: "Uso Claude Code com as regras do projeto em AGENTS.md: convenções, limites e comandos de verificação. A IA implementa em passos pequenos; eu dirijo e reviso.",
    evidencia: "AGENTS.md e CLAUDE.md nos projetos · PRs ligados a issues no Cultiva",
  },
  {
    titulo: "Provar que funciona",
    texto: "Peço para a IA atacar o próprio código: revisão adversarial, testes de mutação, RLS e E2E. Nada entra sem teste.",
    evidencia: "82/82 testes de RLS e 25 mutações no Viaja+",
  },
  {
    titulo: "Automatizar o repetitivo",
    texto: "Quando uma tarefa se repete, ela vira uma skill de IA — e passa a sair igual toda vez.",
    evidencia: "Skills sysok-docs, cultiva-emoji e procedimento-padrao-estudos",
  },
];

export const trajetoria: { periodo: string; titulo: string; lugar: string }[] = [
  { periodo: "Atual", titulo: "Suporte, implantação e desenvolvimento", lugar: "Sysok Sistemas" },
  { periodo: "Atual", titulo: "Criador", lugar: "Cultiva" },
  { periodo: "2026", titulo: "Dev — Social & roteiros com IA", lugar: "Viaja+ · Projeto Integrador" },
  { periodo: "Em curso", titulo: "Engenharia de Software · 7º período", lugar: "UniEVANGÉLICA" },
  { periodo: "Em curso", titulo: "Plano de 12 meses para AI Engineer", lugar: "Estudo independente" },
];

export const stack = ["Java", "Spring Boot", "Spring Security", "PostgreSQL", "Node.js", "TypeScript", "React", "Next.js", "Supabase", "Docker", "Python", "Claude Code"];
