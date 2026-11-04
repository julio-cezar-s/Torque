import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Plate } from "../../components/common/Plate.jsx";
import { VeiculoModal } from "../../components/modals/VeiculoModal.jsx";
import { confirmarExclusaoVeiculo } from "../../utils/formato/confirmarExclusaoVeiculo.jsx";

export function VeiculosView({ veiculos, clientes, ordens, agendamentos, setVeiculos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome || "Sem proprietário";
  const filtrados = veiculos.filter((v) => `${v.placa} ${v.marca} ${v.modelo} ${clienteNome(v.clienteId)}`.toLowerCase().includes(busca.toLowerCase()));

  const handleDelete = (id) => { if (confirmarExclusaoVeiculo(id, ordens, agendamentos)) setVeiculos((prev) => prev.filter((v) => v.id !== id)); };
  const handleSave = (v) => {
    if (editing) setVeiculos((prev) => prev.map((x) => (x.id === v.id ? v : x)));
    else setVeiculos((prev) => [...prev, v]);
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Cadastro</p><h1>Veículos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Veículo</button>
      </div>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar por placa, modelo ou dono..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Placa</th><th>Veículo</th><th>Ano</th><th>Cor</th><th>Proprietário</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((v) => (
              <tr key={v.id}>
                <td><Plate>{v.placa}</Plate></td>
                <td className="wf-table__strong">{v.marca} {v.modelo}</td>
                <td className="wf-mono">{v.ano}</td>
                <td>{v.cor}</td>
                <td>{clienteNome(v.clienteId)}</td>
                <td>
                  <button className="wf-iconbtn" onClick={() => { setEditing(v); setModalOpen(true); }}><Edit2 size={15} /></button>
                  <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(v.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={6} className="wf-empty-note">Nenhum veículo encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && <VeiculoModal clientes={clientes} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
