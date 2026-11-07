// Clientes que mais pagaram no período (pagamento → ordem → cliente).
export function melhoresClientes(pagamentos, ordens, clientes, meses, limite = 5) {
  const soma = {};
  pagamentos.forEach((p) => {
    if (!meses.includes(String(p.data).slice(0, 7))) return;
    const ordem = ordens.find((o) => o.id === p.ordemId);
    const nome = clientes.find((c) => c.id === ordem?.clienteId)?.nome || "Cliente removido";
    soma[nome] = (soma[nome] || 0) + Number(p.valor || 0);
  });
  return Object.entries(soma).map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo)).slice(0, limite);
}
