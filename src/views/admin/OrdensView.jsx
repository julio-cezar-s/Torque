import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { EditarOSModal } from "../../components/os/EditarOSModal.jsx";
import { NovaOSModal } from "../../components/os/NovaOSModal.jsx";
import { OSTicket } from "../../components/os/OSTicket.jsx";
import { STATUS } from "../../constants/STATUS.jsx";
import { STATUS_ORDER } from "../../constants/STATUS_ORDER.jsx";
import { uid } from "../../utils/formato/uid.jsx";
import { aplicarDeltaEstoque } from "../../utils/ordens/aplicarDeltaEstoque.jsx";

export function OrdensView({ ordens, clientes, veiculos, estoque, pagamentos, avaliacoes, setOrdens, setClientes, setVeiculos, setEstoque, setPagamentos, setAvaliacoes }) {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const proximoNumero = () => {
    const nums = ordens.map((o) => Number(o.numero.replace("OS-", "")) || 0);
    const next = (nums.length ? Math.max(...nums) : 200) + 1;
    return `OS-${String(next).padStart(4, "0")}`;
  };

  const filtradas = ordens.filter((o) => {
    if (filtro !== "todas" && o.status !== filtro) return false;
    if (!busca.trim()) return true;
    const c = clientes.find((c) => c.id === o.clienteId);
    const v = veiculos.find((v) => v.id === o.veiculoId);
    const alvo = `${o.numero} ${c?.nome || ""} ${v?.placa || ""}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  }).sort((a, b) => (a.dataEntrada < b.dataEntrada ? 1 : -1));

  const handleStatusChange = (id, status) => setOrdens((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  const handleDelete = (id) => {
    const pagamentosVinculados = pagamentos.filter((p) => p.ordemId === id).length;
    const msg = pagamentosVinculados
      ? `Excluir esta ordem de serviço? As peças utilizadas voltarão para o estoque e ${pagamentosVinculados} pagamento(s) registrado(s) para ela também serão excluídos.`
      : "Excluir esta ordem de serviço? As peças utilizadas voltarão para o estoque.";
    if (!confirm(msg)) return;
    const alvo = ordens.find((o) => o.id === id);
    if (alvo) aplicarDeltaEstoque(setEstoque, alvo.itens, []);
    setPagamentos((prev) => prev.filter((p) => p.ordemId !== id));
    setAvaliacoes((prev) => prev.filter((a) => a.ordemId !== id));
    setOrdens((prev) => prev.filter((o) => o.id !== id));
  };
  const handleSaveEdit = (updated) => {
    aplicarDeltaEstoque(setEstoque, editing?.itens, updated.itens);
    setOrdens((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditing(null);
  };

  const handleCreate = (payload) => {
    let clienteId = payload.clienteId;
    if (payload.clienteMode === "new") {
      const novo = { id: uid("c"), ...payload.novoCliente };
      setClientes((prev) => [...prev, novo]);
      clienteId = novo.id;
    }
    let veiculoId = payload.veiculoId;
    if (payload.veiculoMode === "new") {
      const novo = { id: uid("v"), clienteId, ...payload.novoVeiculo };
      setVeiculos((prev) => [...prev, novo]);
      veiculoId = novo.id;
    }
    const ordem = {
      id: uid("o"), numero: proximoNumero(), clienteId, veiculoId, status: "aguardando",
      descricao: payload.descricao, mecanico: payload.mecanico,
      dataEntrada: new Date().toISOString().slice(0, 10), previsao: payload.previsao,
      itens: payload.itens,
    };
    aplicarDeltaEstoque(setEstoque, [], ordem.itens);
    setOrdens((prev) => [ordem, ...prev]);
    setModalOpen(false);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Oficina</p><h1>Ordens de Serviço</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => setModalOpen(true)}><Plus size={18} /> Nova OS</button>
      </div>

      <div className="wf-toolbar">
        <div className="wf-search"><Search size={16} /><input placeholder="Buscar por nº, cliente ou placa..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <div className="wf-pills">
          <button className={`wf-pill ${filtro === "todas" ? "active" : ""}`} onClick={() => setFiltro("todas")}>Todas ({ordens.length})</button>
          {STATUS_ORDER.map((s) => (
            <button key={s} className={`wf-pill ${filtro === s ? "active" : ""}`} style={{ "--pill-color": STATUS[s].color }} onClick={() => setFiltro(s)}>
              {STATUS[s].label} ({ordens.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="wf-empty-note">Nenhuma ordem de serviço encontrada para esse filtro.</p>
      ) : (
        <div className="wf-ticket-grid">
          {filtradas.map((o) => (
            <OSTicket
              key={o.id} ordem={o}
              cliente={clientes.find((c) => c.id === o.clienteId)}
              veiculo={veiculos.find((v) => v.id === o.veiculoId)}
              avaliacao={avaliacoes.find((a) => a.ordemId === o.id)}
              onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={setEditing}
            />
          ))}
        </div>
      )}

      {modalOpen && <NovaOSModal clientes={clientes} veiculos={veiculos} estoque={estoque} nextNumero={proximoNumero()} onClose={() => setModalOpen(false)} onCreate={handleCreate} />}
      {editing && (
        <EditarOSModal
          ordem={editing}
          cliente={clientes.find((c) => c.id === editing.clienteId)}
          veiculo={veiculos.find((v) => v.id === editing.veiculoId)}
          estoque={estoque}
          onClose={() => setEditing(null)} onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
