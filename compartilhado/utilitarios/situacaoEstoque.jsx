// "esgotado" = acabou; "baixo" = no mínimo ou abaixo dele; "ok" = acima do mínimo.
export function situacaoEstoque(peca) {
  const qtd = Number(peca.quantidade) || 0;
  if (qtd <= 0) return "esgotado";
  if (qtd <= (Number(peca.quantidadeMinima) || 0)) return "baixo";
  return "ok";
}
