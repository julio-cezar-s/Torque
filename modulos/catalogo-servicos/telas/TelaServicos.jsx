import { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { CampoBusca } from "../../../compartilhado/componentes/CampoBusca.jsx";
import { SeletorFiltro } from "../../../compartilhado/componentes/SeletorFiltro.jsx";
import { SemResultados } from "../../../compartilhado/componentes/SemResultados.jsx";
import { ContagemResultados } from "../../../compartilhado/componentes/ContagemResultados.jsx";
import { correspondeBusca } from "../../../compartilhado/utilitarios/correspondeBusca.jsx";
import { Selo } from "../../../compartilhado/componentes/Selo.jsx";
import { JanelaServico } from "../componentes/JanelaServico.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";

export function TelaServicos({ servicos, setServicos }) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const categorias = [...new Set(servicos.map((s) => s.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  const filtrados = servicos
    .filter((s) => categoria === "todas" || s.categoria === categoria)
    .filter((s) => correspondeBusca(`${s.nome} ${s.categoria} ${s.descricao || ""}`, busca));
  const filtrosAtivos = categoria !== "todas" || busca.trim() !== "";
  const limparFiltros = () => { setCategoria("todas"); setBusca(""); };
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
      <div className="wf-toolbar">
        <div className="wf-toolbar__linha"><CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nome, categoria ou descrição..." /></div>
        {categorias.length > 1 && (
          <div className="wf-pills">
            <button className={`wf-pill ${categoria === "todas" ? "active" : ""}`} onClick={() => setCategoria("todas")}>Todas ({servicos.length})</button>
            {categorias.map((c) => (
              <button key={c} className={`wf-pill ${categoria === c ? "active" : ""}`} onClick={() => setCategoria(c)}>{c} ({servicos.filter((s) => s.categoria === c).length})</button>
            ))}
          </div>
        )}
        <ContagemResultados mostrando={filtrados.length} total={servicos.length} />
      </div>
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Serviço</th><th>Categoria</th><th>Preço</th><th>Duração</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((s) => (
              <tr key={s.id}>
                <td className="wf-table__strong">{s.nome}</td>
                <td><Selo>{s.categoria}</Selo></td>
                <td className="wf-mono">{formatarReais(s.preco)}</td>
                <td className="wf-muted">{s.duracao || "—"}</td>
                <td>
                  <button className="wf-iconbtn" onClick={() => { setEditing(s); setModalOpen(true); }}><Edit2 size={15} /></button>
                  <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(s.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={5}><SemResultados mensagem={servicos.length ? "Nenhum serviço encontrado." : "Nenhum serviço cadastrado."} aoLimpar={servicos.length && filtrosAtivos ? limparFiltros : undefined} /></td></tr>}
          </tbody>
        </table>
      </div>
      {modalOpen && <JanelaServico initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
