-- =====================================================================
-- Torque · Gestão de Oficina — schema para Supabase (PostgreSQL)
-- Rode este arquivo inteiro no SQL Editor do Supabase (pode rodar de novo).
-- =====================================================================

-- ---------- Tabelas ---------------------------------------------------
-- Ids são texto (o front gera ids como "c1abc..."); datas ficam em texto
-- ISO (YYYY-MM-DD) porque o front compara/ordena como string.

create table if not exists public.clientes (
  id         text primary key,
  auth_id    uuid unique references auth.users(id) on delete set null,
  nome       text not null,
  telefone   text not null default '',
  email      text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.veiculos (
  id         text primary key,
  cliente_id text not null references public.clientes(id) on delete cascade,
  placa      text not null default '',
  marca      text not null default '',
  modelo     text not null default '',
  ano        text not null default '',
  cor        text not null default ''
);

-- Ordens/agendamentos/avaliações usam ON DELETE SET NULL: o histórico é mantido
-- mesmo quando o cliente, veículo ou serviço é excluído (a referência vira NULL).
create table if not exists public.ordens (
  id           text primary key,
  numero       text not null default '',
  cliente_id   text references public.clientes(id) on delete set null,
  veiculo_id   text references public.veiculos(id) on delete set null,
  status       text not null default 'aguardando',
  descricao    text not null default '',
  mecanico     text not null default '',
  data_entrada text not null default '',
  previsao     text not null default '',
  itens        jsonb not null default '[]'::jsonb
);

create table if not exists public.estoque (
  id                text primary key,
  nome              text not null default '',
  codigo            text not null default '',
  quantidade        integer not null default 0,
  quantidade_minima integer not null default 0,
  preco             numeric(12,2) not null default 0,
  imagem            text not null default ''
);

create table if not exists public.servicos (
  id        text primary key,
  nome      text not null default '',
  categoria text not null default '',
  descricao text not null default '',
  preco     numeric(12,2) not null default 0,
  duracao   text not null default ''
);

create table if not exists public.agendamentos (
  id          text primary key,
  cliente_id  text references public.clientes(id) on delete set null,
  veiculo_id  text references public.veiculos(id) on delete set null,
  servico_id  text references public.servicos(id) on delete set null,
  data        text not null default '',
  hora        text not null default '',
  observacoes text not null default '',
  status      text not null default 'pendente'
);

-- Mensagens do formulário de contato (público)
create table if not exists public.mensagens (
  id       text primary key,
  nome     text not null default '',
  email    text not null default '',
  telefone text not null default '',
  assunto  text not null default '',
  mensagem text not null default '',
  data     text not null default '',
  lida     boolean not null default false
);

create table if not exists public.pagamentos (
  id       text primary key,
  ordem_id text not null references public.ordens(id) on delete cascade,
  valor    numeric(12,2) not null default 0,
  forma    text not null default '',
  data     text not null default '',
  obs      text not null default ''
);

create table if not exists public.avaliacoes (
  id         text primary key,
  ordem_id   text not null references public.ordens(id) on delete cascade,
  cliente_id text references public.clientes(id) on delete set null,
  nota       integer not null default 5,
  comentario text not null default '',
  data       text not null default ''
);

-- Chat cliente <-> oficina: uma conversa por cliente; cada mensagem é uma linha própria
-- (assim duas pessoas enviando ao mesmo tempo nunca sobrescrevem uma à outra)
create table if not exists public.conversas (
  id           text primary key,
  cliente_id   text not null unique references public.clientes(id) on delete cascade,
  cliente_nome text not null default ''
);

create table if not exists public.mensagens_chat (
  id          text primary key,
  conversa_id text not null references public.conversas(id) on delete cascade,
  cliente_id  text not null references public.clientes(id) on delete cascade,
  autor       text not null check (autor in ('cliente', 'admin')),
  texto       text not null default '',
  data        text not null default '',
  lida        boolean not null default false
);

create index if not exists idx_veiculos_cliente  on public.veiculos(cliente_id);
create index if not exists idx_ordens_cliente    on public.ordens(cliente_id);
create index if not exists idx_agend_cliente     on public.agendamentos(cliente_id);
create index if not exists idx_pagamentos_ordem  on public.pagamentos(ordem_id);
create index if not exists idx_mensagens_chat_conversa on public.mensagens_chat(conversa_id, data);
create index if not exists idx_mensagens_chat_cliente  on public.mensagens_chat(cliente_id);

-- ---------- Funções auxiliares ----------------------------------------

-- Admin = usuário com app_metadata.role = 'admin' (só editável pelo servidor/SQL,
-- o usuário não consegue alterar isso pelo front).
create or replace function public.is_admin()
returns boolean language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

-- id (da tabela clientes) do usuário logado
create or replace function public.meu_cliente_id()
returns text language sql stable security definer set search_path = public as $$
  select id from public.clientes where auth_id = auth.uid() limit 1
$$;

-- ---------- Vincular usuário do Auth a um cliente ---------------------
-- Cadastro pelo site: cria a linha em "clientes" automaticamente.
-- Se o admin já cadastrou o cliente com o mesmo e-mail, o usuário assume essa
-- linha (somente depois de o e-mail estar confirmado).
create or replace function public.sincronizar_cliente_auth()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_id text;
begin
  if coalesce(new.raw_app_meta_data ->> 'role', '') = 'admin' then return new; end if;
  if exists (select 1 from public.clientes where auth_id = new.id) then return new; end if;

  if new.email_confirmed_at is not null then
    update public.clientes set auth_id = new.id
     where id = (select id from public.clientes
                  where lower(email) = lower(new.email) and auth_id is null
                  order by created_at limit 1)
    returning id into v_id;
    if v_id is not null then return new; end if;
  elsif exists (select 1 from public.clientes where lower(email) = lower(new.email) and auth_id is null) then
    return new; -- aguarda a confirmação do e-mail para assumir o cadastro existente
  end if;

  insert into public.clientes (id, auth_id, nome, telefone, email)
  values (
    'c' || replace(new.id::text, '-', ''),
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nome', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'telefone', ''),
    new.email
  );
  return new;
end $$;

drop trigger if exists trg_sincronizar_cliente_auth on auth.users;
create trigger trg_sincronizar_cliente_auth
  after insert or update of email_confirmed_at on auth.users
  for each row execute function public.sincronizar_cliente_auth();

-- Cliente não pode trocar o vínculo com o Auth pela API
create or replace function public.proteger_auth_id()
returns trigger language plpgsql as $$
begin
  if not public.is_admin() and auth.uid() is not null then new.auth_id := old.auth_id; end if;
  return new;
end $$;

drop trigger if exists trg_proteger_auth_id on public.clientes;
create trigger trg_proteger_auth_id before update on public.clientes
  for each row execute function public.proteger_auth_id();

-- ---------- Row Level Security ----------------------------------------
alter table public.clientes     enable row level security;
alter table public.veiculos     enable row level security;
alter table public.ordens       enable row level security;
alter table public.estoque      enable row level security;
alter table public.servicos     enable row level security;
alter table public.agendamentos enable row level security;
alter table public.mensagens    enable row level security;
alter table public.pagamentos   enable row level security;
alter table public.avaliacoes   enable row level security;
alter table public.conversas    enable row level security;
alter table public.mensagens_chat enable row level security;

-- Admin: acesso total a tudo
do $$
declare t text;
begin
  foreach t in array array['clientes','veiculos','ordens','estoque','servicos','agendamentos','mensagens','pagamentos','avaliacoes','conversas','mensagens_chat']
  loop
    execute format('drop policy if exists admin_tudo on public.%I', t);
    execute format('create policy admin_tudo on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Serviços: catálogo público
drop policy if exists servicos_leitura_publica on public.servicos;
create policy servicos_leitura_publica on public.servicos for select to anon, authenticated using (true);

-- Estoque: qualquer usuário logado pode consultar (tela "Estoque" do cliente)
drop policy if exists estoque_leitura_logado on public.estoque;
create policy estoque_leitura_logado on public.estoque for select to authenticated using (true);

-- Contato: qualquer visitante pode enviar; só o admin lê (policy admin_tudo)
drop policy if exists mensagens_envio_publico on public.mensagens;
create policy mensagens_envio_publico on public.mensagens for insert to anon, authenticated with check (lida = false);

-- Cliente: próprio cadastro
drop policy if exists clientes_ver_proprio on public.clientes;
create policy clientes_ver_proprio on public.clientes for select to authenticated using (auth_id = auth.uid());
drop policy if exists clientes_editar_proprio on public.clientes;
create policy clientes_editar_proprio on public.clientes for update to authenticated
  using (auth_id = auth.uid()) with check (auth_id = auth.uid());

-- Cliente: veículos próprios (CRUD)
drop policy if exists veiculos_cliente on public.veiculos;
create policy veiculos_cliente on public.veiculos for all to authenticated
  using (cliente_id = public.meu_cliente_id()) with check (cliente_id = public.meu_cliente_id());

-- Cliente: ordens próprias (somente leitura)
drop policy if exists ordens_cliente_leitura on public.ordens;
create policy ordens_cliente_leitura on public.ordens for select to authenticated using (cliente_id = public.meu_cliente_id());

-- Cliente: pagamentos das próprias ordens (somente leitura)
drop policy if exists pagamentos_cliente_leitura on public.pagamentos;
create policy pagamentos_cliente_leitura on public.pagamentos for select to authenticated
  using (exists (select 1 from public.ordens o where o.id = ordem_id and o.cliente_id = public.meu_cliente_id()));

-- Cliente: agendamentos próprios (ver, solicitar, cancelar)
drop policy if exists agendamentos_cliente on public.agendamentos;
create policy agendamentos_cliente on public.agendamentos for all to authenticated
  using (cliente_id = public.meu_cliente_id()) with check (cliente_id = public.meu_cliente_id());

-- Cliente: avaliações das próprias ordens (ver e enviar)
drop policy if exists avaliacoes_cliente_ver on public.avaliacoes;
create policy avaliacoes_cliente_ver on public.avaliacoes for select to authenticated using (cliente_id = public.meu_cliente_id());
drop policy if exists avaliacoes_cliente_enviar on public.avaliacoes;
create policy avaliacoes_cliente_enviar on public.avaliacoes for insert to authenticated
  with check (cliente_id = public.meu_cliente_id()
              and exists (select 1 from public.ordens o where o.id = ordem_id and o.cliente_id = public.meu_cliente_id()));

-- Cliente: própria conversa de chat
drop policy if exists conversas_cliente on public.conversas;
create policy conversas_cliente on public.conversas for all to authenticated
  using (cliente_id = public.meu_cliente_id()) with check (cliente_id = public.meu_cliente_id());

-- Cliente: mensagens do próprio chat (ver, enviar e marcar como lida)
drop policy if exists chat_cliente_ver on public.mensagens_chat;
create policy chat_cliente_ver on public.mensagens_chat for select to authenticated
  using (cliente_id = public.meu_cliente_id());
drop policy if exists chat_cliente_enviar on public.mensagens_chat;
create policy chat_cliente_enviar on public.mensagens_chat for insert to authenticated
  with check (cliente_id = public.meu_cliente_id() and autor = 'cliente');
drop policy if exists chat_cliente_marcar_lida on public.mensagens_chat;
create policy chat_cliente_marcar_lida on public.mensagens_chat for update to authenticated
  using (cliente_id = public.meu_cliente_id()) with check (cliente_id = public.meu_cliente_id());

-- O cliente só pode mudar o campo "lida" (nunca o texto, o autor ou a data)
create or replace function public.proteger_mensagem_chat()
returns trigger language plpgsql as $$
begin
  if not public.is_admin() and auth.uid() is not null then
    new.id := old.id; new.conversa_id := old.conversa_id; new.cliente_id := old.cliente_id;
    new.autor := old.autor; new.texto := old.texto; new.data := old.data;
  end if;
  return new;
end $$;

drop trigger if exists trg_proteger_mensagem_chat on public.mensagens_chat;
create trigger trg_proteger_mensagem_chat before update on public.mensagens_chat
  for each row execute function public.proteger_mensagem_chat();

-- ---------- Dados iniciais (catálogo de serviços) ---------------------
insert into public.servicos (id, nome, categoria, descricao, preco, duracao) values
  ('s-oleo',      'Troca de óleo e filtro',   'Manutenção',          'Troca do óleo do motor e do filtro de óleo.',            180, '45min'),
  ('s-revisao',   'Revisão completa',         'Revisão',             'Checklist de itens de segurança e desgaste.',            450, '3h'),
  ('s-freios',    'Revisão de freios',        'Freios',              'Pastilhas, discos, fluido e funcionamento geral.',       260, '1h30'),
  ('s-alinha',    'Alinhamento e balanceamento','Pneus e Alinhamento','Alinhamento de direção e balanceamento das quatro rodas.', 140, '1h')
on conflict (id) do nothing;

-- =====================================================================
-- COMO CRIAR O ADMINISTRADOR
-- 1) Authentication > Users > Add user: e-mail e senha do admin
--    (ex.: admin@torque.com.br), marcando "Auto Confirm User".
-- 2) Rode (trocando o e-mail):
--
--   update auth.users
--      set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role":"admin"}'::jsonb
--    where email = 'admin@torque.com.br';
--   delete from public.clientes where auth_id = (select id from auth.users where email = 'admin@torque.com.br');
--
-- 3) Faça logout/login para o token receber o papel de admin.
-- =====================================================================
