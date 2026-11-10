// Serviços mais pedidos nos agendamentos (cancelados não contam).
export function servicosMaisAgendados(agendamentos, servicos, meses, limite = 5) {
  const contagem = {};
  agendamentos.forEach((a) => {
    if (a.status === "cancelado" || !meses.includes(String(a.data).slice(0, 7))) return;
    const nome = servicos.find((s) => s.id === a.servicoId)?.nome || "Serviço removido";
    contagem[nome] = (contagem[nome] || 0) + 1;
  });
  return Object.entries(contagem).map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo)).slice(0, limite);
}
