-- =====================================================================
-- Torque · Dados de demonstração
-- Rode no SQL Editor do Supabase DEPOIS do schema.sql (e da migracao-chat.sql).
-- Pode rodar de novo sem duplicar. Todos os registros têm id começando com "demo-",
-- então dá para apagar só eles com o limpar-dados-demonstracao.sql.
--
-- Datas são relativas a HOJE: os agendamentos sempre ficam nos próximos dias.
--
-- Para demonstrar a ÁREA DO CLIENTE com estes dados:
--   Authentication > Users > Add user  ->  e-mail  cliente.demo@torque.com.br
--   (marque "Auto Confirm User"). O cadastro "Maria Souza" abaixo é vinculado
--   automaticamente a esse usuário.
-- =====================================================================

-- ---------- Clientes (cadastrados pelo administrador) ------------------
insert into public.clientes (id, nome, telefone, email) values
  ('demo-c1', 'Maria Souza',     '(69) 99211-4478', 'cliente.demo@torque.com.br'),
  ('demo-c2', 'João Pereira',    '(69) 98433-1020', 'joao.pereira@email.com'),
  ('demo-c3', 'Ana Lima',        '(69) 99650-7731', 'ana.lima@email.com'),
  ('demo-c4', 'Carlos Barbosa',  '(69) 3441-2290',  'carlos.barbosa@email.com')
on conflict (id) do nothing;

-- ---------- Veículos --------------------------------------------------
insert into public.veiculos (id, cliente_id, placa, marca, modelo, ano, cor) values
  ('demo-v1', 'demo-c1', 'QSX4A12', 'Fiat',       'Argo',    '2021', 'Branco'),
  ('demo-v2', 'demo-c1', 'NDP8821', 'Honda',      'Fit',     '2014', 'Prata'),
  ('demo-v3', 'demo-c2', 'RBK2C45', 'Volkswagen', 'Gol',     '2019', 'Preto'),
  ('demo-v4', 'demo-c3', 'OHM9302', 'Chevrolet',  'Onix',    '2017', 'Vermelho'),
  ('demo-v5', 'demo-c3', 'QTA7B88', 'Toyota',     'Corolla', '2022', 'Cinza'),
  ('demo-v6', 'demo-c4', 'NEC1155', 'Ford',       'Ka',      '2015', 'Azul')
on conflict (id) do nothing;

-- ---------- Estoque de peças ------------------------------------------
insert into public.estoque (id, nome, codigo, quantidade, quantidade_minima, preco, imagem) values
  ('demo-p1', 'Óleo 5W30 sintético (1 L)',  'OL-5W30',  24, 8, 38.90,  ''),
  ('demo-p2', 'Filtro de óleo',             'FO-0145',  15, 5, 29.90,  ''),
  ('demo-p3', 'Filtro de ar do motor',      'FA-2210',   9, 4, 42.00,  ''),
  ('demo-p4', 'Pastilha de freio dianteira','PF-7788',   6, 4, 119.90, ''),
  ('demo-p5', 'Vela de ignição',            'VI-3301',  32, 12, 24.50, ''),
  ('demo-p6', 'Bateria 60 Ah',              'BT-6012',   3, 3, 489.00, ''),
  ('demo-p7', 'Correia dentada',            'CD-5590',   0, 3, 169.90, ''),
  ('demo-p8', 'Amortecedor dianteiro',      'AM-4102',   4, 2, 349.00, '')
on conflict (id) do nothing;

-- ---------- Ordens de serviço -----------------------------------------
-- itens: peças (tipo "peca") e serviços avulsos (tipo "avulso"); "valor" é o subtotal do item.
insert into public.ordens (id, numero, cliente_id, veiculo_id, status, descricao, mecanico, data_entrada, previsao, itens) values
  ('demo-o1', 'OS-9001', 'demo-c1', 'demo-v1', 'entregue',
   'Troca de óleo e filtro', 'Carlos Mendes',
   to_char(current_date - 20, 'YYYY-MM-DD'), to_char(current_date - 20, 'YYYY-MM-DD'),
   '[{"id":"demo-i1","tipo":"avulso","descricao":"Mão de obra - troca de óleo","valor":80},
     {"id":"demo-i2","tipo":"peca","pecaId":"demo-p1","descricao":"Óleo 5W30 sintético (1 L)","quantidade":4,"valorUnitario":38.9,"valor":155.6},
     {"id":"demo-i3","tipo":"peca","pecaId":"demo-p2","descricao":"Filtro de óleo","quantidade":1,"valorUnitario":29.9,"valor":29.9}]'::jsonb),
  ('demo-o2', 'OS-9002', 'demo-c2', 'demo-v3', 'concluido',
   'Barulho ao frear - troca de pastilhas', 'Ana Ferreira',
   to_char(current_date - 4, 'YYYY-MM-DD'), to_char(current_date - 2, 'YYYY-MM-DD'),
   '[{"id":"demo-i4","tipo":"avulso","descricao":"Mão de obra - freios","valor":150},
     {"id":"demo-i5","tipo":"peca","pecaId":"demo-p4","descricao":"Pastilha de freio dianteira","quantidade":1,"valorUnitario":119.9,"valor":119.9}]'::jsonb),
  ('demo-o3', 'OS-9003', 'demo-c3', 'demo-v5', 'andamento',
   'Revisão dos 40.000 km', 'Roberto Silva',
   to_char(current_date - 1, 'YYYY-MM-DD'), to_char(current_date + 1, 'YYYY-MM-DD'),
   '[{"id":"demo-i6","tipo":"avulso","descricao":"Revisão completa","valor":450},
     {"id":"demo-i7","tipo":"peca","pecaId":"demo-p3","descricao":"Filtro de ar do motor","quantidade":1,"valorUnitario":42,"valor":42},
     {"id":"demo-i8","tipo":"peca","pecaId":"demo-p5","descricao":"Vela de ignição","quantidade":4,"valorUnitario":24.5,"valor":98}]'::jsonb),
  ('demo-o4', 'OS-9004', 'demo-c4', 'demo-v6', 'peca',
   'Ruído na suspensão dianteira', 'Carlos Mendes',
   to_char(current_date - 3, 'YYYY-MM-DD'), to_char(current_date + 3, 'YYYY-MM-DD'),
   '[{"id":"demo-i9","tipo":"avulso","descricao":"Mão de obra - suspensão","valor":280},
     {"id":"demo-i10","tipo":"peca","pecaId":"demo-p8","descricao":"Amortecedor dianteiro","quantidade":2,"valorUnitario":349,"valor":698}]'::jsonb),
  ('demo-o5', 'OS-9005', 'demo-c1', 'demo-v2', 'aguardando',
   'Luz da bateria acesa no painel', 'Sem atribuição',
   to_char(current_date, 'YYYY-MM-DD'), to_char(current_date + 2, 'YYYY-MM-DD'),
   '[]'::jsonb)
