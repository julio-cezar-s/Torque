import { Badge } from "./common/Badge.jsx";
import { fmtBRL } from "../utils/formato/fmtBRL.jsx";

export function ServicosGrid({ servicos, limit, onSelect }) {
  const list = limit ? servicos.slice(0, limit) : servicos;
  if (list.length === 0) return <p className="wf-empty-note">Nenhum serviço cadastrado no momento.</p>;
  return (
    <div className="wf-servicos-grid">
      {list.map((s) => (
        <div
          className={`wf-servico-card ${onSelect ? "wf-servico-card--clickable" : ""}`}
          key={s.id}
          onClick={onSelect ? () => onSelect(s.id) : undefined}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onKeyDown={onSelect ? (e) => { if (e.key === "Enter") onSelect(s.id); } : undefined}
        >
          <Badge>{s.categoria}</Badge>
          <h3>{s.nome}</h3>
          <p>{s.descricao || "Consulte a equipe para mais detalhes sobre este serviço."}</p>
          <div className="wf-servico-card__foot">
            <span className="wf-mono">{s.preco ? `a partir de ${fmtBRL(s.preco)}` : "Sob consulta"}</span>
            {s.duracao && <span className="wf-muted">{s.duracao}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
