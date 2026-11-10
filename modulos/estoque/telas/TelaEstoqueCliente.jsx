import { useState } from "react";
import { Package } from "lucide-react";
import { CampoBusca } from "../../../compartilhado/componentes/CampoBusca.jsx";
import { SeletorFiltro } from "../../../compartilhado/componentes/SeletorFiltro.jsx";
import { SemResultados } from "../../../compartilhado/componentes/SemResultados.jsx";
import { ContagemResultados } from "../../../compartilhado/componentes/ContagemResultados.jsx";
import { correspondeBusca } from "../../../compartilhado/utilitarios/correspondeBusca.jsx";
import { Selo } from "../../../compartilhado/componentes/Selo.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";

export function TelaEstoqueCliente({ estoque }) {
  const [busca, setBusca] = useState("");
  const publicaveis = estoque.filter((p) => p.imagem && p.preco > 0);
  const filtrados = publicaveis.filter((p) => correspondeBusca(`${p.nome} ${p.codigo}`, busca));

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Consulta</p><h1>Estoque de Peças</h1></div>
      </div>
      <p className="wf-page-lead" style={{ marginTop: -6 }}>
        Consulte o código e o valor das peças disponíveis na oficina. Para orçar a instalação, solicite um agendamento.
      </p>

      <div className="wf-toolbar"><div className="wf-toolbar__linha"><CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome ou código..." /></div></div>

      {filtrados.length === 0 ? (
        <SemResultados mensagem="Nenhuma peça encontrada." aoLimpar={busca.trim() ? () => setBusca("") : undefined} />
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
                    <span className="wf-mono">{formatarReais(p.preco)}</span>
                    <Selo accent={disponivel}>{disponivel ? "Disponível" : "Sob consulta"}</Selo>
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
