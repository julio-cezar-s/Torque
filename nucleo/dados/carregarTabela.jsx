import { supabase } from "../supabase/supabase.jsx";
import { doBanco } from "./mapeamento/doBanco.jsx";

export async function carregarTabela(tabela) {
  const { data, error } = await supabase.from(tabela).select("*");
  if (error) {
    console.error(`Falha ao carregar "${tabela}"`, error);
    return [];
  }
  return data.map(doBanco);
}
