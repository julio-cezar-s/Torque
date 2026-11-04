import { useState } from "react";
import { Trash2, Mail, Phone } from "lucide-react";
import { Badge } from "../../components/common/Badge.jsx";
import { fmtData } from "../../utils/formato/fmtData.jsx";

export function MensagensView({ mensagens, setMensagens }) {
  const [expandedId, setExpandedId] = useState(null);
  const naoLidas = mensagens.filter((m) => !m.lida).length;
  const ordenadas = [...mensagens].sort((a, b) => (a.data < b.data ? 1 : -1));

  const toggle = (m) => {
    setExpandedId((prev) => (prev === m.id ? null : m.id));
    if (!m.lida) setMensagens((prev) => prev.map((x) => (x.id === m.id ? { ...x, lida: true } : x)));
  };
  const handleDelete = (id) => { if (confirm("Excluir esta mensagem?")) setMensagens((prev) => prev.filter((m) => m.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Contato</p><h1>Mensagens Recebidas</h1></div>
        {naoLidas > 0 && <Badge accent>{naoLidas} não lida{naoLidas > 1 ? "s" : ""}</Badge>}
      </div>
      {ordenadas.length === 0 ? <p className="wf-empty-note">Nenhuma mensagem recebida ainda.</p> : (
        <div className="wf-msg-list">
          {ordenadas.map((m) => (
            <div key={m.id} className={`wf-msg-row ${!m.lida ? "unread" : ""}`}>
              <div className="wf-msg-row__head" onClick={() => toggle(m)}>
                {!m.lida && <span className="wf-msg-dot" />}
                <div className="wf-msg-row__info">
                  <span className="wf-msg-row__nome">{m.nome}</span>
                  <span className="wf-msg-row__assunto">{m.assunto}</span>
                </div>
                <span className="wf-muted wf-mono">{fmtData(m.data)}</span>
                <button className="wf-iconbtn wf-iconbtn--danger" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}><Trash2 size={15} /></button>
              </div>
              {expandedId === m.id && (
                <div className="wf-msg-row__body">
                  <p>{m.mensagem}</p>
                  <div className="wf-msg-row__contact"><Mail size={13} /> {m.email}{m.telefone && <> · <Phone size={13} /> {m.telefone}</>}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
