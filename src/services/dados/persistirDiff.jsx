import { supabase } from "../supabase/supabase.jsx";
import { paraBanco } from "../mapeamento/paraBanco.jsx";
import { notificarFalha } from "../supabase/avisoDeFalha.jsx";

let fila = Promise.resolve();

export function persistirDiff(tabela, antes, depois) {
  const anteriores = new Map(antes.map((x) => [x.id, x]));
  const idsDepois = new Set(depois.map((x) => x.id));

  const novos = depois.filter((x) => !anteriores.has(x.id));
  const alterados = depois.filter((x) => anteriores.has(x.id) && JSON.stringify(anteriores.get(x.id)) !== JSON.stringify(x));
  const removidos = antes.filter((x) => !idsDepois.has(x.id)).map((x) => x.id);
  if (!novos.length && !alterados.length && !removidos.length) return;

  fila = fila.then(async () => {
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
    notificarFalha(`Não foi possível salvar as alterações em "${tabela}". Os dados foram recarregados do servidor.`);
  });
}
