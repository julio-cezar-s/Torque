import { supabase } from "../../../nucleo/supabase/supabase.jsx";

export async function montarSessao(user) {
  if (user.app_metadata?.role === "admin") return { type: "admin", id: user.id };
  const { data } = await supabase.from("clientes").select("id").eq("auth_id", user.id).maybeSingle();
  return data ? { type: "cliente", id: data.id } : null;
}
