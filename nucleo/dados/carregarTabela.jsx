import { carregarTabelaSegura } from "./carregarTabelaSegura.jsx";

// Carga inicial: se der erro, a tela começa com a lista vazia.
export async function carregarTabela(tabela) {
  return (await carregarTabelaSegura(tabela)) ?? [];
}
