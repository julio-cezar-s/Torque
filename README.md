# Torque · Gestão de Oficina Automotiva

Plataforma web para gerenciamento dos serviços de uma oficina automotiva, desenvolvida como projeto avaliativo da disciplina **Front-end Frameworks** (2º período — ADS).

> Atividade Avaliativa FF · Grupo 8 · Tema: Plataforma de Gestão de Oficina Automotiva

## Equipe

- João Veiga
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
- **Backend:** Node.js + Express
- **Banco de dados:** PostgreSQL
- **Autenticação:** sessão por token, senha de cliente com hash (bcrypt)

## Como rodar o projeto

### Pré-requisitos
- Node.js 18+
- PostgreSQL rodando localmente (ou uma connection string de um banco na nuvem)

### Passo a passo

```bash
# 1. Instalar as dependências
npm install

# 2. Criar o arquivo de variáveis de ambiente
cp .env.example .env
# edite o .env com sua DATABASE_URL (e, se quiser, ADMIN_EMAIL/ADMIN_SENHA)

# 3. Subir API e front-end juntos
npm run dev:all
```

- Front-end: http://localhost:5173
- API: http://localhost:3001

O schema do banco (`schema.sql`) é aplicado automaticamente ao iniciar o servidor — não é preciso rodar nada manualmente.

### Login padrão do administrador
- E-mail: `admin@torque.com.br`
- Senha: `admin123`

*(altere no `.env` antes de publicar em produção)*

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
| `sessoes` | Sessões de login ativas |

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | inicia só o front-end (Vite) |
| `npm run server` | inicia só a API (Express) |
| `npm run dev:all` | inicia front-end + API juntos |
| `npm run build` | gera a versão de produção do front-end |

## Roadmap

- [x] AT1 — front-end funcional com componentes, props e estado
- [ ] AT2 — integração com Supabase (autenticação e banco de dados)
