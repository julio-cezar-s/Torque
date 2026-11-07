export const confirmarExclusaoVeiculo = (veiculoId, ordens, agendamentos) => {
  const osVinculadas = ordens.filter((o) => o.veiculoId === veiculoId).length;
  const agVinculados = agendamentos.filter((a) => a.veiculoId === veiculoId).length;
  if (!osVinculadas && !agVinculados) return confirm("Excluir este veículo?");
  const partes = [];
  if (osVinculadas) partes.push(`${osVinculadas} ordem(ns) de serviço`);
  if (agVinculados) partes.push(`${agVinculados} agendamento(s)`);
  return confirm(`Este veículo está vinculado a ${partes.join(" e ")}, que serão mantidos no histórico sem a referência do veículo. Deseja excluir mesmo assim?`);
};
