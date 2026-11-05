import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { montarSessao } from "./montarSessao.jsx";
import { traduzirErroAutenticacao } from "./traduzirErroAutenticacao.jsx";

export async function entrar(email, senha) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw new Error(traduzirErroAutenticacao(error, "E-mail ou senha inválidos."));
  const sessao = await montarSessao(data.user);
  if (!sessao) {
    await supabase.auth.signOut();
    throw new Error("Sua conta ainda não está vinculada a um cadastro de cliente. Fale com a oficina.");
  }
  return sessao;
}
