import { useState } from "react";
import { Field } from "../common/Field.jsx";
import { Modal } from "../common/Modal.jsx";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";
import { sanitizeDecimal } from "../../utils/formato/sanitizeDecimal.jsx";
import { uid } from "../../utils/formato/uid.jsx";
import { totalOS } from "../../utils/ordens/totalOS.jsx";
import { totalPago } from "../../utils/ordens/totalPago.jsx";
import { FORMAS_PAGAMENTO } from "../../constants/FORMAS_PAGAMENTO.jsx";

export function PagamentoModal({ ordens, clientes, veiculos, pagamentos, onClose, onSave }) {
  const [ordemId, setOrdemId] = useState(ordens[0]?.id || "");
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState(FORMAS_PAGAMENTO[0]);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [obs, setObs] = useState("");

  const ordemSel = ordens.find((o) => o.id === ordemId);
  const saldo = ordemSel ? totalOS(ordemSel) - totalPago(ordemSel.id, pagamentos) : 0;
  const pode = ordemId && Number(valor) > 0;

  return (
    <Modal title="Registrar Pagamento" onClose={onClose} width="440px">
      <Field label="Ordem de serviço">
        <select className="wf-select" value={ordemId} onChange={(e) => setOrdemId(e.target.value)}>
          {ordens.length === 0 && <option value="">Nenhuma OS cadastrada</option>}
          {ordens.map((o) => {
            const c = clientes.find((c) => c.id === o.clienteId);
            const v = veiculos.find((v) => v.id === o.veiculoId);
            return <option key={o.id} value={o.id}>{o.numero} · {c?.nome || "—"} · {v?.placa || "—"}</option>;
          })}
        </select>
      </Field>
      {ordemSel && <p className="wf-muted" style={{ fontSize: 12.5, marginTop: -8 }}>Total da OS: {fmtBRL(totalOS(ordemSel))} · Saldo em aberto: {fmtBRL(Math.max(0, saldo))}</p>}
      <div className="wf-grid2">
        <Field label="Valor pago (R$)"><input className="wf-mono" inputMode="decimal" value={valor} onChange={(e) => setValor(sanitizeDecimal(e.target.value))} placeholder="0,00" /></Field>
        <Field label="Forma de pagamento">
          <select className="wf-select" value={forma} onChange={(e) => setForma(e.target.value)}>
            {FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Data"><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Field>
      <Field label="Observações (opcional)"><input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: entrada, pagamento final..." /></Field>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: uid("pg"), ordemId, valor: Number(valor) || 0, forma, data, obs })}>Registrar pagamento</button>
      </div>
    </Modal>
  );
}
