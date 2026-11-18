import { supabase } from "../../../nucleo/supabase/supabase.jsx";

export async function sair() {
  try { await supabase.auth.signOut(); } catch (err) { /* sem problema: o app limpa o estado local de qualquer forma */ }
}
