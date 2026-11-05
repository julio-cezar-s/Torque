-- =====================================================================
-- Torque · Migração: relacionamentos (chaves estrangeiras) entre entidades
-- Rode UMA vez no SQL Editor do Supabase. Pode rodar de novo sem problema.
--
-- Regra: ao excluir um cliente/veículo/serviço, ordens, agendamentos e
-- avaliações continuam no histórico (a referência vira NULL); já o chat
-- do cliente excluído é apagado junto.
-- =====================================================================

-- 1) Limpeza: valores vazios ou que apontam para registros que não existem mais
update public.ordens set cliente_id = null where cliente_id = '' or (cliente_id is not null and not exists (select 1 from public.clientes c where c.id = ordens.cliente_id));
update public.ordens set veiculo_id = null where veiculo_id = '' or (veiculo_id is not null and not exists (select 1 from public.veiculos v where v.id = ordens.veiculo_id));

update public.agendamentos set cliente_id = null where cliente_id = '' or (cliente_id is not null and not exists (select 1 from public.clientes c where c.id = agendamentos.cliente_id));
update public.agendamentos set veiculo_id = null where veiculo_id = '' or (veiculo_id is not null and not exists (select 1 from public.veiculos v where v.id = agendamentos.veiculo_id));
update public.agendamentos set servico_id = null where servico_id = '' or (servico_id is not null and not exists (select 1 from public.servicos s where s.id = agendamentos.servico_id));

update public.avaliacoes set cliente_id = null where cliente_id = '' or (cliente_id is not null and not exists (select 1 from public.clientes c where c.id = avaliacoes.cliente_id));

delete from public.conversas where not exists (select 1 from public.clientes c where c.id = conversas.cliente_id);

-- 2) Chaves estrangeiras
alter table public.ordens drop constraint if exists ordens_cliente_fk;
alter table public.ordens add constraint ordens_cliente_fk foreign key (cliente_id) references public.clientes(id) on delete set null;
alter table public.ordens drop constraint if exists ordens_veiculo_fk;
alter table public.ordens add constraint ordens_veiculo_fk foreign key (veiculo_id) references public.veiculos(id) on delete set null;

alter table public.agendamentos drop constraint if exists agendamentos_cliente_fk;
alter table public.agendamentos add constraint agendamentos_cliente_fk foreign key (cliente_id) references public.clientes(id) on delete set null;
alter table public.agendamentos drop constraint if exists agendamentos_veiculo_fk;
alter table public.agendamentos add constraint agendamentos_veiculo_fk foreign key (veiculo_id) references public.veiculos(id) on delete set null;
alter table public.agendamentos drop constraint if exists agendamentos_servico_fk;
alter table public.agendamentos add constraint agendamentos_servico_fk foreign key (servico_id) references public.servicos(id) on delete set null;

alter table public.avaliacoes drop constraint if exists avaliacoes_cliente_fk;
alter table public.avaliacoes add constraint avaliacoes_cliente_fk foreign key (cliente_id) references public.clientes(id) on delete set null;

alter table public.conversas drop constraint if exists conversas_cliente_fk;
alter table public.conversas add constraint conversas_cliente_fk foreign key (cliente_id) references public.clientes(id) on delete cascade;

-- 3) Índices para as novas chaves
create index if not exists idx_ordens_veiculo  on public.ordens(veiculo_id);
create index if not exists idx_agend_veiculo   on public.agendamentos(veiculo_id);
create index if not exists idx_agend_servico   on public.agendamentos(servico_id);
