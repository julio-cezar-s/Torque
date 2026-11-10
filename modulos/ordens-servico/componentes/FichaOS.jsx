import { Wrench, Calendar, Star, Printer, Edit2, Trash2 } from "lucide-react";
import { EstrelasExibir } from "../../../compartilhado/componentes/EstrelasExibir.jsx";
import { Placa } from "../../../compartilhado/componentes/Placa.jsx";
import { Carimbo } from "../../../compartilhado/componentes/Carimbo.jsx";
import { STATUS } from "../constantes/STATUS.jsx";
import { ORDEM_STATUS } from "../constantes/ORDEM_STATUS.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";
import { formatarData } from "../../../compartilhado/utilitarios/formatarData.jsx";

export function FichaOS({ ordem, cliente, veiculo, onStatusChange, onDelete, onEdit, onRecibo, onAvaliar, avaliacao, readOnly, hideCliente }) {
  const total = ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0);
  return (
    <div className="wf-ticket">
      <div className="wf-ticket__perf"><span className="wf-ticket__hole" /><span className="wf-ticket__hole" /></div>
      <div className="wf-ticket__top">
        <span className="wf-mono wf-ticket__num">{ordem.numero}</span>
        <div className="wf-ticket__stampwrap"><Carimbo status={ordem.status} /></div>
      </div>
      {!hideCliente && <div className="wf-ticket__cliente">{cliente?.nome || "Cliente removido"}</div>}
      <div className="wf-ticket__veiculo">
        <Placa>{veiculo?.placa || "—"}</Placa>
        <span>{veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}` : ""}</span>
      </div>
      <p className="wf-ticket__desc">{ordem.descricao || "Sem descrição informada."}</p>
      <div className="wf-ticket__meta">
        <span><Wrench size={13} /> {ordem.mecanico}</span>
        <span><Calendar size={13} /> Previsão {formatarData(ordem.previsao)}</span>
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
            {ORDEM_STATUS.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </select>
        ) : <span className="wf-muted" style={{ fontSize: 12 }}>Acompanhamento</span>}
        <span className="wf-mono wf-ticket__total">{formatarReais(total)}</span>
        {onRecibo && <button className="wf-iconbtn" onClick={() => onRecibo(ordem)} title="Imprimir / salvar OS em PDF"><Printer size={15} /></button>}
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
