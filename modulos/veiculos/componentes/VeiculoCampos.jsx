import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { formatarPlaca } from "../../../compartilhado/validacao/formatarPlaca.jsx";

// erros (opcional): { placa, ano } com as mensagens de validação a mostrar.
export function VeiculoCampos({ placa, setPlaca, marca, setMarca, modelo, setModelo, ano, setAno, cor, setCor, erros = {} }) {
  return (
    <div className="wf-grid3">
      <Campo label="Placa" erro={erros.placa}><input value={placa} onChange={(e) => setPlaca(formatarPlaca(e.target.value))} placeholder="ABC1D23" maxLength={7} /></Campo>
      <Campo label="Marca"><input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Fiat" /></Campo>
      <Campo label="Modelo"><input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Argo" /></Campo>
      <Campo label="Ano" erro={erros.ano}><input inputMode="numeric" value={ano} onChange={(e) => setAno(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2021" maxLength={4} /></Campo>
      <Campo label="Cor"><input value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Branco" /></Campo>
    </div>
  );
}
