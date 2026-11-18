import { supabase } from "../supabase/supabase.jsx";

// Escuta o Supabase Realtime: sempre que alguém inserir, alterar ou apagar uma linha
// das tabelas informadas, chama aoMudar(nomeDaTabela). Devolve a função que cancela a escuta.
export function assinarMudancas(tabelas, aoMudar) {
  const canal = supabase.channel("torque-tempo-real");
  tabelas.forEach((tabela) => {
    canal.on("postgres_changes", { event: "*", schema: "public", table: tabela }, () => aoMudar(tabela));
  });
  canal.subscribe();
  return () => { supabase.removeChannel(canal); };
}
