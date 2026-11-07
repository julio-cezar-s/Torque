import { useState } from "react";
import { JanelaAvaliar } from "../componentes/JanelaAvaliar.jsx";
import { FichaOS } from "../componentes/FichaOS.jsx";
import { ReciboOS } from "../componentes/ReciboOS.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function TelaOrdensCliente({ ordens, veiculos, cliente, pagamentos, avaliacoes, setAvaliacoes }) {
  const [reciboOrdem, setReciboOrdem] = useState(null);
  const [avaliarOrdem, setAvaliarOrdem] = useState(null);

  const avaliacaoDe = (ordemId) => avaliacoes.find((a) => a.ordemId === ordemId);
  const salvarAvaliacao = ({ nota, comentario }) => {
    setAvaliacoes((prev) => [...prev, { id: gerarId("av"), ordemId: avaliarOrdem.id, clienteId: cliente?.id || null, nota, comentario, data: new Date().toISOString().slice(0, 10) }]);
    setAvaliarOrdem(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Histórico</p><h1>Minhas Ordens de Serviço</h1></div></div>
      {ordens.length === 0 ? <p className="wf-empty-note">Nenhuma ordem de serviço registrada para você ainda.</p> : (
        <div className="wf-ticket-grid">
          {ordens.map((o) => (
            <FichaOS
              key={o.id} ordem={o} veiculo={veiculos.find((v) => v.id === o.veiculoId)}
              onRecibo={setReciboOrdem}
              avaliacao={avaliacaoDe(o.id)}
              onAvaliar={(o.status === "concluido" || o.status === "entregue") ? setAvaliarOrdem : undefined}
              readOnly hideCliente
            />
          ))}
        </div>
      )}
      {reciboOrdem && (
        <ReciboOS
          ordem={reciboOrdem}
          cliente={cliente}
          veiculo={veiculos.find((v) => v.id === reciboOrdem.veiculoId)}
          pagamentos={pagamentos}
          onClose={() => setReciboOrdem(null)}
        />
      )}
      {avaliarOrdem && <JanelaAvaliar ordem={avaliarOrdem} onClose={() => setAvaliarOrdem(null)} onSave={salvarAvaliacao} />}
    </div>
  );
}
