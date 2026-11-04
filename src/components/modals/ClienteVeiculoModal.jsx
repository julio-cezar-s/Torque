import { useState } from "react";
import { Modal } from "../common/Modal.jsx";
import { VeiculoCampos } from "../common/VeiculoCampos.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function ClienteVeiculoModal({ initial, onClose, onSave }) {
  const [placa, setPlaca] = useState(initial?.placa || "");
  const [marca, setMarca] = useState(initial?.marca || "");
  const [modelo, setModelo] = useState(initial?.modelo || "");
  const [ano, setAno] = useState(initial?.ano || "");
  const [cor, setCor] = useState(initial?.cor || "");
  const pode = placa.trim();
  return (
    <Modal title={initial ? "Editar Veículo" : "Novo Veículo"} onClose={onClose} width="440px">
      <VeiculoCampos placa={placa} setPlaca={setPlaca} marca={marca} setMarca={setMarca} modelo={modelo} setModelo={setModelo} ano={ano} setAno={setAno} cor={cor} setCor={setCor} />
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: initial?.id || uid("v"), placa, marca, modelo, ano, cor })}>{initial ? "Salvar alterações" : "Salvar veículo"}</button>
      </div>
    </Modal>
  );
}
