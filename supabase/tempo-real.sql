-- =====================================================================
-- Torque · Atualização automática (Supabase Realtime)
-- Rode UMA vez no SQL Editor do Supabase. Pode rodar de novo sem problema.
--
-- Liga o "tempo real" nas tabelas do sistema. As regras de acesso (RLS)
-- continuam valendo: cada usuário só recebe avisos das linhas que pode ver.
-- =====================================================================

do $$
declare t text;
begin
  foreach t in array array['clientes','veiculos','ordens','estoque','servicos','agendamentos','mensagens','pagamentos','avaliacoes','conversas','mensagens_chat']
  loop
    if to_regclass('public.' || t) is not null and not exists (
      select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end $$;
