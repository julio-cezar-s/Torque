import { useState } from "react";
import { Field } from "../common/Field.jsx";
import { Modal } from "../common/Modal.jsx";
import { VeiculoCampos } from "../common/VeiculoCampos.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function VeiculoModal({ clientes, initial, onClose, onSave }) {
  const [clienteId, setClienteId] = useState(initial?.clienteId || clientes[0]?.id || "");
  const [placa, setPlaca] = useState(initial?.placa || "");
  const [marca, setMarca] = useState(initial?.marca || "");
  const [modelo, setModelo] = useState(initial?.modelo || "");
  const [ano, setAno] = useState(initial?.ano || "");
  const [cor, setCor] = useState(initial?.cor || "");
  const pode = clienteId && placa.trim();
  return (
    <Modal title={initial ? "Editar Veículo" : "Novo Veículo"} onClose={onClose} width="480px">
      <Field label="Proprietário">
        <select className="wf-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          {clientes.length === 0 && <option value="">Cadastre um cliente primeiro</option>}
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </Field>
      <VeiculoCampos placa={placa} setPlaca={setPlaca} marca={marca} setMarca={setMarca} modelo={modelo} setModelo={setModelo} ano={ano} setAno={setAno} cor={cor} setCor={setCor} />
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: initial?.id || uid("v"), clienteId, placa, marca, modelo, ano, cor })}>
          {initial ? "Salvar alterações" : "Salvar veículo"}
        </button>
      </div>
    </Modal>
  );
}
