// Barras horizontais (ranking). O valor aparece na ponta de cada barra.
export function GraficoBarras({ dados, formatar = (v) => String(v) }) {
  const maximo = Math.max(...dados.map((d) => d.valor), 1);
  return (
    <ul className="wf-barras" aria-label="Gráfico de barras">
      {dados.map((d) => (
        <li key={d.rotulo} className="wf-barras__linha" tabIndex={0}>
          <span className="wf-barras__rotulo" title={d.rotulo}>{d.rotulo}</span>
          <span className="wf-barras__trilho"><span className="wf-barras__barra" style={{ width: `${(d.valor / maximo) * 100}%` }} /></span>
          <span className="wf-barras__valor wf-mono">{formatar(d.valor)}</span>
        </li>
      ))}
    </ul>
  );
}
