import { useState } from "react";
import { Plus } from "lucide-react";
import { Field } from "../common/Field.jsx";
import { Modal } from "../common/Modal.jsx";
import { Plate } from "../common/Plate.jsx";
import { ItemRow } from "./ItemRow.jsx";
import { MECANICOS } from "../../constants/MECANICOS.jsx";
import { STATUS } from "../../constants/STATUS.jsx";
import { STATUS_ORDER } from "../../constants/STATUS_ORDER.jsx";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function EditarOSModal({ ordem, cliente, veiculo, estoque, onClose, onSave }) {
  const [descricao, setDescricao] = useState(ordem.descricao);
  const [mecanico, setMecanico] = useState(ordem.mecanico);
  const [previsao, setPrevisao] = useState(ordem.previsao);
  const [status, setStatus] = useState(ordem.status);
  const [itens, setItens] = useState(ordem.itens.length ? ordem.itens : [{ id: uid("i"), tipo: "avulso", descricao: "", valor: "" }]);

  const addItem = () => setItens((p) => [...p, { id: uid("i"), tipo: "avulso", descricao: "", valor: "" }]);
  const removeItem = (id) => setItens((p) => p.filter((i) => i.id !== id));
  const updateItem = (id, novo) => setItens((p) => p.map((i) => (i.id === id ? novo : i)));
  const itemSubtotal = (i) => (i.tipo === "peca" ? (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0) : (Number(i.valor) || 0));
  const total = itens.reduce((s, i) => s + itemSubtotal(i), 0);

  const salvar = () => onSave({
    ...ordem, descricao, mecanico, previsao, status,
    itens: itens.filter((i) => (i.tipo === "peca" ? !!i.pecaId : i.descricao.trim())).map((i) => ({ ...i, valor: itemSubtotal(i) })),
  });

  return (
    <Modal title={`Editar ${ordem.numero}`} onClose={onClose} width="600px">
      <div className="wf-ticket__cliente" style={{ marginBottom: 4 }}>{cliente?.nome || "Cliente removido"}</div>
      <div className="wf-ticket__veiculo" style={{ marginBottom: 16 }}>
        <Plate>{veiculo?.placa || "—"}</Plate><span>{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : ""}</span>
      </div>
      <Field label="Descrição"><textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Field>
      <div className="wf-grid2">
        <Field label="Mecânico"><select className="wf-select" value={mecanico} onChange={(e) => setMecanico(e.target.value)}>{MECANICOS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
        <Field label="Previsão"><input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} /></Field>
      </div>
      <Field label="Status"><select className="wf-select" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</select></Field>
      <div className="wf-form-section__head"><span>Itens / peças / mão de obra</span></div>
      <div className="wf-itens">
        {itens.map((item) => (
          <ItemRow key={item.id} item={item} estoque={estoque} onChange={(novo) => updateItem(item.id, novo)} onRemove={() => removeItem(item.id)} />
        ))}
      </div>
      <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={addItem}><Plus size={14} /> Adicionar item</button>
      <div className="wf-modal__foot">
        <span className="wf-mono wf-modal__total">Total: {fmtBRL(total)}</span>
        <button className="wf-btn wf-btn--accent" onClick={salvar}>Salvar alterações</button>
      </div>
    </Modal>
  );
}
