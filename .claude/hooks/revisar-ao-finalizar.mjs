// Hook Stop: quando o Claude termina uma tarefa com código novo, impede o
// encerramento e pede que ele faça duas perguntas ao usuário: (1) se aprova o
// trabalho feito e (2) se deve rodar os revisores (revisor-adversarial +
// revisor-otimizacao e depois planejador-correcoes). Os revisores só rodam com
// um "sim" explícito — eles consomem muito do limite de uso.
// Fluxo completo em .claude/revisoes/LEIA-ME.md.
//
// "Código novo" = mudanças não commitadas nos caminhos de CODIGO que ESTA
// sessão editou (lido do histórico da conversa: Edit/Write/NotebookEdit, ou um
// comando de terminal que cite o arquivo). Arquivos mexidos só por outras
// sessões do Claude no mesmo repositório não contam. Sem acesso ao histórico,
// vale qualquer mudança. A impressão digital é guardada por sessão e ignora as
// linhas com marcações REVISAO[...], então as marcações dos revisores não
// disparam outra revisão.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

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

// --- O que esta sessão editou, segundo o histórico da conversa ---
const norm = (p) => resolve(raiz, p).replace(/\\/g, "/").toLowerCase();
function lerEdicoes(caminho) {
  if (!caminho || !existsSync(caminho)) return null;
  const tocados = new Set();
  const comandos = [];
  for (const linha of readFileSync(caminho, "utf8").split("\n")) {
    if (!linha.includes('"tool_use"')) continue;
    let o;
    try {
      o = JSON.parse(linha);
    } catch {
      continue;
    }
    const blocos = o?.message?.content;
    if (!Array.isArray(blocos)) continue;
    for (const b of blocos) {
      if (b?.type !== "tool_use" || !b.input) continue;
      const alvo = b.input.file_path ?? b.input.notebook_path;
      if (["Edit", "Write", "MultiEdit", "NotebookEdit"].includes(b.name) && alvo) tocados.add(norm(alvo));
      if (["Bash", "PowerShell"].includes(b.name) && b.input.command) comandos.push(String(b.input.command).replace(/\\/g, "/").toLowerCase());
    }
  }
  return { tocados, comandos };
}
const edicoes = lerEdicoes(entrada.transcript_path);
// Um comando de terminal só conta se ESCREVER no arquivo; ler (cat, grep, stat,
// git diff…) não conta.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escreveEm = (c, r) => {
  const f = escape(r);
  const seg = "[^|;&\\n]*"; // dentro do mesmo comando, sem atravessar pipes
  return [
    `sed\\s+-i${seg}${f}`,
    `>>?\\s*["']?[^\\s"']*${f}`,
    `\\btee\\b${seg}${f}`,
    `--write${seg}${f}`,
    `writefilesync\\([^)]*${f}`,
    `(set-content|out-file|add-content)${seg}${f}`,
    `\\b(mv|cp|rm)\\b${seg}${f}`,
    `git\\s+(checkout|restore|apply|stash)\\b${seg}${f}`,
  ].some((p) => new RegExp(p).test(c));
};
const daSessao = (rel) => {
  if (!edicoes) return true; // sem histórico: comportamento antigo
  if (edicoes.tocados.has(norm(rel))) return true;
  const r = rel.toLowerCase();
  return edicoes.comandos.some((c) => escreveEm(c, r));
};

// Só as linhas de conteúdo alteradas, prefixadas pelo arquivo, sem marcações.
const linhas = [];
const arquivos = new Set();
const deOutras = new Set();
let atual = "";
for (const l of diff.replace(/\r\n/g, "\n").split("\n")) {
  if (l.startsWith("diff --git ")) {
    atual = l.split(" b/").pop() ?? l;
    continue;
  }
  if (l.startsWith("+++") || l.startsWith("---")) continue;
  if ((l.startsWith("+") || l.startsWith("-")) && !l.includes(MARCA)) {
    if (!daSessao(atual)) {
      deOutras.add(atual);
      continue;
    }
    linhas.push(`${atual}\t${l}`);
    arquivos.add(atual);
  }
}
for (const f of novos) {
  if (!daSessao(f)) {
    deOutras.add(f);
    continue;
  }
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

// Uma impressão digital por sessão: uma sessão não apaga a da outra.
const digital = createHash("sha256").update(linhas.join("\n")).digest("hex");
const arquivoDigital = join(pasta, ".ultima-revisao");
let porSessao = {};
try {
  const bruto = existsSync(arquivoDigital) ? readFileSync(arquivoDigital, "utf8").trim() : "";
  porSessao = bruto.startsWith("{") ? JSON.parse(bruto) : {}; // formato antigo (só o hash) é descartado
} catch {
  porSessao = {};
}
const sessao = entrada.session_id || "sem-sessao";
if (porSessao[sessao]?.digital === digital) process.exit(0); // já perguntado sobre este código

porSessao[sessao] = { digital, em: new Date().toISOString() };
const recentes = Object.entries(porSessao)
  .sort((a, b) => String(b[1].em).localeCompare(String(a[1].em)))
  .slice(0, 30);
mkdirSync(pasta, { recursive: true });
writeFileSync(arquivoDigital, `${JSON.stringify(Object.fromEntries(recentes), null, 1)}\n`);

const lista = [...arquivos].sort();
const mostrar = lista.slice(0, 25).map((f) => `- ${f}`).join("\n") + (lista.length > 25 ? `\n- … e mais ${lista.length - 25}` : "");

const outras = deOutras.size
  ? `\n(Ignorados por terem sido alterados só por outra sessão: ${[...deOutras].sort().join(", ")}. Não os inclua nas perguntas nem na revisão.)\n`
  : "";

const motivo = `Há código novo nesta tarefa, editado por esta sessão (${lista.length} arquivo(s)):
${mostrar}
${outras}
Antes de encerrar, faça ao usuário estas duas perguntas, juntas, com a ferramenta AskUserQuestion:
1. "O trabalho feito está ok?" — opções: aprovar / precisa de ajustes (o usuário pode descrever o que mudar).
2. "Rodar os revisores (adversarial + otimização) neste código?" — opções: sim / não. Avise que a revisão consome bastante do limite de uso.

Depois:
- Se pediu ajustes, faça os ajustes. Este hook pergunta de novo quando eles terminarem.
- Se respondeu "sim" para os revisores (e aprovou o trabalho), rode em paralelo os subagentes \`revisor-adversarial\` e \`revisor-otimizacao\` com escopo = só os arquivos listados acima; quando os dois terminarem, rode o \`planejador-correcoes\` com os dois relatórios e resuma: caminhos, contagem por severidade e tarefas P0/P1. Não corrija nada sem o usuário pedir.
- Se respondeu "não", não rode nada.

Exceção: se o turno terminou só para fazer uma pergunta ao usuário e a tarefa ainda não está pronta, não pergunte agora; o hook pergunta de novo quando o código mudar.`;

process.stdout.write(
  JSON.stringify({
    decision: "block",
    reason: motivo,
    systemMessage: `Tarefa com ${lista.length} arquivo(s) de código novo — confirmando com você antes de qualquer revisão.`,
  }),
);
