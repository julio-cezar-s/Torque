// Servidor da Torque · Gestão de Oficina Automotiva
// Express + PostgreSQL (pg). Expõe a API REST usada pelo app
// (oficina-gestao.jsx), com autenticação de verdade:
//   - a senha do admin fica só em variável de ambiente (nunca no navegador)
//   - a senha do cliente é guardada com hash (bcrypt), nunca em texto puro
//   - cada login gera um token; cada rota de dados exige um token válido
//
// Como rodar:
//   npm install
//   defina DATABASE_URL no .env (ver .env.example)
//   npm run server        (inicia a API em http://localhost:3001)
//   npm run dev            (inicia o front-end, em outro terminal)
//
// Antes de ir pra produção, defina ADMIN_EMAIL e ADMIN_SENHA no .env
// com um e-mail/senha seus (não deixe o padrão admin123 em um site público).

import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("Faltou definir DATABASE_URL no .env — veja o .env.example.");
  process.exit(1);
}

// Conexões locais (localhost) não precisam de SSL; bancos gerenciados na
// nuvem (Render, etc.) exigem. rejectUnauthorized:false porque certificados
// desses provedores costumam ser autoassinados/intermediários.
const ehLocal = process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: ehLocal ? false : { rejectUnauthorized: false },
});

// Credenciais do admin: só existem aqui no servidor, nunca são enviadas
// para o navegador. Configure no .env antes de publicar o site.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@torque.com.br").trim().toLowerCase();
const ADMIN_SENHA = process.env.ADMIN_SENHA || "admin123";
const ADMINS = [
  { email: ADMIN_EMAIL, senha: ADMIN_SENHA },
  { email: (process.env.ADMIN2_EMAIL || "").trim().toLowerCase(), senha: process.env.ADMIN2_SENHA || "" },
].filter((a) => a.email && a.senha);

// Colunas de cada entidade, na ordem em que serão gravadas.
// Precisa bater exatamente com os campos usados no app.
const ENTIDADES = {
  clientes: ["id", "nome", "telefone", "email", "senha"],
  veiculos: ["id", "clienteId", "placa", "marca", "modelo", "ano", "cor"],
  ordens: ["id", "numero", "clienteId", "veiculoId", "status", "descricao", "mecanico", "dataEntrada", "previsao", "itens"],
  estoque: ["id", "nome", "codigo", "quantidade", "quantidadeMinima", "preco", "imagem"],
  servicos: ["id", "nome", "categoria", "descricao", "preco", "duracao"],
  agendamentos: ["id", "clienteId", "veiculoId", "servicoId", "data", "hora", "observacoes", "status"],
  mensagens: ["id", "nome", "email", "telefone", "assunto", "mensagem", "data", "lida"],
  pagamentos: ["id", "ordemId", "valor", "forma", "data", "obs"],
  avaliacoes: ["id", "ordemId", "clienteId", "nota", "comentario", "data"],
  conversas: ["id", "clienteId", "clienteNome", "mensagens"],
};

// Quem pode ler (GET) e quem pode gravar (PUT) cada entidade pela rota
// genérica /api/:entidade. "publico" = não precisa estar logado.
// "autenticado" = precisa de qualquer sessão válida (admin ou cliente).
// "admin" = só o admin.
const ACESSO = {
  clientes: { get: "autenticado", put: "autenticado" }, // put restrito ao próprio registro — ver clientePodeGravar()
  veiculos: { get: "autenticado", put: "autenticado" },
  ordens: { get: "autenticado", put: "admin" },
  estoque: { get: "autenticado", put: "admin" },
  servicos: { get: "publico", put: "admin" },
  agendamentos: { get: "autenticado", put: "autenticado" },
  mensagens: { get: "admin", put: "admin" },
  pagamentos: { get: "autenticado", put: "admin" },
  avaliacoes: { get: "autenticado", put: "autenticado" },
  conversas: { get: "autenticado", put: "autenticado" },
};

// Campos que guardam um array/objeto e precisam de JSON.stringify/parse
// (o Postgres tem tipo JSON nativo, mas mantemos TEXT por simplicidade —
// é exatamente como o app já trabalha com esses dados em memória).
const CAMPOS_JSON = { ordens: ["itens"], conversas: ["mensagens"] };

