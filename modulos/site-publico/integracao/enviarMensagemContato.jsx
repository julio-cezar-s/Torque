import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export async function enviarMensagemContato({ nome, email, telefone, assunto, mensagem }) {
  const { error } = await supabase.from("mensagens").insert({
    id: gerarId("m"), nome, email, telefone: telefone || "", assunto: assunto || "", mensagem,
    data: new Date().toISOString().slice(0, 10), lida: false,
  });
  if (error) throw new Error("Não foi possível enviar sua mensagem.");
}
