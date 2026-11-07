import { supabase } from "../supabase/supabase.jsx";
import { paraBanco } from "./mapeamento/paraBanco.jsx";
import { notificarFalha } from "../supabase/avisoDeFalha.jsx";
import { enfileirarGravacao } from "./filaDeGravacao.jsx";

// Cada mensagem do chat é uma LINHA própria em "mensagens_chat". Assim, duas pessoas
// enviando ao mesmo tempo gravam linhas diferentes e nenhuma mensagem se perde.
const mesmo = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const dadosConversa = ({ id, clienteId, clienteNome }) => ({ id, clienteId, clienteNome });
const achatar = (lista) => lista.flatMap((c) => c.mensagens.map((m) => ({ ...m, conversaId: c.id, clienteId: c.clienteId })));

export function persistirConversas(antes, depois) {
  const convAntes = new Map(antes.map((c) => [c.id, dadosConversa(c)]));
  const idsConvDepois = new Set(depois.map((c) => c.id));
  const convNovas = depois.filter((c) => !convAntes.has(c.id)).map(dadosConversa);
  const convAlteradas = depois.filter((c) => convAntes.has(c.id) && !mesmo(convAntes.get(c.id), dadosConversa(c))).map(dadosConversa);
  const convRemovidas = antes.filter((c) => !idsConvDepois.has(c.id)).map((c) => c.id);

  const msgAntes = new Map(achatar(antes).map((m) => [m.id, m]));
  const msgDepois = achatar(depois);
  const idsMsgDepois = new Set(msgDepois.map((m) => m.id));
  const msgNovas = msgDepois.filter((m) => !msgAntes.has(m.id));
  const msgAlteradas = msgDepois.filter((m) => msgAntes.has(m.id) && !mesmo(msgAntes.get(m.id), m));
  // mensagens de uma conversa apagada saem junto (ON DELETE CASCADE); aqui só as removidas de conversas que continuam
  const msgRemovidas = [...msgAntes.values()].filter((m) => !idsMsgDepois.has(m.id) && idsConvDepois.has(m.conversaId)).map((m) => m.id);

  if (![convNovas, convAlteradas, convRemovidas, msgNovas, msgAlteradas, msgRemovidas].some((l) => l.length)) return;

  enfileirarGravacao(async () => {
    if (convNovas.length) {
      const { error } = await supabase.from("conversas").insert(convNovas.map(paraBanco));
      if (error) throw error;
    }
    for (const c of convAlteradas) {
      const { id, ...resto } = paraBanco(c);
      const { error } = await supabase.from("conversas").update(resto).eq("id", id);
      if (error) throw error;
    }
    if (msgNovas.length) {
      const { error } = await supabase.from("mensagens_chat").insert(msgNovas.map(paraBanco));
      if (error) throw error;
    }
    for (const m of msgAlteradas) {
      const { id, ...resto } = paraBanco(m);
      const { error } = await supabase.from("mensagens_chat").update(resto).eq("id", id);
      if (error) throw error;
    }
    if (msgRemovidas.length) {
      const { error } = await supabase.from("mensagens_chat").delete().in("id", msgRemovidas);
      if (error) throw error;
    }
    if (convRemovidas.length) {
      const { error } = await supabase.from("conversas").delete().in("id", convRemovidas);
      if (error) throw error;
    }
  }).catch((err) => {
    console.error('Falha ao salvar "conversas"', err);
    notificarFalha("Não foi possível enviar sua mensagem no chat. Verifique sua conexão e tente novamente.");
  });
}
