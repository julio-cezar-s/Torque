import { useState } from "react";
import { Field } from "../common/Field.jsx";
import { Modal } from "../common/Modal.jsx";
import { CATEGORIAS_SERVICO } from "../../constants/CATEGORIAS_SERVICO.jsx";
import { sanitizeDecimal } from "../../utils/formato/sanitizeDecimal.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function ServicoModal({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [categoria, setCategoria] = useState(initial?.categoria || CATEGORIAS_SERVICO[0]);
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [preco, setPreco] = useState(initial?.preco ?? "");
  const [duracao, setDuracao] = useState(initial?.duracao || "");
  const pode = nome.trim();
  return (
    <Modal title={initial ? "Editar Serviço" : "Novo Serviço"} onClose={onClose} width="480px">
      <Field label="Nome do serviço"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Troca de óleo" /></Field>
      <Field label="Categoria">
        <select className="wf-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS_SERVICO.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Descrição"><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que está incluso neste serviço" /></Field>
      <div className="wf-grid2">
        <Field label="Preço estimado (R$)"><input className="wf-mono" value={preco} onChange={(e) => setPreco(sanitizeDecimal(e.target.value))} placeholder="0,00" /></Field>
        <Field label="Duração estimada"><input value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="Ex: 1h30" /></Field>
      </div>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: initial?.id || uid("s"), nome, categoria, descricao, preco: Number(preco) || 0, duracao })}>
          {initial ? "Salvar alterações" : "Salvar serviço"}
        </button>
      </div>
    </Modal>
  );
}
