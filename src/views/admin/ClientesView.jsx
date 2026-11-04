import { useState } from "react";
import { Plus, Search, Phone, Mail, Edit2, Trash2 } from "lucide-react";
import { Plate } from "../../components/common/Plate.jsx";
import { ClienteModal } from "../../components/modals/ClienteModal.jsx";

export function ClientesView({ clientes, veiculos, agendamentos, setClientes, setVeiculos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtrados = clientes.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()));

  const handleDelete = (id) => {
    const agVinculados = agendamentos.filter((a) => a.clienteId === id).length;
    const msg = agVinculados
      ? `Excluir cliente e seus veículos vinculados? Há ${agVinculados} agendamento(s) associado(s) que serão mantidos no histórico, assim como as ordens de serviço relacionadas.`
      : "Excluir cliente e seus veículos vinculados? As ordens de serviço relacionadas serão mantidas no histórico.";
    if (!confirm(msg)) return;
    setClientes((prev) => prev.filter((c) => c.id !== id));
    setVeiculos((prev) => prev.filter((v) => v.clienteId !== id));
  };
  const handleSave = (c) => {
    if (editing) setClientes((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    else setClientes((prev) => [...prev, c]);
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Cadastro</p><h1>Clientes</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Cliente</button>
      </div>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Nome</th><th>Contato</th><th>Veículos</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((c) => {
              const vs = veiculos.filter((v) => v.clienteId === c.id);
              return (
                <tr key={c.id}>
                  <td className="wf-table__strong">{c.nome}</td>
                  <td>
                    <div className="wf-contact"><Phone size={13} /> {c.telefone || "—"}</div>
                    {c.email && <div className="wf-contact"><Mail size={13} /> {c.email}</div>}
                  </td>
                  <td>{vs.length ? vs.map((v) => <Plate key={v.id}>{v.placa}</Plate>) : <span className="wf-muted">Nenhum</span>}</td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(c); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(c.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && <tr><td colSpan={4} className="wf-empty-note">Nenhum cliente encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && <ClienteModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
