import { Field } from "./Field.jsx";

export function VeiculoCampos({ placa, setPlaca, marca, setMarca, modelo, setModelo, ano, setAno, cor, setCor }) {
  return (
    <div className="wf-grid3">
      <Field label="Placa"><input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC1D23" /></Field>
      <Field label="Marca"><input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Fiat" /></Field>
      <Field label="Modelo"><input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Argo" /></Field>
      <Field label="Ano"><input value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2021" /></Field>
      <Field label="Cor"><input value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Branco" /></Field>
    </div>
  );
}
