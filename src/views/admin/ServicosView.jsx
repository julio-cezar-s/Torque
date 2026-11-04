import { useState } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Badge } from "../../components/common/Badge.jsx";
import { ServicoModal } from "../../components/modals/ServicoModal.jsx";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";

export function ServicosView({ servicos, setServicos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtrados = servicos.filter((s) => `${s.nome} ${s.categoria}`.toLowerCase().includes(busca.toLowerCase()));
  const handleSave = (s) => {
    if (editing) setServicos((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    else setServicos((prev) => [...prev, s]);
    setModalOpen(false); setEditing(null);
  };
  const handleDelete = (id) => { if (confirm("Excluir este serviço?")) setServicos((prev) => prev.filter((s) => s.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Catálogo</p><h1>Serviços</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Serviço</button>
      </div>
      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar serviço..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Serviço</th><th>Categoria</th><th>Preço</th><th>Duração</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((s) => (
              <tr key={s.id}>
                <td className="wf-table__strong">{s.nome}</td>
                <td><Badge>{s.categoria}</Badge></td>
                <td className="wf-mono">{fmtBRL(s.preco)}</td>
                <td className="wf-muted">{s.duracao || "—"}</td>
                <td>
                  <button className="wf-iconbtn" onClick={() => { setEditing(s); setModalOpen(true); }}><Edit2 size={15} /></button>
                  <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(s.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={5} className="wf-empty-note">Nenhum serviço cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
      {modalOpen && <ServicoModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
