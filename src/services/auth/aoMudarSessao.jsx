import { supabase } from "../supabase/supabase.jsx";

export function aoMudarSessao(callback) {
  const { data } = supabase.auth.onAuthStateChange((evento) => { if (evento === "SIGNED_OUT") callback(); });
  return () => data.subscription.unsubscribe();
}
