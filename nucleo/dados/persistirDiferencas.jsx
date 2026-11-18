import { supabase } from "../supabase/supabase.jsx";
import { paraBanco } from "./mapeamento/paraBanco.jsx";
import { nomeAmigavelTabela } from "../supabase/nomeAmigavelTabela.jsx";
import { notificarFalha } from "../supabase/avisoDeFalha.jsx";
import { enfileirarGravacao } from "./filaDeGravacao.jsx";
import { persistirConversas } from "./persistirConversas.jsx";

export function persistirDiferencas(tabela, antes, depois) {
  if (tabela === "conversas") return persistirConversas(antes, depois);

  const anteriores = new Map(antes.map((x) => [x.id, x]));
  const idsDepois = new Set(depois.map((x) => x.id));

  const novos = depois.filter((x) => !anteriores.has(x.id));
  const alterados = depois.filter((x) => anteriores.has(x.id) && JSON.stringify(anteriores.get(x.id)) !== JSON.stringify(x));
  const removidos = antes.filter((x) => !idsDepois.has(x.id)).map((x) => x.id);
  if (!novos.length && !alterados.length && !removidos.length) return;

  enfileirarGravacao(async () => {
    if (novos.length) {
      const { error } = await supabase.from(tabela).insert(novos.map(paraBanco));
      if (error) throw error;
    }
    for (const item of alterados) {
      const { id, ...resto } = paraBanco(item);
      const { error } = await supabase.from(tabela).update(resto).eq("id", id);
      if (error) throw error;
    }
    if (removidos.length) {
      const { error } = await supabase.from(tabela).delete().in("id", removidos);
      if (error) throw error;
    }
  }).catch((err) => {
    console.error(`Falha ao salvar "${tabela}"`, err);
    notificarFalha(`Não foi possível salvar as alterações em ${nomeAmigavelTabela(tabela)}. Verifique sua conexão; a lista foi atualizada com os dados do servidor.`);
  });
}
