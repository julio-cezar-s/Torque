import { Placa } from "../../../compartilhado/componentes/Placa.jsx";

// Mostra o veículo com os detalhes: placa em destaque e "Marca Modelo · ano · cor".
export function VeiculoDetalhe({ veiculo }) {
  if (!veiculo) return <span className="wf-muted">Veículo removido</span>;
  const detalhes = [veiculo.ano, veiculo.cor].filter(Boolean).join(" · ");
  return (
    <div className="wf-veiculo-detalhe">
      <Placa>{veiculo.placa || "—"}</Placa>
      <div style={{ fontSize: 13, marginTop: 4 }}>
        <strong>{[veiculo.marca, veiculo.modelo].filter(Boolean).join(" ") || "Sem modelo informado"}</strong>
        {detalhes && <div className="wf-muted" style={{ fontSize: 12 }}>{detalhes}</div>}
      </div>
    </div>
  );
}
