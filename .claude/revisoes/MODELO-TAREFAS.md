<!--
Modelo obrigatório da lista de tarefas gerada pelo planejador-correcoes.
Cada tarefa precisa se sustentar sozinha: quem pegar uma tarefa não deve
precisar abrir o relatório para entender o que fazer (mas o link fica lá).
Regras de marcação, severidade e prioridade: .claude/revisoes/LEIA-ME.md
-->

# Tarefas de correção — <AAAA-MM-DD HH:MM>

## 1. Origem

| Relatório | Achados | Considerados | Agrupados | Descartados |
|---|---|---|---|---|
| `.claude/revisoes/AAAA-MM-DD-HHMM-adversarial.md` | <n> | <n> | <n> | <n> |
| `.claude/revisoes/AAAA-MM-DD-HHMM-otimizacao.md` | <n> | <n> | <n> | <n> |

Commit base na hora do planejamento: `<hash curto>` · marcações abertas encontradas: <n>

## 2. Resumo

| Tarefa | Prioridade | Título | Origem | Esforço | Depende de | Responsável |
|---|---|---|---|---|---|---|
| T-01 | P0 | <título> | ADV-…-01, OTM-…-03 | P \| M \| G | — | Claude \| usuário |

**Ordem sugerida:** <sequência, com o motivo: dependências, mesmo arquivo,
risco. Ex.: "T-02 antes de T-05 porque ambas mexem em helice.tsx".>

**Arquivos compartilhados:** <tarefas que tocam `components/helice.tsx`,
`components/home.tsx`, `app/page.tsx` ou `app/globals.css`, que outras sessões
do Claude costumam editar. Conferir antes de começar.>

## 3. Precisa de decisão do usuário

<achados em que os revisores discordam, que mudam algo visível de propósito,
que dependem de conta ou configuração externa (Vercel, chaves de API) ou que
têm mais de um caminho razoável. Para cada um: a pergunta, as opções e uma
recomendação. \| Nenhum.>

## 4. Tarefas

### T-01 · <verbo no infinitivo + objeto: "Validar o tamanho da pergunta em /api/comando">

| Campo | Valor |
|---|---|
| Prioridade | P0 \| P1 \| P2 \| P3 — <justificativa em uma frase> |
| Origem | `ADV-…-01` ([relatório](AAAA-MM-DD-HHMM-adversarial.md)), `OTM-…-03` |
| Severidade de origem | <a mais alta entre as origens> |
| Arquivos | `caminho:linha`, … |
| Esforço | P (< 30 min) \| M (< 2 h) \| G (mais que isso; considere dividir) |
| Depende de | T-xx \| — |
| Responsável | Claude \| usuário (ex.: variável de ambiente na Vercel) |
| Arquivo compartilhado? | sim (qual) \| não |

**Contexto**
<o que é a parte do sistema envolvida, como funciona hoje, o que está errado e
por que importa para o portfólio. Inclua o trecho de código atual e as
restrições da stack que pesam aqui (Next 16, React 19, cacheComponents,
ViewTransition…). Escreva para quem nunca viu o relatório.>

**Tarefa**
1. <passo concreto>
2. <passo concreto>

**Não fazer**
<o que fica fora do escopo e o que não pode mudar (comportamento, visual,
outros arquivos).>

**Critérios de aceite**
- [ ] <condição verificável>
- [ ] Marcações removidas: `REVISAO[ADV-…-01]`, `REVISAO[OTM-…-03]`

**Modo de validação**
```
<comandos exatos, em ordem; ex.:>
npx eslint <arquivos>
npx tsc --noEmit
npm run build
git grep -n "REVISAO\[ADV-…-01\]"   # deve voltar vazio
```
<checagens no navegador ou com curl: o que fazer e o resultado esperado; em
quais larguras (1440 px / 390 px); com e sem `prefers-reduced-motion`.>

**Riscos e efeitos colaterais**
<o que pode quebrar com a correção e como perceber; plano de volta (reverter
o commit X). \| Baixo: <motivo>.>

**Prompt pronto**
> <texto autocontido para colar numa sessão do Claude e executar só esta
> tarefa: contexto curto, o que fazer, o que não fazer e como validar.>

## 5. Achados agrupados ou descartados

| ID | Destino | Motivo |
|---|---|---|
| OTM-…-02 | agrupado em T-01 | mesma causa raiz de ADV-…-01 |
| ADV-…-04 | descartado | desatualizado: o código já não é mais assim (conferido em `arquivo:linha`) |
| OTM-…-05 | sem tarefa | severidade info, sem ação |

## 6. Marcações

| ID | Arquivo:linha | Tarefa |
|---|---|---|
| ADV-…-01 | `components/x.tsx:41` | T-01 |

Marcações sem achado correspondente (órfãs): <lista \| nenhuma>. Achados sem
marcação: <lista com motivo \| nenhum>.
