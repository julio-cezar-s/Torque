# Torque · Gestão de Oficina Automotiva

Plataforma web para gerenciamento dos serviços de uma oficina automotiva, desenvolvida como projeto avaliativo da disciplina **Front-end Frameworks** (2º período — ADS).

> Atividade Avaliativa FF · Grupo 8 · Tema: Plataforma de Gestão de Oficina Automotiva

## Equipe

- João Veiga
- Giovana Oliveira
- Ricardo Araújo
- Kaue Alves
- Julio Cézar
- Rayane

## Sobre o projeto

O sistema é dividido em três áreas:

- **Área pública** — página inicial, listagem e detalhes dos serviços, informações sobre a oficina e formulário de contato.
- **Painel administrativo** — cadastro, consulta, edição e exclusão de serviços, clientes, veículos, ordens de serviço, estoque, agendamentos e mensagens recebidas.
- **Área do cliente** — cadastro de veículos, visualização de serviços, solicitação de agendamentos, acompanhamento de ordens de serviço e edição de perfil.

## Tecnologias

- **Frontend:** React + Vite
- **Backend/Banco/Auth:** Supabase (PostgreSQL + Supabase Auth + Row Level Security)

## Como rodar o projeto

### Pré-requisitos
- Node.js 18+
- Um projeto no [Supabase](https://supabase.com) (plano gratuito serve)

### Passo a passo

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env
# preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY (Project Settings > API)

# 3. Subir o front-end
npm run dev
```

Antes do primeiro uso, no painel do Supabase:

1. **SQL Editor** → cole e rode `supabase/schema.sql` (tabelas, RLS, gatilhos e serviços iniciais).
2. **Criar o administrador**: Authentication → Users → *Add user* (e-mail e senha, com *Auto Confirm User*) e rode o SQL do final do `schema.sql` para dar o papel `admin` a esse usuário.
3. (Opcional) Authentication → Providers → Email: deixe *Confirm email* ligado em produção.

- Front-end: http://localhost:5173

### Como funciona o acesso
- **Admin:** usuário do Supabase Auth com `app_metadata.role = 'admin'`; enxerga e edita tudo.
- **Cliente:** cadastra-se pelo site (Supabase Auth). Um gatilho cria/vincula a linha em `clientes`. Se o admin já cadastrou o cliente com o mesmo e-mail, o cadastro é vinculado depois da confirmação do e-mail. O RLS garante que cada cliente só acesse seus veículos, OS, agendamentos, pagamentos, avaliações e chat.
- **Visitante:** só lê o catálogo de serviços e envia mensagens de contato.

## Estrutura do projeto

O código é dividido em pastas na raiz, organizadas por **funcionalidade**, com um arquivo para cada função/componente.

```
├── aplicacao/            ponto de entrada (main.jsx) e controle de sessão (App.jsx)
├── estilos/              CSS global
├── nucleo/               base da aplicação
│   ├── supabase/         cliente Supabase, lista de tabelas e avisos de falha
│   ├── dados/            carregarTabela, persistirDiferencas e mapeamento camelCase ↔ snake_case
│   └── ganchos/          useTabela (estado + gravação no banco)
├── compartilhado/        peças usadas em vários módulos
│   ├── componentes/      Janela, Campo, Placa, Selo, Carimbo, Estrutura...
│   └── utilitarios/      formatarReais, formatarData, gerarId, limparDecimal
├── modulos/              uma pasta por funcionalidade
│   ├── autenticacao/     entrar, sair, cadastro, sessão
│   ├── site-publico/     início, serviços, detalhe, sobre, contato
│   ├── paineis/          áreas do administrador e do cliente + painéis
│   ├── ordens-servico/   ordens de serviço, recibo, avaliação
│   ├── agendamentos/     agenda do admin e solicitação do cliente
│   ├── clientes/         cadastro de clientes e perfil
│   ├── veiculos/         veículos e detalhes do veículo
│   ├── catalogo-servicos/ catálogo de serviços
│   ├── estoque/          peças, estoque e upload de imagens (Storage)
│   ├── pagamentos/       pagamentos por ordem de serviço
│   ├── chat/             chat cliente ↔ oficina
│   └── mensagens/        mensagens do formulário de contato
└── supabase/             scripts SQL do banco (schema, migrações, storage)
```

Dentro de cada módulo: `telas/` (telas), `componentes/` (janelas e partes de tela), `constantes/`, `utilitarios/` e `integracao/` (chamadas ao Supabase).

## Estrutura do banco de dados

| Tabela | Descrição |
|---|---|
| `clientes` | Usuários da área do cliente |
| `veiculos` | Veículos cadastrados, vinculados a um cliente |
| `ordens` | Ordens de serviço (OS) |
| `estoque` | Peças disponíveis |
| `servicos` | Catálogo de serviços oferecidos |
| `agendamentos` | Agendamentos solicitados pelos clientes |
| `mensagens` | Mensagens recebidas pelo formulário de contato |
| `pagamentos` | Pagamentos registrados por ordem de serviço |
| `avaliacoes` | Avaliações dos clientes sobre as OS concluídas |
| `conversas` | Chat entre cliente e administrador |

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | inicia o front-end (Vite) |
| `npm run build` | gera a versão de produção |
| `npm run preview` | serve a versão de produção localmente |

## Roadmap

- [x] AT1 — front-end funcional com componentes, props e estado
- [x] AT2 — integração com Supabase (autenticação e banco de dados)
