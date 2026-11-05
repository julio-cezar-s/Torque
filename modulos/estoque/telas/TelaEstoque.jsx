import { useState } from "react";
import { Plus, Search, Package, AlertTriangle, Edit2, Trash2 } from "lucide-react";
import { JanelaPeca } from "../componentes/JanelaPeca.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";

export function TelaEstoque({ estoque, ordens, setEstoque }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtrados = estoque.filter((p) => `${p.nome} ${p.codigo}`.toLowerCase().includes(busca.toLowerCase()));
  const handleDelete = (id) => {
    const osVinculadas = ordens.filter((o) => o.itens.some((i) => i.tipo === "peca" && i.pecaId === id)).length;
    const msg = osVinculadas
      ? `Esta peça está usada em ${osVinculadas} ordem(ns) de serviço já registrada(s). Elas manterão o valor e a descrição do item, mas perderão o vínculo com esta peça do estoque. Deseja excluir mesmo assim?`
      : "Remover esta peça do estoque?";
    if (confirm(msg)) setEstoque((prev) => prev.filter((p) => p.id !== id));
  };
  const ajustar = (id, delta) => setEstoque((prev) => prev.map((p) => (p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade + delta) } : p)));
  const handleSave = (p) => {
    if (editing) setEstoque((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    else setEstoque((prev) => [...prev, p]);
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Estoque</p><h1>Peças e Insumos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Nova Peça</button>
      </div>

      <p className="wf-muted" style={{ marginTop: -12, marginBottom: 20, fontSize: 13 }}>
        Peças com foto e preço cadastrados aparecem automaticamente na aba "Estoque" da área do cliente.
      </p>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar por nome ou código..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th></th><th>Código</th><th>Peça</th><th>Quantidade</th><th>Mínimo</th><th>Preço</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((p) => {
              const critico = p.quantidade <= p.quantidadeMinima;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="wf-peca-thumb">
                      {p.imagem ? <img src={p.imagem} alt={p.nome} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <Package size={16} />}
                    </div>
                  </td>
                  <td className="wf-mono">{p.codigo}</td>
                  <td className="wf-table__strong">{p.nome}</td>
                  <td>
                    <div className="wf-qty">
                      <button onClick={() => ajustar(p.id, -1)}>–</button>
                      <span className={`wf-mono ${critico ? "wf-critico" : ""}`}>{p.quantidade}{critico && <AlertTriangle size={13} />}</span>
                      <button onClick={() => ajustar(p.id, 1)}>+</button>
                    </div>
                  </td>
                  <td className="wf-mono wf-muted">{p.quantidadeMinima}</td>
                  <td className="wf-mono">{formatarReais(p.preco)}</td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(p); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(p.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && <tr><td colSpan={7} className="wf-empty-note">Nenhuma peça encontrada.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && <JanelaPeca initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}
