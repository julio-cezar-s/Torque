import { useState } from "react";
import { Search, Package } from "lucide-react";
import { Badge } from "../../components/common/Badge.jsx";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";

export function ClienteEstoqueView({ estoque }) {
  const [busca, setBusca] = useState("");
  const publicaveis = estoque.filter((p) => p.imagem && p.preco > 0);
  const filtrados = publicaveis.filter((p) => `${p.nome} ${p.codigo}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Consulta</p><h1>Estoque de Peças</h1></div>
      </div>
      <p className="wf-page-lead" style={{ marginTop: -6 }}>
        Consulte o código e o valor das peças disponíveis na oficina. Para orçar a instalação, solicite um agendamento.
      </p>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar por nome ou código..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      {filtrados.length === 0 ? (
        <p className="wf-empty-note">Nenhuma peça encontrada.</p>
      ) : (
        <div className="wf-peca-grid">
          {filtrados.map((p) => {
            const disponivel = p.quantidade > 0;
            return (
              <div key={p.id} className="wf-peca-card">
                <div className="wf-peca-card__img">
                  {p.imagem ? <img src={p.imagem} alt={p.nome} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.classList.add("wf-peca-card__img--empty"); }} /> : <Package size={28} />}
                </div>
                <div className="wf-peca-card__body">
                  <span className="wf-mono wf-peca-card__codigo">{p.codigo}</span>
                  <h3>{p.nome}</h3>
                  <div className="wf-peca-card__foot">
                    <span className="wf-mono">{fmtBRL(p.preco)}</span>
                    <Badge accent={disponivel}>{disponivel ? "Disponível" : "Sob consulta"}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
