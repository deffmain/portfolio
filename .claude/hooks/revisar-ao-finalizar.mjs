// Hook Stop: quando o Claude termina uma tarefa com código novo, impede o
// encerramento e pede que ele faça duas perguntas ao usuário: (1) se aprova o
// trabalho feito e (2) se deve rodar os revisores (revisor-adversarial +
// revisor-otimizacao e depois planejador-correcoes). Os revisores só rodam com
// um "sim" explícito — eles consomem muito do limite de uso.
// Fluxo completo em .claude/revisoes/LEIA-ME.md.
//
// "Código novo" = mudanças não commitadas nos caminhos de CODIGO. A impressão
// digital ignora as linhas com marcações REVISAO[...] e os números de linha,
// então as marcações inseridas pelos revisores não disparam outra revisão.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const CODIGO = [
  "app",
  "components",
  "lib",
  "content",
  "public",
  "next.config.ts",
  "package.json",
  "tsconfig.json",
  "eslint.config.mjs",
  "postcss.config.mjs",
];
const MARCA = "REVISAO[";

function lerEntrada() {
  try {
    return JSON.parse(readFileSync(0, "utf8") || "{}");
  } catch {
    return {};
  }
}

const entrada = lerEntrada();
// O Claude já está continuando por causa deste hook: não bloquear de novo.
if (entrada.stop_hook_active) process.exit(0);

const raiz = process.env.CLAUDE_PROJECT_DIR || entrada.cwd || process.cwd();
const pasta = join(raiz, ".claude", "revisoes");
if (existsSync(join(pasta, "PAUSADO"))) process.exit(0);

const git = (...args) =>
  execFileSync("git", args, { cwd: raiz, encoding: "utf8", maxBuffer: 64 * 1024 * 1024, stdio: ["ignore", "pipe", "ignore"] });

let diff;
let novos;
try {
  diff = git("diff", "HEAD", "--no-color", "--no-ext-diff", "-U0", "--", ...CODIGO);
  novos = git("ls-files", "--others", "--exclude-standard", "--", ...CODIGO).split("\n").filter(Boolean);
} catch {
  process.exit(0); // fora de um repositório Git (ou sem commit): não há como comparar
}

// Só as linhas de conteúdo alteradas, prefixadas pelo arquivo, sem marcações.
const linhas = [];
const arquivos = new Set();
let atual = "";
for (const l of diff.replace(/\r\n/g, "\n").split("\n")) {
  if (l.startsWith("diff --git ")) {
    atual = l.split(" b/").pop() ?? l;
    continue;
  }
  if (l.startsWith("+++") || l.startsWith("---")) continue;
  if ((l.startsWith("+") || l.startsWith("-")) && !l.includes(MARCA)) {
    linhas.push(`${atual}\t${l}`);
    arquivos.add(atual);
  }
}
for (const f of novos) {
  let conteudo = "";
  try {
    conteudo = readFileSync(join(raiz, f), "utf8");
  } catch {
    continue;
  }
  const util = conteudo
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => !l.includes(MARCA))
    .join("\n");
  linhas.push(`${f}\t${createHash("sha256").update(util).digest("hex")}`);
  arquivos.add(f);
}

if (!linhas.length) process.exit(0); // nada de código novo

const digital = createHash("sha256").update(linhas.join("\n")).digest("hex");
const arquivoDigital = join(pasta, ".ultima-revisao");
const anterior = existsSync(arquivoDigital) ? readFileSync(arquivoDigital, "utf8").trim() : "";
if (anterior === digital) process.exit(0); // este código já foi revisado

mkdirSync(pasta, { recursive: true });
writeFileSync(arquivoDigital, `${digital}\n`);

const lista = [...arquivos].sort();
const mostrar = lista.slice(0, 25).map((f) => `- ${f}`).join("\n") + (lista.length > 25 ? `\n- … e mais ${lista.length - 25}` : "");

const motivo = `Há código novo nesta tarefa (${lista.length} arquivo(s)):
${mostrar}

Antes de encerrar, faça ao usuário estas duas perguntas, juntas, com a ferramenta AskUserQuestion:
1. "O trabalho feito está ok?" — opções: aprovar / precisa de ajustes (o usuário pode descrever o que mudar).
2. "Rodar os revisores (adversarial + otimização) neste código?" — opções: sim / não. Avise que a revisão consome bastante do limite de uso.

Depois:
- Se pediu ajustes, faça os ajustes. Este hook pergunta de novo quando eles terminarem.
- Se respondeu "sim" para os revisores (e aprovou o trabalho), rode em paralelo os subagentes \`revisor-adversarial\` e \`revisor-otimizacao\` com escopo = estas mudanças não commitadas; quando os dois terminarem, rode o \`planejador-correcoes\` com os dois relatórios e resuma: caminhos, contagem por severidade e tarefas P0/P1. Não corrija nada sem o usuário pedir.
- Se respondeu "não", não rode nada.

Exceção: se o turno terminou só para fazer uma pergunta ao usuário e a tarefa ainda não está pronta, não pergunte agora; o hook pergunta de novo quando o código mudar.`;

process.stdout.write(
  JSON.stringify({
    decision: "block",
    reason: motivo,
    systemMessage: `Tarefa com ${lista.length} arquivo(s) de código novo — confirmando com você antes de qualquer revisão.`,
  }),
);
