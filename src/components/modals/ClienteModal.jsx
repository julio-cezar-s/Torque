import { useState } from "react";
import { Field } from "../common/Field.jsx";
import { Modal } from "../common/Modal.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function ClienteModal({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [telefone, setTelefone] = useState(initial?.telefone || "");
  const [email, setEmail] = useState(initial?.email || "");
  return (
    <Modal title={initial ? "Editar Cliente" : "Novo Cliente"} onClose={onClose} width="420px">
      <Field label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" autoFocus /></Field>
      <div className="wf-grid2">
        <Field label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 90000-0000" /></Field>
        <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" /></Field>
      </div>
      <p className="wf-muted" style={{ fontSize: 13 }}>Para acessar o portal, o cliente cria a própria senha em “Cadastre-se” usando este mesmo e-mail — o cadastro dele é vinculado automaticamente.</p>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!nome.trim()} onClick={() => onSave({ id: initial?.id || uid("c"), nome: nome.trim(), telefone, email: email.trim() })}>
          {initial ? "Salvar alterações" : "Salvar cliente"}
        </button>
      </div>
    </Modal>
  );
}
