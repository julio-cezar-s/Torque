import { supabase } from "../supabase/supabase.jsx";
import { montarSessao } from "./montarSessao.jsx";
import { traduzirErroAuth } from "./traduzirErroAuth.jsx";

// Retorna { sessao } quando o usuário já entra logado, ou { precisaConfirmar: true }
// quando o projeto exige confirmação de e-mail.
export async function apiRegistrarCliente({ nome, email, telefone, senha }) {
  const { data, error } = await supabase.auth.signUp({
    email, password: senha, options: { data: { nome, telefone } },
  });
  if (error) throw new Error(traduzirErroAuth(error, "Não foi possível criar sua conta."));
  if (!data.session) return { precisaConfirmar: true };
  const sessao = await montarSessao(data.user);
  if (!sessao) throw new Error("Conta criada, mas o cadastro de cliente não foi gerado. Rode o schema.sql do Supabase.");
  return { sessao };
}
