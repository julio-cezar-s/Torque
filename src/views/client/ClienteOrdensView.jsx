import { useState } from "react";
import { AvaliarModal } from "../../components/os/AvaliarModal.jsx";
import { OSTicket } from "../../components/os/OSTicket.jsx";
import { ReciboOS } from "../../components/os/ReciboOS.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function ClienteOrdensView({ ordens, veiculos, cliente, pagamentos, avaliacoes, setAvaliacoes }) {
  const [reciboOrdem, setReciboOrdem] = useState(null);
  const [avaliarOrdem, setAvaliarOrdem] = useState(null);

  const avaliacaoDe = (ordemId) => avaliacoes.find((a) => a.ordemId === ordemId);
  const salvarAvaliacao = ({ nota, comentario }) => {
    setAvaliacoes((prev) => [...prev, { id: uid("av"), ordemId: avaliarOrdem.id, clienteId: cliente?.id || null, nota, comentario, data: new Date().toISOString().slice(0, 10) }]);
    setAvaliarOrdem(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Histórico</p><h1>Minhas Ordens de Serviço</h1></div></div>
      {ordens.length === 0 ? <p className="wf-empty-note">Nenhuma ordem de serviço registrada para você ainda.</p> : (
        <div className="wf-ticket-grid">
          {ordens.map((o) => (
            <OSTicket
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
      {avaliarOrdem && <AvaliarModal ordem={avaliarOrdem} onClose={() => setAvaliarOrdem(null)} onSave={salvarAvaliacao} />}
    </div>
  );
}
