-- Torque · Remove SOMENTE os dados de demonstração (ids que começam com "demo-").
-- Os seus dados reais não são tocados.
-- Ordens e agendamentos não apagam em cascata, por isso são removidos primeiro.
delete from public.pagamentos   where id like 'demo-%' or ordem_id like 'demo-%';
delete from public.avaliacoes   where id like 'demo-%' or ordem_id like 'demo-%';
delete from public.agendamentos where id like 'demo-%';
delete from public.ordens       where id like 'demo-%';
delete from public.mensagens    where id like 'demo-%';
delete from public.estoque      where id like 'demo-%';
delete from public.clientes     where id like 'demo-%';  -- apaga junto os veículos e o chat do cliente
