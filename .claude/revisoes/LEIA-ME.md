# Revisões automáticas

Todo código novo passa por dois revisores antes de ser dado como pronto, e o
resultado vira uma lista de tarefas de correção.

```
código finalizado
      │  hook Stop (.claude/hooks/revisar-ao-finalizar.mjs)
      ▼
revisor-adversarial ─┐   (em paralelo; cada um marca o código e gera um relatório)
revisor-otimizacao ──┤
                     ▼
            planejador-correcoes   (lê os relatórios e gera as tarefas)
                     ▼
   correções — só quando o usuário pedir; quem corrige remove a marcação
```

## Quando roda

- **Ao terminar uma tarefa:** o hook compara as mudanças de código ainda não
  commitadas (`app/`, `components/`, `lib/`, `content/` e configs) com as da
  última vez. Se houver código novo, o Claude faz **duas perguntas** ao usuário:
  1. se o trabalho feito está ok (aprovar ou pedir ajustes);
  2. se deve rodar os revisores.

  Os revisores **só rodam com um "sim"**, porque consomem bastante do limite de
  uso. Se o usuário pedir ajustes, o hook pergunta de novo quando eles
  terminarem. Marcações de rastreabilidade não contam como código novo.
- **Só o que a própria sessão editou:** o hook lê o histórico da conversa e só
  considera os arquivos que aquela sessão alterou. Contam o Edit, o Write e os
  comandos de terminal que escrevem no arquivo (`sed -i`, `>`, `tee`, `--write`
  e outros); comandos que só leem não contam. Arquivos alterados só por outra
  sessão do Claude no mesmo repositório são ignorados. A impressão digital fica
  guardada por sessão em `.ultima-revisao`. Sem acesso ao histórico, o hook
  considera todas as mudanças.
- **Manual:** peça "rode os revisores no código alterado", "revise o projeto
  inteiro" ou "planeje as correções do último relatório".
- **Pausar:** crie um arquivo vazio `.claude/revisoes/PAUSADO`. Apague para religar.

## Arquivos desta pasta

| Arquivo | O que é |
|---|---|
| `AAAA-MM-DD-HHMM-adversarial.md` | relatório do revisor adversarial |
| `AAAA-MM-DD-HHMM-otimizacao.md` | relatório do revisor de otimização |
| `AAAA-MM-DD-HHMM-tarefas.md` | tarefas montadas pelo planejador |
| `MODELO-RELATORIO.md` | formato obrigatório dos relatórios |
| `MODELO-TAREFAS.md` | formato obrigatório das tarefas |
| `.ultima-revisao` | impressão digital do último código revisado (não editar) |
| `PAUSADO` | se existir, a revisão automática fica desligada |

Os relatórios e as tarefas ficam **fora do Git** (ver `.gitignore`): podem
descrever falhas de segurança ainda não corrigidas, e o repositório é público.

## Marcação de rastreabilidade

Cada achado ganha um comentário no código, na linha logo acima do problema,
apontando para o relatório:

```
REVISAO[<ID>] <severidade> — <resumo curto> → .claude/revisoes/<relatório>.md
```

- **ID:** `ADV-AAAAMMDD-HHMM-NN` (adversarial) ou `OTM-AAAAMMDD-HHMM-NN`
  (otimização). `AAAAMMDD-HHMM` é o carimbo do relatório; `NN` é sequencial
  dentro dele (01, 02…).
- **Sintaxe do comentário conforme o lugar:**
  - TypeScript/JavaScript: `// REVISAO[...] ...`
  - Dentro de JSX (entre elementos): `{/* REVISAO[...] ... */}`
  - CSS: `/* REVISAO[...] ... */`
  - Markdown/HTML: `<!-- REVISAO[...] ... -->`
  - JSON (não aceita comentários): **sem marcação**; o relatório registra o local exato.
- **Regras:**
  - A marcação ocupa uma linha só dela e nunca altera o código: nada de
    reformatar, mover ou apagar linhas.
  - Nunca dentro de strings, template literals ou atributos JSX. Se o ponto
    exato não aceita comentário, marque a instrução que o contém e registre a
    linha exata no relatório.
  - Um achado tem uma marcação principal. Se o mesmo problema aparece em
    outros lugares, eles recebem o mesmo ID com `(também)` no resumo.
  - Depois de marcar, o revisor roda `npx eslint` nos arquivos tocados para
    garantir que nada quebrou.
- **Ciclo de vida:** a marcação é temporária. Quem corrige o problema remove a
  marcação no mesmo commit. Para listar as abertas:

  ```
  git grep -n "REVISAO\["
  ```

  Antes de um commit que vai para produção, essa busca deve voltar vazia, ou as
  marcações restantes devem ser intencionais.

## Escalas comuns

**Severidade**

| Nível | Quando usar |
|---|---|
| `crítica` | quebra o build ou o site, vaza segredo, permite abuso com custo (ex.: cota de IA), perde dados. Corrigir antes de qualquer deploy. |
| `alta` | bug visível num fluxo principal (home, carrossel, estudo de caso, paleta, demo de IA), bloqueio de acessibilidade, regressão de desempenho perceptível (LCP > 2,5 s, INP > 200 ms, CLS > 0,1). |
| `média` | bug em caso de borda, inconsistência, desperdício mensurável sem efeito visível. |
| `baixa` | polimento, código frágil, ganho pequeno. |
| `info` | observação sem ação obrigatória. |

**Confiança**

| Nível | Significado |
|---|---|
| `confirmada` | reproduzida ou medida; a evidência está no relatório. |
| `provável` | evidência forte no código, mas não reproduzida. |
| `hipótese` | precisa de verificação; o relatório diz como verificar. |

**Prioridade das tarefas** (definida pelo planejador): `P0` corrigir já ·
`P1` antes do próximo deploy · `P2` em seguida · `P3` quando houver tempo.
