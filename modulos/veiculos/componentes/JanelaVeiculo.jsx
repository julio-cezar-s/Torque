import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { VeiculoCampos } from "./VeiculoCampos.jsx";
import { errosDoVeiculo } from "../../../compartilhado/validacao/errosDoVeiculo.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaVeiculo({ clientes, initial, onClose, onSave }) {
  const [clienteId, setClienteId] = useState(initial?.clienteId || clientes[0]?.id || "");
  const [placa, setPlaca] = useState(initial?.placa || "");
  const [marca, setMarca] = useState(initial?.marca || "");
  const [modelo, setModelo] = useState(initial?.modelo || "");
  const [ano, setAno] = useState(initial?.ano || "");
  const [cor, setCor] = useState(initial?.cor || "");
  const [tentou, setTentou] = useState(false);
  const erros = errosDoVeiculo({ placa, ano });
  const salvar = () => {
    setTentou(true);
    if (!clienteId || erros.placa || erros.ano) return;
    onSave({ id: initial?.id || gerarId("v"), clienteId, placa, marca, modelo, ano, cor });
  };
  return (
    <Janela title={initial ? "Editar Veículo" : "Novo Veículo"} onClose={onClose} width="480px">
      <Campo label="Proprietário">
        <select className="wf-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          {clientes.length === 0 && <option value="">Cadastre um cliente primeiro</option>}
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </Campo>
      <VeiculoCampos placa={placa} setPlaca={setPlaca} marca={marca} setMarca={setMarca} modelo={modelo} setModelo={setModelo} ano={ano} setAno={setAno} cor={cor} setCor={setCor} erros={tentou ? erros : {}} />
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" onClick={salvar}>
          {initial ? "Salvar alterações" : "Salvar veículo"}
        </button>
      </div>
    </Janela>
  );
}
