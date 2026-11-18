import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { montarSessao } from "./montarSessao.jsx";

export async function carregarSessao() {
  try {
    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;
    return user ? await montarSessao(user) : null;
  } catch (err) {
    console.error("Não foi possível carregar a sessão.", err);
    return null;
  }
}
