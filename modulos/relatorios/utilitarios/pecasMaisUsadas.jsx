// Peças mais usadas nas ordens de serviço do período (soma das quantidades).
export function pecasMaisUsadas(ordens, meses, limite = 5) {
  const contagem = {};
  ordens.forEach((o) => {
    if (!meses.includes(String(o.dataEntrada).slice(0, 7))) return;
    (o.itens || []).forEach((i) => {
      if (i.tipo !== "peca") return;
      contagem[i.descricao] = (contagem[i.descricao] || 0) + (Number(i.quantidade) || 1);
    });
  });
  return Object.entries(contagem).map(([rotulo, valor]) => ({ rotulo, valor })).sort((a, b) => b.valor - a.valor || a.rotulo.localeCompare(b.rotulo)).slice(0, limite);
}
