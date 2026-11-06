import { useState } from "react";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { VeiculoCampos } from "./VeiculoCampos.jsx";
import { errosDoVeiculo } from "../../../compartilhado/validacao/errosDoVeiculo.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaVeiculoCliente({ initial, onClose, onSave }) {
  const [placa, setPlaca] = useState(initial?.placa || "");
  const [marca, setMarca] = useState(initial?.marca || "");
  const [modelo, setModelo] = useState(initial?.modelo || "");
  const [ano, setAno] = useState(initial?.ano || "");
  const [cor, setCor] = useState(initial?.cor || "");
  const [tentou, setTentou] = useState(false);
  const erros = errosDoVeiculo({ placa, ano });
  const salvar = () => {
    setTentou(true);
    if (erros.placa || erros.ano) return;
    onSave({ id: initial?.id || gerarId("v"), placa, marca, modelo, ano, cor });
  };
  return (
    <Janela title={initial ? "Editar Veículo" : "Novo Veículo"} onClose={onClose} width="440px">
      <VeiculoCampos placa={placa} setPlaca={setPlaca} marca={marca} setMarca={setMarca} modelo={modelo} setModelo={setModelo} ano={ano} setAno={setAno} cor={cor} setCor={setCor} erros={tentou ? erros : {}} />
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" onClick={salvar}>{initial ? "Salvar alterações" : "Salvar veículo"}</button>
      </div>
    </Janela>
  );
}
