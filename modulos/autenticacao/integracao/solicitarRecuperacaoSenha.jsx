import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { traduzirErroAutenticacao } from "./traduzirErroAutenticacao.jsx";

// Envia o e-mail com o link para criar uma nova senha.
// O link volta para este mesmo site (a URL precisa estar em Authentication > URL Configuration do Supabase).
export async function solicitarRecuperacaoSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
  if (error) throw new Error(traduzirErroAutenticacao(error, "Não foi possível enviar o e-mail de recuperação."));
}
