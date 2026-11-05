import { Campo } from "../../../compartilhado/componentes/Campo.jsx";

export function VeiculoCampos({ placa, setPlaca, marca, setMarca, modelo, setModelo, ano, setAno, cor, setCor }) {
  return (
    <div className="wf-grid3">
      <Campo label="Placa"><input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC1D23" /></Campo>
      <Campo label="Marca"><input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Fiat" /></Campo>
      <Campo label="Modelo"><input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Argo" /></Campo>
      <Campo label="Ano"><input value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2021" /></Campo>
      <Campo label="Cor"><input value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Branco" /></Campo>
    </div>
  );
}
