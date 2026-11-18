// Lista suspensa com rótulo, usada nos filtros das telas (mecânico, período, marca...).
export function SeletorFiltro({ rotulo, valor, aoMudar, opcoes }) {
  return (
    <label className="wf-filtro">
      <span>{rotulo}</span>
      <select className="wf-select" value={valor} onChange={(e) => aoMudar(e.target.value)}>
        {opcoes.map((o) => <option key={o.valor} value={o.valor}>{o.rotulo}</option>)}
      </select>
    </label>
  );
}
