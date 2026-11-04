import { X, Wrench, Printer } from "lucide-react";
import { Plate } from "../common/Plate.jsx";
import { Stamp } from "../common/Stamp.jsx";
import { OFICINA_INFO } from "../../constants/OFICINA_INFO.jsx";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";
import { fmtData } from "../../utils/formato/fmtData.jsx";

export function ReciboOS({ ordem, cliente, veiculo, pagamentos, onClose }) {
  const total = ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0);
  const pago = (pagamentos || []).filter((p) => p.ordemId === ordem.id).reduce((s, p) => s + Number(p.valor || 0), 0);
  const saldo = total - pago;
  const emitidoEm = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="wf-modal-veil wf-recibo-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wf-modal wf-recibo-modal">
        <div className="wf-modal__head wf-recibo-noimprimir">
          <h3>Comprovante · {ordem.numero}</h3>
          <button className="wf-iconbtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="wf-modal__body">
          <div className="wf-recibo">
            <div className="wf-recibo__cabecalho">
              <div>
                <div className="wf-recibo__marca"><Wrench size={20} /> Torque</div>
                <p>{OFICINA_INFO.endereco}</p>
                <p>{OFICINA_INFO.telefone} · {OFICINA_INFO.email}</p>
              </div>
              <div className="wf-recibo__doc">
                <p className="wf-eyebrow">Comprovante de Ordem de Serviço</p>
                <p className="wf-mono wf-recibo__numero">{ordem.numero}</p>
                <p className="wf-muted">Emitido em {emitidoEm}</p>
              </div>
            </div>

            <div className="wf-recibo__grid">
              <div>
                <span className="wf-recibo__label">Cliente</span>
                <p>{cliente?.nome || "—"}</p>
                {cliente?.telefone && <p className="wf-muted">{cliente.telefone}</p>}
              </div>
              <div>
                <span className="wf-recibo__label">Veículo</span>
                <p>{veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}` : "—"}</p>
                {veiculo?.placa && <p className="wf-muted"><Plate>{veiculo.placa}</Plate></p>}
              </div>
              <div>
                <span className="wf-recibo__label">Mecânico responsável</span>
                <p>{ordem.mecanico || "—"}</p>
              </div>
              <div>
                <span className="wf-recibo__label">Status</span>
                <p><Stamp status={ordem.status} size="sm" /></p>
              </div>
              <div>
                <span className="wf-recibo__label">Data de entrada</span>
                <p>{fmtData(ordem.dataEntrada)}</p>
              </div>
              <div>
                <span className="wf-recibo__label">Previsão de entrega</span>
                <p>{fmtData(ordem.previsao)}</p>
              </div>
            </div>

            {ordem.descricao && (
              <div className="wf-recibo__desc">
                <span className="wf-recibo__label">Descrição do serviço</span>
                <p>{ordem.descricao}</p>
              </div>
            )}

            <table className="wf-recibo__tabela">
              <thead><tr><th>Item</th><th>Valor</th></tr></thead>
              <tbody>
                {ordem.itens.length === 0 ? (
                  <tr><td colSpan={2} className="wf-muted">Nenhum item registrado.</td></tr>
                ) : ordem.itens.map((item) => (
                  <tr key={item.id}>
                    <td>{item.descricao}{item.tipo === "peca" && item.quantidade ? ` (x${item.quantidade})` : ""}</td>
                    <td className="wf-mono">{fmtBRL(item.valor)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td>Total</td><td className="wf-mono">{fmtBRL(total)}</td></tr>
                {pago > 0 && (<>
                  <tr><td>Pago</td><td className="wf-mono">{fmtBRL(pago)}</td></tr>
                  <tr><td>Saldo {saldo > 0 ? "em aberto" : ""}</td><td className="wf-mono">{fmtBRL(Math.max(saldo, 0))}</td></tr>
                </>)}
              </tfoot>
            </table>

            <p className="wf-recibo__rodape">Obrigado pela confiança. Este comprovante não substitui a nota fiscal.</p>
          </div>
        </div>
        <div className="wf-modal__foot wf-recibo-noimprimir">
          <button className="wf-btn wf-btn--accent" onClick={() => window.print()}><Printer size={16} /> Baixar comprovante (salvar como PDF)</button>
        </div>
      </div>
    </div>
  );
}
