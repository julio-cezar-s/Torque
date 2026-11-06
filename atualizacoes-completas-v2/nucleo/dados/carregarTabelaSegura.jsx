import { supabase } from "../supabase/supabase.jsx";
import { doBanco } from "./mapeamento/doBanco.jsx";
import { juntarConversas } from "./juntarConversas.jsx";

// Lê uma tabela inteira. Em caso de erro devolve null (em vez de lista vazia),
// para uma falha de rede nunca apagar os dados que já estão na tela.
// "conversas" é montada juntando a tabela de conversas com a de mensagens do chat.
export async function carregarTabelaSegura(tabela) {
  if (tabela === "conversas") {
    const [conversas, mensagens] = await Promise.all([
      supabase.from("conversas").select("*"),
      supabase.from("mensagens_chat").select("*"),
    ]);
    const erro = conversas.error || mensagens.error;
    if (erro) { console.error('Falha ao carregar "conversas"', erro); return null; }
    return juntarConversas(conversas.data.map(doBanco), mensagens.data.map(doBanco));
  }

  const { data, error } = await supabase.from(tabela).select("*");
  if (error) {
    console.error(`Falha ao carregar "${tabela}"`, error);
    return null;
  }
  return data.map(doBanco);
}
