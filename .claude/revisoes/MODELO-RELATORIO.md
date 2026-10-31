<!--
Modelo obrigatório dos relatórios do revisor-adversarial e do revisor-otimizacao.
Copie a estrutura e preencha tudo. Seções sem conteúdo continuam no relatório
com "Nenhum." — nunca apague uma seção. Regras de marcação, severidade e
confiança: .claude/revisoes/LEIA-ME.md
-->

# Relatório de revisão — <Adversarial | Otimização> — <AAAA-MM-DD HH:MM>

## 1. Metadados

| Campo | Valor |
|---|---|
| Revisor | `revisor-adversarial` \| `revisor-otimizacao` |
| Carimbo | `AAAAMMDD-HHMM` (prefixo dos IDs deste relatório) |
| Escopo | mudanças não commitadas \| projeto inteiro \| arquivos pedidos |
| Commit base | `<hash curto> <mensagem>` (`git log -1 --oneline`) |
| Arquivos no escopo | <n> — lista completa na seção 3 |
| Ambiente | Node `<versão>` · Next `<versão>` · SO `<sistema>` · navegador de teste `<se usado>` |
| Duração da revisão | <minutos> |

## 2. Resumo executivo

<3 a 6 linhas: o estado geral do código revisado, os riscos mais importantes e
o que precisa acontecer antes do próximo deploy.>

| Severidade | Quantidade |
|---|---|
| crítica | 0 |
| alta | 0 |
| média | 0 |
| baixa | 0 |
| info | 0 |

| ID | Severidade | Confiança | Categoria | Local | Título |
|---|---|---|---|---|---|
| ADV-AAAAMMDD-HHMM-01 | alta | confirmada | correção | `components/x.tsx:42` | <título curto> |

## 3. Escopo detalhado

| Arquivo | Situação | Linhas (+/−) | Lido por inteiro? |
|---|---|---|---|
| `components/x.tsx` | modificado \| novo \| contexto (não mudou, mas foi lido) | +12 / −3 | sim |

## 4. Comandos executados

| # | Comando | Resultado | Duração | Observação |
|---|---|---|---|---|
| 1 | `npx tsc --noEmit` | ok \| falhou (n erros) | 9 s | <resumo da saída> |

## 5. Achados

<!-- Um bloco por achado, na ordem da tabela da seção 2 (mais grave primeiro). -->

### ADV-AAAAMMDD-HHMM-01 · <título curto e específico>

| Campo | Valor |
|---|---|
| Severidade | crítica \| alta \| média \| baixa \| info |
| Confiança | confirmada \| provável \| hipótese |
| Categoria | <ver lista de categorias do revisor> |
| Local principal | `caminho/arquivo.tsx:linha` — função/componente `<nome>` |
| Outros locais | `caminho:linha`, … \| — |
| Marcação | inserida em `caminho:linha` \| não inserida (motivo) |
| Origem | código novo deste diff \| pré-existente, exposto pelo diff \| pré-existente |
| Afeta | desktop \| celular \| leitor de tela \| produção (Vercel) \| build \| … |

**O que acontece**
<descrição objetiva do defeito ou desperdício, sem jargão desnecessário.>

**Evidência**
```tsx
// trecho exato do código (com números de linha), só o necessário
```
<passos de reprodução numerados, comando executado e saída relevante, ou medição.
Resultado observado × resultado esperado.>

**Impacto**
<quem é afetado, em que situação, com que frequência e quão grave. Para
otimização: a métrica e o tamanho do efeito.>

**Medição** <!-- obrigatória no revisor-otimizacao; opcional no adversarial -->
| Métrica | Valor atual | Como foi medido | Meta / referência |
|---|---|---|---|
| <LCP, INP, CLS, TBT, KB de JS, ms de CPU por quadro, memória, custo de função…> | <valor> | <ferramenta e condições> | <valor> |

**Causa raiz**
<por que acontece, citando a regra da API, do navegador ou da biblioteca.>

**Direção da correção**
<o que mudar, sem implementar. Alternativas e trade-offs, quando houver.
Não propor remover efeitos visuais que o usuário escolheu (carrossel 3D,
campo de tokens…): propor a versão segura ou mais barata.>

**Como validar a correção**
<comando, teste ou passo no navegador que prova que foi corrigido, com o
resultado esperado.>

**Referências**
<docs locais do Next (`node_modules/next/dist/docs/...`), React, MDN, WCAG, web.dev…>

**Relacionados**
<IDs deste ou do outro relatório com a mesma causa ou efeito \| —>

## 6. Verificado e sem problemas

<lista do que foi checado e passou, para o planejador saber o que já está
coberto. Ex.: "rotas /api: corpo inválido retorna 400 — testado com curl".>

## 7. Não verificado e limitações

<o que ficou de fora e por quê (sem servidor rodando, sem celular real, sem
chave de IA…), e o que deveria ser verificado depois.>

## 8. Marcações inseridas

| ID | Arquivo:linha | Texto da marcação |
|---|---|---|
| ADV-AAAAMMDD-HHMM-01 | `components/x.tsx:41` | `// REVISAO[ADV-…-01] alta — … → .claude/revisoes/…` |

Conferência: `git grep -n "REVISAO\[ADV-AAAAMMDD-HHMM"` → <n> ocorrências.

## 9. Anexos

<caminhos de capturas de tela, logs e scripts temporários usados (fora do repositório).>
