-- Banco de dados da Torque · Gestão de Oficina Automotiva
-- PostgreSQL. Os nomes de coluna usam o mesmo camelCase dos objetos do app
-- (oficina-gestao.jsx). No Postgres, identificador sem aspas é convertido
-- para minúsculas automaticamente — por isso toda coluna com letra
-- maiúscula no meio do nome (ex: "clienteId") fica entre aspas duplas aqui
-- e em todo lugar que o server.js referencia essas colunas.

CREATE TABLE IF NOT EXISTS clientes (
  id       TEXT PRIMARY KEY,
  nome     TEXT NOT NULL,
  telefone TEXT,
  email    TEXT,
  senha    TEXT
);

CREATE TABLE IF NOT EXISTS veiculos (
  id          TEXT PRIMARY KEY,
  "clienteId" TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  placa       TEXT NOT NULL,
  marca       TEXT,
  modelo      TEXT,
  ano         TEXT,
  cor         TEXT
);
CREATE INDEX IF NOT EXISTS idx_veiculos_cliente ON veiculos("clienteId");

-- itens é um array JSON (cada item pode ser "avulso" ou vinculado a uma peça
-- do estoque), do mesmo jeito que já é tratado dentro do app.
CREATE TABLE IF NOT EXISTS ordens (
  id            TEXT PRIMARY KEY,
  numero        TEXT NOT NULL,
  "clienteId"   TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  "veiculoId"   TEXT REFERENCES veiculos(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'aguardando',
  descricao     TEXT,
  mecanico      TEXT,
  "dataEntrada" TEXT,
  previsao      TEXT,
  itens         TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_ordens_cliente ON ordens("clienteId");
CREATE INDEX IF NOT EXISTS idx_ordens_veiculo ON ordens("veiculoId");

CREATE TABLE IF NOT EXISTS estoque (
  id                 TEXT PRIMARY KEY,
  nome               TEXT NOT NULL,
  codigo             TEXT,
  quantidade         INTEGER NOT NULL DEFAULT 0,
  "quantidadeMinima" INTEGER NOT NULL DEFAULT 0,
  preco              REAL NOT NULL DEFAULT 0,
  imagem             TEXT
);

CREATE TABLE IF NOT EXISTS servicos (
  id        TEXT PRIMARY KEY,
  nome      TEXT NOT NULL,
  categoria TEXT,
  descricao TEXT,
  preco     REAL NOT NULL DEFAULT 0,
  duracao   TEXT
);

CREATE TABLE IF NOT EXISTS agendamentos (
  id           TEXT PRIMARY KEY,
  "clienteId"  TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  "veiculoId"  TEXT REFERENCES veiculos(id) ON DELETE SET NULL,
  "servicoId"  TEXT REFERENCES servicos(id) ON DELETE SET NULL,
  data         TEXT,
  hora         TEXT,
  observacoes  TEXT,
  status       TEXT NOT NULL DEFAULT 'pendente'
);
CREATE INDEX IF NOT EXISTS idx_agendamentos_cliente ON agendamentos("clienteId");

CREATE TABLE IF NOT EXISTS mensagens (
  id       TEXT PRIMARY KEY,
  nome     TEXT NOT NULL,
  email    TEXT,
  telefone TEXT,
  assunto  TEXT,
  mensagem TEXT,
  data     TEXT,
  lida     BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id          TEXT PRIMARY KEY,
  "ordemId"   TEXT REFERENCES ordens(id) ON DELETE CASCADE,
  valor       REAL NOT NULL DEFAULT 0,
  forma       TEXT,
  data        TEXT,
  obs         TEXT
);
CREATE INDEX IF NOT EXISTS idx_pagamentos_ordem ON pagamentos("ordemId");

CREATE TABLE IF NOT EXISTS avaliacoes (
  id          TEXT PRIMARY KEY,
  "ordemId"   TEXT REFERENCES ordens(id) ON DELETE CASCADE,
  "clienteId" TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  nota        INTEGER NOT NULL,
  comentario  TEXT,
  data        TEXT
);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_ordem ON avaliacoes("ordemId");

-- mensagens (do chat) é um array JSON de {id, autor, texto, data, lida},
-- igual ao formato já usado dentro do app.
CREATE TABLE IF NOT EXISTS conversas (
  id            TEXT PRIMARY KEY,
  "clienteId"   TEXT REFERENCES clientes(id) ON DELETE SET NULL,
  "clienteNome" TEXT,
  mensagens     TEXT NOT NULL DEFAULT '[]'
);

-- Uma linha por login ativo (token aleatório gerado no /api/login).
CREATE TABLE IF NOT EXISTS sessoes (
  token       TEXT PRIMARY KEY,
  tipo        TEXT NOT NULL,
  "clienteId" TEXT REFERENCES clientes(id) ON DELETE CASCADE,
  "criadoEm"  TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessoes_cliente ON sessoes("clienteId");
