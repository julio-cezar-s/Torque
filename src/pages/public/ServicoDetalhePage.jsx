import { ArrowLeft, ArrowRight } from "lucide-react";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";

export function ServicoDetalhePage({ servico, onVoltar, setPage }) {
  if (!servico) {
    return (
      <div className="wf-section">
        <button className="wf-link" onClick={onVoltar}><ArrowLeft size={14} /> Voltar aos serviços</button>
        <p className="wf-empty-note">Este serviço não está mais disponível.</p>
      </div>
    );
  }
  return (
    <div className="wf-section" style={{ maxWidth: 720 }}>
      <button className="wf-link" onClick={onVoltar}><ArrowLeft size={14} /> Voltar aos serviços</button>
      <p className="wf-eyebrow" style={{ marginTop: 20 }}>{servico.categoria}</p>
      <h1 className="wf-page-title">{servico.nome}</h1>
      <p className="wf-page-lead">{servico.descricao || "Consulte a equipe para mais detalhes sobre este serviço."}</p>
      <div className="wf-panel" style={{ maxWidth: 420, marginBottom: 24 }}>
        <div className="wf-detalhe-row"><span>Preço estimado</span><strong className="wf-mono">{servico.preco ? fmtBRL(servico.preco) : "Sob consulta"}</strong></div>
        <div className="wf-detalhe-row"><span>Duração estimada</span><strong>{servico.duracao || "A combinar"}</strong></div>
      </div>
      <button className="wf-btn wf-btn--accent" onClick={() => setPage("cadastro")}>Agendar este serviço <ArrowRight size={16} /></button>
    </div>
  );
}
