import { situacaoEstoque } from "./situacaoEstoque.jsx";

// Peças esgotadas ou no mínimo/abaixo dele; as esgotadas vêm primeiro, depois as mais próximas de acabar.
export function pecasComEstoqueBaixo(estoque) {
  const peso = { esgotado: 0, baixo: 1 };
  return estoque
    .filter((p) => situacaoEstoque(p) !== "ok")
    .sort((a, b) => peso[situacaoEstoque(a)] - peso[situacaoEstoque(b)] || a.quantidade - b.quantidade || a.nome.localeCompare(b.nome));
}
