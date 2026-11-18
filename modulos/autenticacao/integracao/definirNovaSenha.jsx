import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { traduzirErroAutenticacao } from "./traduzirErroAutenticacao.jsx";

// Usada depois que a pessoa abre o link do e-mail de recuperação.
export async function definirNovaSenha(senha) {
  const { error } = await supabase.auth.updateUser({ password: senha });
  if (error) throw new Error(traduzirErroAutenticacao(error, "Não foi possível definir a nova senha."));
}
