// Nome da tabela como o usuário entende (nunca mostramos o nome técnico em mensagens).
const NOMES = {
  clientes: "clientes", veiculos: "veículos", ordens: "ordens de serviço", estoque: "estoque",
  servicos: "serviços", agendamentos: "agendamentos", mensagens: "mensagens recebidas",
  pagamentos: "pagamentos", conversas: "o chat", avaliacoes: "avaliações",
};
export const nomeAmigavelTabela = (tabela) => NOMES[tabela] || "os dados";
