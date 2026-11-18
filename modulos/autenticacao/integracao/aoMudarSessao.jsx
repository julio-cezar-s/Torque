import { supabase } from "../../../nucleo/supabase/supabase.jsx";

// aoSair: o usuário saiu (ou a sessão expirou). aoRecuperarSenha: abriu o link do e-mail "Esqueci minha senha".
export function aoMudarSessao(aoSair, aoRecuperarSenha) {
  const { data } = supabase.auth.onAuthStateChange((evento) => {
    if (evento === "SIGNED_OUT") aoSair();
    if (evento === "PASSWORD_RECOVERY") aoRecuperarSenha?.();
  });
  return () => data.subscription.unsubscribe();
}
