import { supabase } from "../supabase/supabase.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export async function apiEnviarMensagemContato({ nome, email, telefone, assunto, mensagem }) {
  const { error } = await supabase.from("mensagens").insert({
    id: uid("m"), nome, email, telefone: telefone || "", assunto: assunto || "", mensagem,
    data: new Date().toISOString().slice(0, 10), lida: false,
  });
  if (error) throw new Error("Não foi possível enviar sua mensagem.");
}
