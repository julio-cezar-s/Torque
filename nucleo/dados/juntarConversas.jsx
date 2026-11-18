// Monta as conversas no formato que as telas usam ({ ..., mensagens: [...] })
// a partir das duas tabelas do banco: "conversas" e "mensagens_chat" (uma linha por mensagem).
export function juntarConversas(conversas, mensagensChat) {
  const porConversa = new Map();
  for (const m of mensagensChat) {
    if (!porConversa.has(m.conversaId)) porConversa.set(m.conversaId, []);
    porConversa.get(m.conversaId).push({ id: m.id, autor: m.autor, texto: m.texto, data: m.data, lida: m.lida });
  }
  return conversas.map((c) => ({
    ...c,
    mensagens: (porConversa.get(c.id) || []).sort((a, b) => (a.data === b.data ? (a.id < b.id ? -1 : 1) : a.data < b.data ? -1 : 1)),
  }));
}
