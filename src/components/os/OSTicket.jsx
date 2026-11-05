import { Wrench, Calendar, Star, Printer, Edit2, Trash2 } from "lucide-react";
import { EstrelasExibir } from "../common/EstrelasExibir.jsx";
import { Plate } from "../common/Plate.jsx";
import { Stamp } from "../common/Stamp.jsx";
import { STATUS } from "../../constants/STATUS.jsx";
import { STATUS_ORDER } from "../../constants/STATUS_ORDER.jsx";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";
import { fmtData } from "../../utils/formato/fmtData.jsx";

export function OSTicket({ ordem, cliente, veiculo, onStatusChange, onDelete, onEdit, onRecibo, onAvaliar, avaliacao, readOnly, hideCliente }) {
  const total = ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0);
  return (
    <div className="wf-ticket">
      <div className="wf-ticket__perf"><span className="wf-ticket__hole" /><span className="wf-ticket__hole" /></div>
      <div className="wf-ticket__top">
        <span className="wf-mono wf-ticket__num">{ordem.numero}</span>
        <div className="wf-ticket__stampwrap"><Stamp status={ordem.status} /></div>
      </div>
      {!hideCliente && <div className="wf-ticket__cliente">{cliente?.nome || "Cliente removido"}</div>}
      <div className="wf-ticket__veiculo">
        <Plate>{veiculo?.placa || "—"}</Plate>
        <span>{veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}` : ""}</span>
      </div>
      <p className="wf-ticket__desc">{ordem.descricao || "Sem descrição informada."}</p>
      <div className="wf-ticket__meta">
        <span><Wrench size={13} /> {ordem.mecanico}</span>
        <span><Calendar size={13} /> Previsão {fmtData(ordem.previsao)}</span>
      </div>
      {(avaliacao || onAvaliar) && (
        <div className="wf-ticket__avaliacao">
          {avaliacao ? (
            <>
              <EstrelasExibir nota={avaliacao.nota} size={13} />
              {avaliacao.comentario && <span className="wf-ticket__avaliacao-comentario">"{avaliacao.comentario}"</span>}
            </>
          ) : (
            <button className="wf-link" onClick={() => onAvaliar(ordem)}><Star size={13} /> Avaliar atendimento</button>
          )}
        </div>
      )}
      <div className="wf-ticket__footer">
        {!readOnly ? (
          <select className="wf-select wf-select--ticket" value={ordem.status} onChange={(e) => onStatusChange(ordem.id, e.target.value)}>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </select>
        ) : <span className="wf-muted" style={{ fontSize: 12 }}>Acompanhamento</span>}
        <span className="wf-mono wf-ticket__total">{fmtBRL(total)}</span>
        {onRecibo && <button className="wf-iconbtn" onClick={() => onRecibo(ordem)} title="Ver / baixar comprovante"><Printer size={15} /></button>}
        {!readOnly && (
          <>
            <button className="wf-iconbtn" onClick={() => onEdit(ordem)} title="Editar OS"><Edit2 size={15} /></button>
            <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => onDelete(ordem.id)} title="Excluir OS"><Trash2 size={15} /></button>
          </>
        )}
      </div>
    </div>
  );
}
