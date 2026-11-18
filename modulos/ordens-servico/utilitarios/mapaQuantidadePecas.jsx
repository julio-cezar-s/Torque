export function mapaQuantidadePecas(itens) {
  const m = {};
  (itens || []).forEach((i) => { if (i.tipo === "peca" && i.pecaId) m[i.pecaId] = (m[i.pecaId] || 0) + (Number(i.quantidade) || 0); });
  return m;
}
