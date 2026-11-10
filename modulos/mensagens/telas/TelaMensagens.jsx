import { useState } from "react";
import { Trash2, Mail, Phone } from "lucide-react";
import { CampoBusca } from "../../../compartilhado/componentes/CampoBusca.jsx";
import { SemResultados } from "../../../compartilhado/componentes/SemResultados.jsx";
import { ContagemResultados } from "../../../compartilhado/componentes/ContagemResultados.jsx";
import { correspondeBusca } from "../../../compartilhado/utilitarios/correspondeBusca.jsx";
import { Selo } from "../../../compartilhado/componentes/Selo.jsx";
import { formatarData } from "../../../compartilhado/utilitarios/formatarData.jsx";

export function TelaMensagens({ mensagens, setMensagens }) {
  const [expandedId, setExpandedId] = useState(null);
  const [busca, setBusca] = useState("");
  const [soNaoLidas, setSoNaoLidas] = useState(false);
  const naoLidas = mensagens.filter((m) => !m.lida).length;
  const ordenadas = [...mensagens]
    .filter((m) => !soNaoLidas || !m.lida)
    .filter((m) => correspondeBusca(`${m.nome} ${m.email} ${m.telefone || ""} ${m.assunto} ${m.mensagem}`, busca))
    .sort((a, b) => (a.data < b.data ? 1 : -1));
  const filtrosAtivos = soNaoLidas || busca.trim() !== "";
  const limparFiltros = () => { setSoNaoLidas(false); setBusca(""); };

  const toggle = (m) => {
    setExpandedId((prev) => (prev === m.id ? null : m.id));
    if (!m.lida) setMensagens((prev) => prev.map((x) => (x.id === m.id ? { ...x, lida: true } : x)));
  };
  const handleDelete = (id) => { if (confirm("Excluir esta mensagem?")) setMensagens((prev) => prev.filter((m) => m.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Contato</p><h1>Mensagens Recebidas</h1></div>
        {naoLidas > 0 && <Selo accent>{naoLidas} não lida{naoLidas > 1 ? "s" : ""}</Selo>}
      </div>
      {mensagens.length > 0 && (
        <div className="wf-toolbar">
          <div className="wf-toolbar__linha"><CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome, e-mail, assunto ou texto..." /></div>
          <div className="wf-pills">
            <button className={`wf-pill ${!soNaoLidas ? "active" : ""}`} onClick={() => setSoNaoLidas(false)}>Todas ({mensagens.length})</button>
            <button className={`wf-pill ${soNaoLidas ? "active" : ""}`} style={{ "--pill-color": "#C4441E" }} onClick={() => setSoNaoLidas(true)}>Não lidas ({naoLidas})</button>
          </div>
          <ContagemResultados mostrando={ordenadas.length} total={mensagens.length} />
        </div>
      )}
      {ordenadas.length === 0 ? <SemResultados mensagem={mensagens.length === 0 ? "Nenhuma mensagem recebida ainda." : "Nenhuma mensagem encontrada."} aoLimpar={mensagens.length > 0 && filtrosAtivos ? limparFiltros : undefined} /> : (
        <div className="wf-msg-list">
          {ordenadas.map((m) => (
            <div key={m.id} className={`wf-msg-row ${!m.lida ? "unread" : ""}`}>
              <div className="wf-msg-row__head" onClick={() => toggle(m)}>
                {!m.lida && <span className="wf-msg-dot" />}
                <div className="wf-msg-row__info">
                  <span className="wf-msg-row__nome">{m.nome}</span>
                  <span className="wf-msg-row__assunto">{m.assunto}</span>
                </div>
                <span className="wf-muted wf-mono">{formatarData(m.data)}</span>
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
