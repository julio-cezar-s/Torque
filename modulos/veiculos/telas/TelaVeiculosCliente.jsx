import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Placa } from "../../../compartilhado/componentes/Placa.jsx";
import { JanelaVeiculoCliente } from "../componentes/JanelaVeiculoCliente.jsx";
import { confirmarExclusaoVeiculo } from "../utilitarios/confirmarExclusaoVeiculo.jsx";

export function TelaVeiculosCliente({ veiculos, clienteId, ordens, agendamentos, setVeiculos }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const handleSave = (v) => {
    if (editing) setVeiculos((prev) => prev.map((x) => (x.id === v.id ? { ...v, clienteId } : x)));
    else setVeiculos((prev) => [...prev, { ...v, clienteId }]);
    setModalOpen(false); setEditing(null);
  };
  const handleDelete = (id) => { if (confirmarExclusaoVeiculo(id, ordens, agendamentos)) setVeiculos((prev) => prev.filter((v) => v.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Meus dados</p><h1>Meus Veículos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Veículo</button>
      </div>
      {veiculos.length === 0 ? <p className="wf-empty-note">Você ainda não cadastrou nenhum veículo.</p> : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Placa</th><th>Veículo</th><th>Ano</th><th>Cor</th><th></th></tr></thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v.id}>
                  <td><Placa>{v.placa}</Placa></td>
                  <td className="wf-table__strong">{v.marca} {v.modelo}</td>
                  <td className="wf-mono">{v.ano}</td>
                  <td>{v.cor}</td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(v); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(v.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && <JanelaVeiculoCliente initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
