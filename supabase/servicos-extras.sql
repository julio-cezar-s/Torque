-- Torque · Serviços adicionais do catálogo
-- Rode no SQL Editor do Supabase. Pode rodar de novo sem duplicar.
-- Os preços são estimativas: ajuste depois pelo painel admin (Serviços).

insert into public.servicos (id, nome, categoria, descricao, preco, duracao) values
  ('s-oleo-sint',   'Troca de óleo sintético',          'Manutenção',          'Óleo 100% sintético e filtro de óleo novo, com verificação dos níveis.',               280, '1h'),
  ('s-filtros',     'Troca de filtros (ar, cabine, combustível)', 'Manutenção', 'Substituição dos filtros de ar do motor, ar-condicionado e combustível.',             220, '1h'),
  ('s-correia',     'Troca da correia dentada',         'Manutenção',          'Substituição da correia dentada, tensor e correia auxiliar.',                           650, '4h'),
  ('s-velas',       'Troca de velas e cabos',           'Manutenção',          'Substituição do jogo de velas e inspeção dos cabos de ignição.',                        240, '1h30'),
  ('s-revisao-sim', 'Revisão preventiva simples',       'Revisão',             'Inspeção de óleo, filtros, fluidos, pneus, iluminação e itens básicos de segurança.',   190, '1h30'),
  ('s-viagem',      'Check-up para viagem',             'Revisão',             'Checklist completo de segurança antes de viajar: freios, pneus, suspensão e fluidos.',  230, '2h'),
  ('s-pastilhas',   'Troca de pastilhas de freio',      'Freios',              'Substituição das pastilhas dianteiras ou traseiras, com limpeza do sistema.',           320, '1h30'),
  ('s-discos',      'Troca de discos de freio',         'Freios',              'Substituição dos discos e pastilhas, com sangria do sistema.',                          780, '3h'),
  ('s-fluido',      'Troca do fluido de freio',         'Freios',              'Drenagem completa e reposição do fluido de freio.',                                     150, '1h'),
  ('s-amortec',     'Troca de amortecedores',           'Suspensão',           'Substituição de amortecedores com coxins e batentes, eixo dianteiro ou traseiro.',      900, '4h'),
  ('s-pivo',        'Troca de pivôs e buchas',          'Suspensão',           'Substituição de pivôs, terminais e buchas da bandeja.',                                 420, '2h30'),
  ('s-bateria',     'Troca de bateria',                 'Elétrica',            'Teste do sistema de carga e instalação de bateria nova.',                               120, '40min'),
  ('s-diag-eletr',  'Diagnóstico elétrico e scanner',   'Elétrica',            'Leitura de falhas com scanner e diagnóstico de problemas elétricos e luzes no painel.', 160, '1h'),
  ('s-ar-higien',   'Higienização do ar-condicionado',  'Ar-condicionado',     'Limpeza do sistema, troca do filtro de cabine e tratamento antibactérias.',             180, '1h'),
  ('s-ar-gas',      'Recarga de gás do ar-condicionado','Ar-condicionado',     'Teste de vazamento e recarga de gás refrigerante.',                                     250, '1h30'),
  ('s-pneus',       'Troca de pneus',                   'Pneus e Alinhamento', 'Montagem e balanceamento de pneus novos (preço por pneu, sem o valor do pneu).',         60,  '40min'),
  ('s-cambagem',    'Alinhamento 3D',                   'Pneus e Alinhamento', 'Alinhamento computadorizado de convergência, cambagem e cáster.',                       130, '1h'),
  ('s-pintura-peq', 'Reparo de pintura localizado',     'Funilaria e Pintura', 'Retoque e repintura de pequenas áreas, como arranhões e amassados leves.',              480, '2 dias'),
  ('s-polimento',   'Polimento e cristalização',        'Funilaria e Pintura', 'Polimento técnico da lataria com proteção da pintura.',                                  350, '1 dia'),
  ('s-injecao',     'Limpeza de bicos e corpo de borboleta', 'Outros',         'Limpeza do sistema de injeção para melhorar o consumo e a resposta do motor.',          210, '1h30')
on conflict (id) do nothing;
