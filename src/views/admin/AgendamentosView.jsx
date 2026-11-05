import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Plate } from "../../components/common/Plate.jsx";
import { AgendamentoModal } from "../../components/modals/AgendamentoModal.jsx";
import { AGENDAMENTO_STATUS } from "../../constants/AGENDAMENTO_STATUS.jsx";
import { AGENDAMENTO_STATUS_ORDER } from "../../constants/AGENDAMENTO_STATUS_ORDER.jsx";
import { fmtData } from "../../utils/formato/fmtData.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function AgendamentosView({ agendamentos, clientes, veiculos, servicos, setAgendamentos, setVeiculos }) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome || "—";
  const veiculoPlaca = (id) => veiculos.find((v) => v.id === id)?.placa || "—";
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  const filtrados = agendamentos.filter((a) => {
    if (filtro !== "todos" && a.status !== filtro) return false;
    if (!busca.trim()) return true;
    const alvo = `${clienteNome(a.clienteId)} ${veiculoPlaca(a.veiculoId)} ${servicoNome(a.servicoId)}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  }).sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1));

  const handleStatusChange = (id, status) => setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  const handleDelete = (id) => { if (confirm("Excluir este agendamento?")) setAgendamentos((prev) => prev.filter((a) => a.id !== id)); };

  const handleSave = (payload, initial) => {
    let veiculoId = payload.veiculoId;
    if (payload.veiculoMode === "new") {
      const novo = { id: uid("v"), clienteId: payload.clienteId, ...payload.novoVeiculo };
      setVeiculos((prev) => [...prev, novo]);
      veiculoId = novo.id;
    }
    if (initial) {
      setAgendamentos((prev) => prev.map((a) => (a.id === initial.id ? { ...a, clienteId: payload.clienteId, veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: payload.status } : a)));
    } else {
      setAgendamentos((prev) => [{ id: uid("ag"), clienteId: payload.clienteId, veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: "pendente" }, ...prev]);
    }
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Agenda</p><h1>Agendamentos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Agendamento</button>
      </div>
      <div className="wf-toolbar">
        <div className="wf-search"><Search size={16} /><input placeholder="Buscar por cliente, placa ou serviço..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <div className="wf-pills">
          <button className={`wf-pill ${filtro === "todos" ? "active" : ""}`} onClick={() => setFiltro("todos")}>Todos ({agendamentos.length})</button>
          {AGENDAMENTO_STATUS_ORDER.map((s) => (
            <button key={s} className={`wf-pill ${filtro === s ? "active" : ""}`} style={{ "--pill-color": AGENDAMENTO_STATUS[s].color }} onClick={() => setFiltro(s)}>
              {AGENDAMENTO_STATUS[s].label} ({agendamentos.filter((a) => a.status === s).length})
            </button>
          ))}
        </div>
      </div>
      {filtrados.length === 0 ? <p className="wf-empty-note">Nenhum agendamento encontrado.</p> : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Data</th><th>Horário</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id}>
                  <td className="wf-table__strong">{clienteNome(a.clienteId)}</td>
                  <td><Plate>{veiculoPlaca(a.veiculoId)}</Plate></td>
                  <td>{servicoNome(a.servicoId)}</td>
                  <td className="wf-mono">{fmtData(a.data)}</td>
                  <td className="wf-mono">{a.hora}</td>
                  <td>
                    <select className="wf-select" style={{ fontSize: 12, padding: "6px 8px" }} value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}>
                      {AGENDAMENTO_STATUS_ORDER.map((s) => <option key={s} value={s}>{AGENDAMENTO_STATUS[s].label}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(a); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(a.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && <AgendamentoModal clientes={clientes} veiculos={veiculos} servicos={servicos} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
