import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";
import { obterConversaDoCliente } from "../utilitarios/obterConversaDoCliente.jsx";

export function BalaoChat({ clienteId, clienteNome, conversas, setConversas }) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const conversa = obterConversaDoCliente(conversas, clienteId);
  const mensagens = conversa?.mensagens || [];
  const naoLidas = mensagens.filter((m) => m.autor === "admin" && !m.lida).length;

  const marcarLidas = () => {
    if (!conversa) return;
    setConversas((prev) => prev.map((c) => (c.id === conversa.id ? { ...c, mensagens: c.mensagens.map((m) => (m.autor === "admin" ? { ...m, lida: true } : m)) } : c)));
  };

  const toggle = () => { setOpen((v) => { if (!v) marcarLidas(); return !v; }); };

  const enviar = () => {
    if (!texto.trim()) return;
    const nova = { id: gerarId("msg"), autor: "cliente", texto: texto.trim(), data: new Date().toISOString(), lida: false };
    if (conversa) {
      setConversas((prev) => prev.map((c) => (c.id === conversa.id ? { ...c, mensagens: [...c.mensagens, nova] } : c)));
    } else {
      setConversas((prev) => [...prev, { id: gerarId("cv"), clienteId, clienteNome, mensagens: [nova] }]);
    }
    setTexto("");
  };

  return (
    <div className="wf-chatbubble-wrap">
      {open && (
        <div className="wf-chatpanel">
          <div className="wf-chatpanel__head">
            <span><MessageCircle size={16} /> Fale com a oficina</span>
            <button className="wf-iconbtn" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <div className="wf-chatpanel__body">
            {mensagens.length === 0 ? (
              <p className="wf-empty-note" style={{ padding: "12px 4px" }}>Envie uma mensagem para tirar dúvidas ou solicitar algo à equipe da oficina.</p>
            ) : mensagens.map((m) => (
              <div key={m.id} className={`wf-chat-msg ${m.autor === "cliente" ? "wf-chat-msg--mine" : ""}`}>
                <p>{m.texto}</p>
                <span>{new Date(m.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
          <div className="wf-chatpanel__foot">
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite sua mensagem..." onKeyDown={(e) => { if (e.key === "Enter") enviar(); }} />
            <button className="wf-iconbtn wf-iconbtn--accent" onClick={enviar}><Send size={16} /></button>
          </div>
        </div>
      )}
      <button className="wf-chatbubble" onClick={toggle}>
        <MessageCircle size={22} />
        {naoLidas > 0 && !open && <span className="wf-chatbubble__badge">{naoLidas}</span>}
      </button>
    </div>
  );
}
