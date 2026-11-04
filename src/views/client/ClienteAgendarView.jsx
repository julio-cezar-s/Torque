import { AgStamp } from "../../components/common/AgStamp.jsx";
import { Plate } from "../../components/common/Plate.jsx";
import { AgendamentoFields } from "../../components/modals/AgendamentoFields.jsx";
import { fmtData } from "../../utils/formato/fmtData.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function ClienteAgendarView({ clienteId, veiculos, servicos, agendamentos, setAgendamentos, onGoVeiculos }) {
  const handleSubmit = (payload) => {
    setAgendamentos((prev) => [{ id: uid("ag"), clienteId, veiculoId: payload.veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: "pendente" }, ...prev]);
  };
  const cancelar = (id) => setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelado" } : a)));
  const veiculoPlaca = (id) => veiculos.find((v) => v.id === id)?.placa || "—";
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Solicitação</p><h1>Agendar Serviço</h1></div></div>
      <div className="wf-panel" style={{ maxWidth: 560, marginBottom: 28 }}>
        {veiculos.length === 0 ? (
          <div>
            <p className="wf-empty-note">Cadastre um veículo antes de solicitar um agendamento.</p>
            <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={onGoVeiculos}>Cadastrar veículo</button>
          </div>
        ) : (
          <AgendamentoFields veiculos={veiculos} servicos={servicos} fixedClienteId={clienteId} allowNovoVeiculo={false} submitLabel="Solicitar agendamento" onSubmit={handleSubmit} />
        )}
      </div>
      <h2 className="wf-subhead">Meus agendamentos</h2>
      {agendamentos.length === 0 ? <p className="wf-empty-note">Nenhum agendamento solicitado ainda.</p> : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Veículo</th><th>Serviço</th><th>Data</th><th>Horário</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {[...agendamentos].sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1)).map((a) => (
                <tr key={a.id}>
                  <td><Plate>{veiculoPlaca(a.veiculoId)}</Plate></td>
                  <td>{servicoNome(a.servicoId)}</td>
                  <td className="wf-mono">{fmtData(a.data)}</td>
                  <td className="wf-mono">{a.hora}</td>
                  <td><AgStamp status={a.status} size="sm" /></td>
                  <td>{(a.status === "pendente" || a.status === "confirmado") && <button className="wf-link" onClick={() => cancelar(a.id)}>Cancelar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
