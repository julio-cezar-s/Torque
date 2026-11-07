// Aviso de lista vazia. Quando há filtros ativos, oferece o botão "Limpar filtros".
export function SemResultados({ mensagem, aoLimpar }) {
  return (
    <div className="wf-sem-resultados">
      <p className="wf-empty-note">{mensagem}</p>
      {aoLimpar && <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={aoLimpar}>Limpar filtros</button>}
    </div>
  );
}
