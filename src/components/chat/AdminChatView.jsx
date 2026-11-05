import { useState } from "react";
import { Send } from "lucide-react";
import { ultimaMensagem } from "../../utils/chat/ultimaMensagem.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function AdminChatView({ conversas, setConversas, clientes }) {
  const [selectedId, setSelectedId] = useState(null);
  const [texto, setTexto] = useState("");

  const lista = [...conversas].sort((a, b) => {
    const da = ultimaMensagem(a)?.data || ""; const db = ultimaMensagem(b)?.data || "";
    return da < db ? 1 : -1;
  });
  const selecionada = conversas.find((c) => c.id === selectedId) || null;

  const abrir = (conversa) => {
    setSelectedId(conversa.id);
    setConversas((prev) => prev.map((c) => (c.id === conversa.id ? { ...c, mensagens: c.mensagens.map((m) => (m.autor === "cliente" ? { ...m, lida: true } : m)) } : c)));
  };

  const enviar = () => {
    if (!texto.trim() || !selecionada) return;
    const nova = { id: uid("msg"), autor: "admin", texto: texto.trim(), data: new Date().toISOString(), lida: false };
    setConversas((prev) => prev.map((c) => (c.id === selecionada.id ? { ...c, mensagens: [...c.mensagens, nova] } : c)));
    setTexto("");
  };

  const nomeCliente = (conversa) => clientes.find((c) => c.id === conversa.clienteId)?.nome || conversa.clienteNome || "Cliente";

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Suporte</p><h1>Conversas com Clientes</h1></div></div>
      {lista.length === 0 ? <p className="wf-empty-note">Nenhuma conversa iniciada até o momento.</p> : (
        <div className="wf-chat-wrap">
          <div className="wf-chat-list">
            {lista.map((c) => {
              const ultima = ultimaMensagem(c);
              const naoLidas = c.mensagens.filter((m) => m.autor === "cliente" && !m.lida).length;
              return (
                <button key={c.id} className={`wf-chat-list__item ${selectedId === c.id ? "active" : ""}`} onClick={() => abrir(c)}>
                  <span className="wf-chat-list__nome">{nomeCliente(c)}</span>
                  <span className="wf-chat-list__preview">{ultima?.texto || "—"}</span>
                  {naoLidas > 0 && <span className="wf-chat-list__badge">{naoLidas}</span>}
                </button>
              );
            })}
          </div>
          <div className="wf-chat-thread">
            {!selecionada ? (
              <p className="wf-empty-note">Selecione uma conversa para visualizar.</p>
            ) : (
              <>
                <div className="wf-chat-thread__head">{nomeCliente(selecionada)}</div>
                <div className="wf-chat-thread__body">
                  {selecionada.mensagens.map((m) => (
                    <div key={m.id} className={`wf-chat-msg ${m.autor === "admin" ? "wf-chat-msg--mine" : ""}`}>
                      <p>{m.texto}</p>
                      <span>{new Date(m.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
                <div className="wf-chatpanel__foot">
                  <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Responder ao cliente..." onKeyDown={(e) => { if (e.key === "Enter") enviar(); }} />
                  <button className="wf-iconbtn wf-iconbtn--accent" onClick={enviar}><Send size={16} /></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
