import { supabase } from "../supabase/supabase.jsx";

export async function apiLogout() {
  try { await supabase.auth.signOut(); } catch (err) { /* sem problema: o app limpa o estado local de qualquer forma */ }
}
