import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { montarSessao } from "./montarSessao.jsx";
import { traduzirErroAutenticacao } from "./traduzirErroAutenticacao.jsx";

// Retorna { sessao } quando o usuário já entra logado, ou { precisaConfirmar: true }
// quando o projeto exige confirmação de e-mail.
export async function registrarCliente({ nome, email, telefone, senha }) {
  const { data, error } = await supabase.auth.signUp({
    email, password: senha, options: { data: { nome, telefone } },
  });
  if (error) throw new Error(traduzirErroAutenticacao(error, "Não foi possível criar sua conta."));
  if (!data.session) return { precisaConfirmar: true };
  const sessao = await montarSessao(data.user);
  if (!sessao) {
    console.error("Conta criada, mas a linha em \"clientes\" não foi gerada. Rode o supabase/schema.sql no SQL Editor do Supabase.");
    throw new Error("Sua conta foi criada, mas não conseguimos concluir o cadastro. Tente entrar em alguns instantes ou fale com a oficina.");
  }
  return { sessao };
}
