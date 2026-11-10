import { useState } from "react";
import { BarChart3, Table2 } from "lucide-react";

// Moldura de cada relatório: título, alternância Gráfico/Tabela e aviso quando não há dados.
export function CartaoRelatorio({ titulo, subtitulo, linhas, formatar, vazio = "Sem dados neste período.", children }) {
  const [verTabela, setVerTabela] = useState(false);
  const temDados = linhas.some((l) => l.valor > 0);
  return (
    <section className="wf-panel wf-relatorio">
      <div className="wf-panel__head">
        <div><h2>{titulo}</h2>{subtitulo && <p className="wf-relatorio__sub">{subtitulo}</p>}</div>
        {temDados && (
          <button className="wf-link" onClick={() => setVerTabela(!verTabela)} aria-pressed={verTabela}>
            {verTabela ? <><BarChart3 size={14} /> Ver gráfico</> : <><Table2 size={14} /> Ver tabela</>}
          </button>
        )}
      </div>
      {!temDados ? <p className="wf-empty">{vazio}</p> : verTabela ? (
        <table className="wf-table wf-relatorio__tabela">
          <thead><tr><th>Item</th><th style={{ textAlign: "right" }}>Valor</th></tr></thead>
          <tbody>{linhas.map((l) => <tr key={l.chave || l.rotulo}><td>{l.rotulo}</td><td style={{ textAlign: "right" }} className="wf-mono">{formatar(l.valor)}</td></tr>)}</tbody>
        </table>
      ) : children}
    </section>
  );
}