// No Postgres, identificador sem aspas é convertido pra minúsculas
// automaticamente — por isso toda coluna camelCase (ex: clienteId) precisa
// ir entre aspas duplas em toda query, pra preservar a grafia exata.
const q = (coluna) => `"${coluna}"`;

function linhaParaObjeto(entidade, linha) {
  const obj = { ...linha };
  for (const campo of CAMPOS_JSON[entidade] || []) {
    try { obj[campo] = JSON.parse(obj[campo] ?? "[]"); } catch { obj[campo] = []; }
  }
  return obj;
}

function objetoParaLinha(entidade, obj) {
  const linha = {};
  for (const campo of ENTIDADES[entidade]) {
    let valor = obj[campo];
    if ((CAMPOS_JSON[entidade] || []).includes(campo)) valor = JSON.stringify(valor ?? []);
    else if (valor === undefined) valor = null;
    linha[campo] = valor;
  }
  return linha;
}

async function listarTudo(entidade) {
  const { rows } = await pool.query(`SELECT * FROM ${entidade}`);
  return rows.map((l) => linhaParaObjeto(entidade, l));
}

// Sincroniza a tabela com o array recebido, SEM apagar e reinserir linhas
// que continuam existindo. Isso é essencial: como o app manda a coleção
// inteira a cada "salvar", um DELETE+INSERT ingênuo dispararia as ações de
// ON DELETE (CASCADE / SET NULL) para toda linha — inclusive as que voltam
// com o mesmo id um instante depois — quebrando vínculos de outras tabelas
// só por editar um campo. Por isso: só INSERT para ids novos, UPDATE para
// ids que já existiam, e DELETE apenas para ids que de fato saíram da lista.
async function substituirTudo(client, entidade, itensNovos) {
  const colunas = ENTIDADES[entidade];
  const colunasSemId = colunas.filter((c) => c !== "id");

  const idsNovos = new Set(itensNovos.map((item) => item.id));
  const { rows: atuaisRows } = await client.query(`SELECT id FROM ${entidade}`);
  const idsAtuais = atuaisRows.map((r) => r.id);

  for (const idAtual of idsAtuais) {
    if (!idsNovos.has(idAtual)) await client.query(`DELETE FROM ${entidade} WHERE id = $1`, [idAtual]);
  }

  for (const item of itensNovos) {
    const linha = objetoParaLinha(entidade, item);
    const existe = idsAtuais.includes(item.id);
    if (existe) {
      const setClause = colunasSemId.map((c, i) => `${q(c)} = $${i + 2}`).join(", ");
      const valores = [item.id, ...colunasSemId.map((c) => linha[c])];
      await client.query(`UPDATE ${entidade} SET ${setClause} WHERE id = $1`, valores);
    } else {
      const placeholders = colunas.map((_, i) => `$${i + 1}`).join(", ");
      const valores = colunas.map((c) => linha[c]);
      await client.query(`INSERT INTO ${entidade} (${colunas.map(q).join(", ")}) VALUES (${placeholders})`, valores);
    }
  }
}

async function substituirTudoTransacao(entidade, itensNovos) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await substituirTudo(client, entidade, itensNovos);
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

// Antes de gravar clientes, troca senha em texto puro por hash. Se a senha
// vier vazia (usuário não mexeu nesse campo), mantém o hash que já existia
// no banco em vez de apagar a senha da pessoa sem querer.
async function prepararClientesParaGravar(lista) {
  const resultado = [];
  for (const c of lista) {
    if (c.senha && String(c.senha).trim()) {
      const hash = await bcrypt.hash(String(c.senha), 10);
      resultado.push({ ...c, senha: hash });
    } else {
      const { rows } = await pool.query("SELECT senha FROM clientes WHERE id = $1", [c.id]);
      resultado.push({ ...c, senha: rows[0]?.senha || null });
    }
  }
  return resultado;
}

