import { useState } from "react";
import { Plus, Phone, Mail, Edit2, Trash2 } from "lucide-react";
import { CampoBusca } from "../../../compartilhado/componentes/CampoBusca.jsx";
import { SeletorFiltro } from "../../../compartilhado/componentes/SeletorFiltro.jsx";
import { SemResultados } from "../../../compartilhado/componentes/SemResultados.jsx";
import { ContagemResultados } from "../../../compartilhado/componentes/ContagemResultados.jsx";
import { correspondeBusca } from "../../../compartilhado/utilitarios/correspondeBusca.jsx";
import { Placa } from "../../../compartilhado/componentes/Placa.jsx";
import { JanelaCliente } from "../componentes/JanelaCliente.jsx";

export function TelaClientes({ clientes, veiculos, agendamentos, setClientes, setVeiculos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtrados = clientes.filter((c) => {
    const placas = veiculos.filter((v) => v.clienteId === c.id).map((v) => `${v.placa} ${v.marca} ${v.modelo}`).join(" ");
    return correspondeBusca(`${c.nome} ${c.email || ""} ${c.telefone || ""} ${(c.telefone || "").replace(/\D/g, "")} ${placas}`, busca);
  });

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

      <div className="wf-toolbar">
        <div className="wf-toolbar__linha"><CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome, telefone, e-mail ou placa..." /></div>
        <ContagemResultados mostrando={filtrados.length} total={clientes.length} />
      </div>

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
                  <td>{vs.length ? vs.map((v) => <Placa key={v.id}>{v.placa}</Placa>) : <span className="wf-muted">Nenhum</span>}</td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(c); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(c.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && <tr><td colSpan={4}><SemResultados mensagem="Nenhum cliente encontrado." aoLimpar={busca.trim() ? () => setBusca("") : undefined} /></td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && <JanelaCliente initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
