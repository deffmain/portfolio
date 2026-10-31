<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Memória do projeto

Antes de trabalhar, leia `memoria.md` (raiz do projeto): quem é o usuário, as
regras combinadas com ele, as decisões de design já tomadas e o que está em
andamento.

## Revisão automática de código

Ao terminar uma tarefa com código novo, o hook `Stop`
(`.claude/hooks/revisar-ao-finalizar.mjs`) pede ao Claude duas perguntas ao
usuário: se aprova o trabalho e se deve rodar os revisores. Só com um "sim"
rodam `revisor-adversarial` e `revisor-otimizacao` em paralelo e, depois,
`planejador-correcoes`, que transforma os relatórios em tarefas. O fluxo, o formato das marcações
`REVISAO[...]`, as escalas e os modelos de relatório e tarefas estão em
`.claude/revisoes/LEIA-ME.md`. Ao corrigir um achado, remova a marcação dele no
mesmo commit.
