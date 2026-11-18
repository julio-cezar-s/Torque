import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { CampoBusca } from "../../../compartilhado/componentes/CampoBusca.jsx";
import { SeletorFiltro } from "../../../compartilhado/componentes/SeletorFiltro.jsx";
import { SemResultados } from "../../../compartilhado/componentes/SemResultados.jsx";
import { ContagemResultados } from "../../../compartilhado/componentes/ContagemResultados.jsx";
import { correspondeBusca } from "../../../compartilhado/utilitarios/correspondeBusca.jsx";
import { dentroDoPeriodo } from "../../../compartilhado/utilitarios/dentroDoPeriodo.jsx";
import { PERIODOS_AGENDA } from "../constantes/PERIODOS_AGENDA.jsx";
import { VeiculoDetalhe } from "../../veiculos/componentes/VeiculoDetalhe.jsx";
import { JanelaAgendamento } from "../componentes/JanelaAgendamento.jsx";
import { STATUS_AGENDAMENTO } from "../constantes/STATUS_AGENDAMENTO.jsx";
import { ORDEM_STATUS_AGENDAMENTO } from "../constantes/ORDEM_STATUS_AGENDAMENTO.jsx";
import { formatarData } from "../../../compartilhado/utilitarios/formatarData.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function TelaAgendamentos({ agendamentos, clientes, veiculos, servicos, setAgendamentos, setVeiculos }) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [periodo, setPeriodo] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome || "—";
  const veiculoDe = (id) => veiculos.find((v) => v.id === id);
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  const veiculoTexto = (id) => { const v = veiculoDe(id); return v ? `${v.placa} ${v.marca} ${v.modelo} ${v.ano} ${v.cor}` : ""; };

  const filtrados = agendamentos.filter((a) => {
    if (filtro !== "todos" && a.status !== filtro) return false;
    if (!dentroDoPeriodo(a.data, periodo)) return false;
    return correspondeBusca(`${clienteNome(a.clienteId)} ${veiculoTexto(a.veiculoId)} ${servicoNome(a.servicoId)} ${a.observacoes || ""}`, busca);
  }).sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1));

  const filtrosAtivos = filtro !== "todos" || periodo !== "todos" || busca.trim() !== "";
  const limparFiltros = () => { setFiltro("todos"); setPeriodo("todos"); setBusca(""); };

  const handleStatusChange = (id, status) => setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  const handleDelete = (id) => { if (confirm("Excluir este agendamento?")) setAgendamentos((prev) => prev.filter((a) => a.id !== id)); };

  const handleSave = (payload, initial) => {
    let veiculoId = payload.veiculoId;
    if (payload.veiculoMode === "new") {
      const novo = { id: gerarId("v"), clienteId: payload.clienteId, ...payload.novoVeiculo };
      setVeiculos((prev) => [...prev, novo]);
      veiculoId = novo.id;
    }
    if (initial) {
      setAgendamentos((prev) => prev.map((a) => (a.id === initial.id ? { ...a, clienteId: payload.clienteId, veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: payload.status } : a)));
    } else {
      setAgendamentos((prev) => [{ id: gerarId("ag"), clienteId: payload.clienteId, veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: "pendente" }, ...prev]);
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
        <div className="wf-toolbar__linha">
          <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por cliente, placa, modelo ou serviço..." />
          <SeletorFiltro rotulo="Data" valor={periodo} aoMudar={setPeriodo} opcoes={PERIODOS_AGENDA} />
        </div>
        <div className="wf-pills">
          <button className={`wf-pill ${filtro === "todos" ? "active" : ""}`} onClick={() => setFiltro("todos")}>Todos ({agendamentos.length})</button>
          {ORDEM_STATUS_AGENDAMENTO.map((s) => (
            <button key={s} className={`wf-pill ${filtro === s ? "active" : ""}`} style={{ "--pill-color": STATUS_AGENDAMENTO[s].color }} onClick={() => setFiltro(s)}>
              {STATUS_AGENDAMENTO[s].label} ({agendamentos.filter((a) => a.status === s).length})
            </button>
          ))}
        </div>
        <ContagemResultados mostrando={filtrados.length} total={agendamentos.length} />
      </div>
      {filtrados.length === 0 ? <SemResultados mensagem="Nenhum agendamento encontrado." aoLimpar={filtrosAtivos ? limparFiltros : undefined} /> : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Data</th><th>Horário</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id}>
                  <td className="wf-table__strong">{clienteNome(a.clienteId)}</td>
                  <td><VeiculoDetalhe veiculo={veiculoDe(a.veiculoId)} /></td>
                  <td>{servicoNome(a.servicoId)}</td>
                  <td className="wf-mono">{formatarData(a.data)}</td>
                  <td className="wf-mono">{a.hora}</td>
                  <td>
                    <select className="wf-select" style={{ fontSize: 12, padding: "6px 8px" }} value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}>
                      {ORDEM_STATUS_AGENDAMENTO.map((s) => <option key={s} value={s}>{STATUS_AGENDAMENTO[s].label}</option>)}
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
      {modalOpen && <JanelaAgendamento clientes={clientes} veiculos={veiculos} servicos={servicos} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