// Um cliente logado pode gravar a lista de clientes (é assim que o próprio
// perfil é salvo), mas só pode alterar o PRÓPRIO registro — qualquer outro
// registro precisa estar idêntico ao que já existe no banco, senão a
// gravação inteira é recusada. O admin não tem essa restrição.
async function clientePodeGravar(sessao, listaRecebida) {
  if (sessao.tipo === "admin") return true;
  const atuais = await listarTudo("clientes");
  if (listaRecebida.length !== atuais.length) return false;
  const atuaisPorId = new Map(atuais.map((c) => [c.id, c]));
  for (const c of listaRecebida) {
    if (c.id === sessao.clienteId) continue;
    const original = atuaisPorId.get(c.id);
    if (!original) return false;
    if (c.nome !== original.nome || c.telefone !== original.telefone || c.email !== original.email) return false;
    if (c.senha && String(c.senha).trim()) return false;
  }
  return true;
}

function gerarToken() {
  return crypto.randomBytes(32).toString("hex");
}
function pegarToken(req) {
  const cabecalho = req.headers.authorization || "";
  return cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
}
async function pegarSessao(req) {
  const token = pegarToken(req);
  if (!token) return null;
  const { rows } = await pool.query(`SELECT tipo, ${q("clienteId")} AS "clienteId" FROM sessoes WHERE token = $1`, [token]);
  return rows[0] || null;
}

// Envolve uma rota assíncrona: qualquer erro cai aqui em vez de travar a
// requisição ou derrubar o servidor (Express 4 não faz isso sozinho).
const rota = (fn) => (req, res) => {
  fn(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: "Erro interno do servidor." });
  });
};

const app = express();
app.use(cors());
// strict:false porque o app às vezes manda um valor JSON "solto" no corpo
// (não só objetos/arrays) — o padrão do Express (strict:true) rejeitaria isso.
app.use(express.json({ limit: "5mb", strict: false }));

app.get("/api/health", rota(async (req, res) => { await pool.query("SELECT 1"); res.json({ ok: true }); }));

