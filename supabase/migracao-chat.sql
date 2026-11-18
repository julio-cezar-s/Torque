-- =====================================================================
-- Torque · Migração: chat sem perda de mensagens
-- Rode UMA vez no SQL Editor do Supabase (pode rodar de novo sem problema).
--
-- Antes: todas as mensagens ficavam dentro de UMA linha da conversa (jsonb);
-- se cliente e admin enviassem ao mesmo tempo, uma podia sobrescrever a outra.
-- Agora: cada mensagem é uma linha própria em "mensagens_chat".
-- As mensagens que já existiam são copiadas automaticamente.
-- =====================================================================

-- 1) Nova tabela: uma linha por mensagem
create table if not exists public.mensagens_chat (
  id          text primary key,
  conversa_id text not null references public.conversas(id) on delete cascade,
  cliente_id  text not null references public.clientes(id) on delete cascade,
  autor       text not null check (autor in ('cliente', 'admin')),
  texto       text not null default '',
  data        text not null default '',
  lida        boolean not null default false
);
create index if not exists idx_mensagens_chat_conversa on public.mensagens_chat(conversa_id, data);
create index if not exists idx_mensagens_chat_cliente  on public.mensagens_chat(cliente_id);

-- 2) Copia as mensagens antigas (jsonb) e remove a coluna antiga
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'conversas' and column_name = 'mensagens') then
    insert into public.mensagens_chat (id, conversa_id, cliente_id, autor, texto, data, lida)
    select m ->> 'id', c.id, c.cliente_id,
           case when m ->> 'autor' = 'admin' then 'admin' else 'cliente' end,
           coalesce(m ->> 'texto', ''), coalesce(m ->> 'data', ''), coalesce((m ->> 'lida')::boolean, false)
      from public.conversas c, jsonb_array_elements(c.mensagens) m
     where m ->> 'id' is not null
    on conflict (id) do nothing;

    alter table public.conversas drop column mensagens;
  end if;
end $$;

-- 3) Uma conversa por cliente (evita duplicar se duas abas abrirem o chat ao mesmo tempo)
do $$
begin
  create unique index if not exists ux_conversas_cliente on public.conversas(cliente_id);
exception when others then
  raise notice 'Existem conversas duplicadas para o mesmo cliente; o índice único não foi criado.';
end $$;

-- 4) Regras de acesso (RLS)
alter table public.mensagens_chat enable row level security;

drop policy if exists admin_tudo on public.mensagens_chat;
create policy admin_tudo on public.mensagens_chat for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

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

-- 5) Tempo real também para as mensagens do chat
do $$
begin
  if not exists (select 1 from pg_publication_tables
                  where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'mensagens_chat') then
    alter publication supabase_realtime add table public.mensagens_chat;
  end if;
end $$;
