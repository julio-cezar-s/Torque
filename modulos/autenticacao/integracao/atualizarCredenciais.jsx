import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { traduzirErroAutenticacao } from "./traduzirErroAutenticacao.jsx";

// Troca e-mail e/ou senha do login do cliente (o e-mail novo pode exigir confirmação).
export async function atualizarCredenciais({ email, senha }) {
  const { data: atual } = await supabase.auth.getUser();
  const mudou = {};
  if (email && email.toLowerCase() !== (atual?.user?.email || "").toLowerCase()) mudou.email = email;
  if (senha) mudou.password = senha;
  if (!Object.keys(mudou).length) return { emailPendente: false };
  const { error } = await supabase.auth.updateUser(mudou);
  if (error) throw new Error(traduzirErroAutenticacao(error, "Não foi possível atualizar seus dados de acesso."));
  return { emailPendente: Boolean(mudou.email) };
}