on conflict (id) do nothing;

-- ---------- Pagamentos ------------------------------------------------
insert into public.pagamentos (id, ordem_id, valor, forma, data, obs) values
  ('demo-pg1', 'demo-o1', 265.50, 'PIX',               to_char(current_date - 20, 'YYYY-MM-DD'), 'Pago na retirada'),
  ('demo-pg2', 'demo-o2', 100.00, 'Dinheiro',          to_char(current_date - 4,  'YYYY-MM-DD'), 'Entrada'),
  ('demo-pg3', 'demo-o4', 300.00, 'Cartão de débito',  to_char(current_date - 3,  'YYYY-MM-DD'), 'Sinal para o pedido da peça')
on conflict (id) do nothing;

-- ---------- Avaliação ---------------------------------------------------
insert into public.avaliacoes (id, ordem_id, cliente_id, nota, comentario, data) values
  ('demo-av1', 'demo-o1', 'demo-c1', 5, 'Atendimento rápido e preço justo. Recomendo!', to_char(current_date - 19, 'YYYY-MM-DD'))
on conflict (id) do nothing;

-- ---------- Agendamentos (sempre nos próximos dias) -------------------
insert into public.agendamentos (id, cliente_id, veiculo_id, servico_id, data, hora, observacoes, status) values
  ('demo-ag1', 'demo-c1', 'demo-v1', 's-revisao', to_char(current_date + 2,  'YYYY-MM-DD'), '09:00', 'Revisão antes de viajar',        'confirmado'),
  ('demo-ag2', 'demo-c2', 'demo-v3', 's-alinha',  to_char(current_date + 3,  'YYYY-MM-DD'), '14:30', 'Carro puxando para a direita',   'pendente'),
  ('demo-ag3', 'demo-c3', 'demo-v4', 's-oleo',    to_char(current_date + 5,  'YYYY-MM-DD'), '10:00', '',                              'pendente'),
  ('demo-ag4', 'demo-c4', 'demo-v6', 's-freios',  to_char(current_date + 7,  'YYYY-MM-DD'), '08:30', 'Pedal de freio baixo',           'pendente')
on conflict (id) do nothing;

-- ---------- Mensagens recebidas pelo formulário de contato ------------
insert into public.mensagens (id, nome, email, telefone, assunto, mensagem, data, lida) values
  ('demo-m1', 'Fernanda Rocha', 'fernanda.rocha@email.com', '(69) 99120-5544', 'Orçamento',
   'Olá! Gostaria de um orçamento para troca de embreagem de um Palio 2012.', to_char(current_date - 1, 'YYYY-MM-DD'), false),
  ('demo-m2', 'Paulo Henrique', 'paulo.h@email.com', '', 'Horário de atendimento',
   'Vocês atendem aos sábados à tarde?', to_char(current_date - 2, 'YYYY-MM-DD'), true)
on conflict (id) do nothing;

-- ---------- Chat de exemplo (só se a migração do chat já foi rodada) ---
do $$
begin
  if to_regclass('public.mensagens_chat') is not null then
    insert into public.conversas (id, cliente_id, cliente_nome)
    values ('demo-cv1', 'demo-c1', 'Maria Souza')
    on conflict (id) do nothing;

    insert into public.mensagens_chat (id, conversa_id, cliente_id, autor, texto, data, lida) values
      ('demo-ch1', 'demo-cv1', 'demo-c1', 'cliente', 'Boa tarde! O Fit já pode ser buscado?',
        to_char(now() at time zone 'utc' - interval '2 hours', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'), true),
      ('demo-ch2', 'demo-cv1', 'demo-c1', 'admin', 'Boa tarde, Maria! O diagnóstico do Fit está em andamento, avisamos assim que terminar.',
        to_char(now() at time zone 'utc' - interval '1 hour',  'YYYY-MM-DD"T"HH24:MI:SS"Z"'), false)
    on conflict (id) do nothing;
  end if;
end $$;