// --- Autenticação ---
app.post("/api/login", rota(async (req, res) => {
  if (ADMINS.some((a) => a.email === emailNormalizado && a.senha === senha)) {
  if (!email || !senha) return res.status(400).json({ error: "Informe e-mail e senha." });
  const emailNormalizado = String(email).trim().toLowerCase();

  if (emailNormalizado === ADMIN_EMAIL && senha === ADMIN_SENHA) {
    const token = gerarToken();
    await pool.query(`INSERT INTO sessoes (token, tipo, ${q("clienteId")}, ${q("criadoEm")}) VALUES ($1, 'admin', NULL, $2)`, [token, new Date().toISOString()]);
    return res.json({ token, type: "admin" });
  }

  const { rows } = await pool.query("SELECT id, senha FROM clientes WHERE lower(email) = $1", [emailNormalizado]);
  const cliente = rows[0];
  if (cliente && cliente.senha) {
    const confere = await bcrypt.compare(String(senha), cliente.senha);
    if (confere) {
      const token = gerarToken();
      await pool.query(`INSERT INTO sessoes (token, tipo, ${q("clienteId")}, ${q("criadoEm")}) VALUES ($1, 'cliente', $2, $3)`, [token, cliente.id, new Date().toISOString()]);
      return res.json({ token, type: "cliente", id: cliente.id });
    }
  }
  res.status(401).json({ error: "E-mail ou senha inválidos." });
}));

app.post("/api/logout", rota(async (req, res) => {
  const token = pegarToken(req);
  if (token) await pool.query("DELETE FROM sessoes WHERE token = $1", [token]);
  res.json({ ok: true });
}));

// Diz se o token atual (se houver) corresponde a uma sessão válida.
// Não exige estar logado — é essa rota que responde "null" quando não está.
app.get("/api/sessao", rota(async (req, res) => {
  const sessao = await pegarSessao(req);
  if (!sessao) return res.json(null);
  res.json(sessao.tipo === "admin" ? { type: "admin" } : { type: "cliente", id: sessao.clienteId });
}));

// Autocadastro do cliente: rota pública, cria só 1 registro (nunca mexe
// nos outros clientes), já devolve um token pra logar em seguida.
app.post("/api/registrar-cliente", rota(async (req, res) => {
  const { nome, email, telefone, senha } = req.body || {};
  if (!nome || !email || !senha) return res.status(400).json({ error: "Preencha nome, e-mail e senha." });
  const emailNormalizado = String(email).trim().toLowerCase();
  const { rows: existentes } = await pool.query("SELECT id FROM clientes WHERE lower(email) = $1", [emailNormalizado]);
  if (existentes.length) return res.status(409).json({ error: "Este e-mail já está cadastrado." });

  const id = `c${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
  const hash = await bcrypt.hash(String(senha), 10);
  await pool.query("INSERT INTO clientes (id, nome, telefone, email, senha) VALUES ($1, $2, $3, $4, $5)", [id, String(nome).trim(), telefone || "", String(email).trim(), hash]);

  const token = gerarToken();
  await pool.query(`INSERT INTO sessoes (token, tipo, ${q("clienteId")}, ${q("criadoEm")}) VALUES ($1, 'cliente', $2, $3)`, [token, id, new Date().toISOString()]);
  res.json({ token, type: "cliente", id, cliente: { id, nome: String(nome).trim(), telefone: telefone || "", email: String(email).trim() } });
}));

// Formulário de contato público: cria só 1 mensagem (rota separada da
// genérica, que agora é só para o admin gerenciar as mensagens recebidas).
app.post("/api/mensagens", rota(async (req, res) => {
  const { nome, email, telefone, assunto, mensagem } = req.body || {};
  if (!nome || !email || !mensagem) return res.status(400).json({ error: "Preencha nome, e-mail e mensagem." });
  const id = `m${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
  const data = new Date().toISOString().slice(0, 10);
  await pool.query("INSERT INTO mensagens (id, nome, email, telefone, assunto, mensagem, data, lida) VALUES ($1, $2, $3, $4, $5, $6, $7, false)", [id, String(nome).trim(), String(email).trim(), telefone || "", assunto || "Sem assunto", String(mensagem).trim(), data]);
  res.json({ ok: true });
}));

// --- Entidades genéricas ---
app.get("/api/:entidade", rota(async (req, res) => {
  const { entidade } = req.params;
  const regra = ACESSO[entidade];
  if (!regra) return res.status(404).json({ error: `Entidade "${entidade}" não existe.` });

  if (regra.get !== "publico") {
    const sessao = await pegarSessao(req);
    if (!sessao) return res.status(401).json({ error: "É preciso estar logado para acessar isso." });
    if (regra.get === "admin" && sessao.tipo !== "admin") return res.status(403).json({ error: "Só o administrador pode fazer isso." });
  }

  const dados = await listarTudo(entidade);
  res.json(entidade === "clientes" ? dados.map(({ senha, ...resto }) => resto) : dados);
}));

app.put("/api/:entidade", rota(async (req, res) => {
  const { entidade } = req.params;
  const regra = ACESSO[entidade];
  if (!regra) return res.status(404).json({ error: `Entidade "${entidade}" não existe.` });

  const sessao = await pegarSessao(req);
  if (!sessao) return res.status(401).json({ error: "É preciso estar logado para acessar isso." });
  if (regra.put === "admin" && sessao.tipo !== "admin") return res.status(403).json({ error: "Só o administrador pode fazer isso." });
  if (!Array.isArray(req.body)) return res.status(400).json({ error: "O corpo da requisição deve ser um array." });

  if (entidade === "clientes" && !(await clientePodeGravar(sessao, req.body))) {
    return res.status(403).json({ error: "Você só pode editar o seu próprio cadastro." });
  }

  let lista = req.body;
  if (entidade === "clientes") lista = await prepararClientesParaGravar(lista);
  await substituirTudoTransacao(entidade, lista);
  res.json({ ok: true });
}));

const PORT = process.env.PORT || 3001;

async function iniciar() {
  await pool.query(readFileSync(join(__dirname, "schema.sql"), "utf8"));
  console.log("Schema verificado/criado com sucesso.");
  app.listen(PORT, () => {
    console.log(`API da Torque rodando em http://localhost:${PORT}`);
    if (ADMIN_SENHA === "admin123") {
      console.log("Aviso: você está usando a senha padrão do admin (admin123). Defina ADMIN_EMAIL e ADMIN_SENHA no .env antes de publicar o site.");
    }
  });
}

iniciar().catch((err) => {
  console.error("Falha ao iniciar o servidor:", err.message);
  process.exit(1);
});
