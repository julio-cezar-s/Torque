import { useState } from "react";
import { Plus } from "lucide-react";
import { CampoBusca } from "../../../compartilhado/componentes/CampoBusca.jsx";
import { SeletorFiltro } from "../../../compartilhado/componentes/SeletorFiltro.jsx";
import { SemResultados } from "../../../compartilhado/componentes/SemResultados.jsx";
import { ContagemResultados } from "../../../compartilhado/componentes/ContagemResultados.jsx";
import { correspondeBusca } from "../../../compartilhado/utilitarios/correspondeBusca.jsx";
import { dentroDoPeriodo } from "../../../compartilhado/utilitarios/dentroDoPeriodo.jsx";
import { MECANICOS } from "../constantes/MECANICOS.jsx";
import { PERIODOS_ORDENS } from "../constantes/PERIODOS_ORDENS.jsx";
import { JanelaEditarOS } from "../componentes/JanelaEditarOS.jsx";
import { JanelaNovaOS } from "../componentes/JanelaNovaOS.jsx";
import { ReciboOS } from "../componentes/ReciboOS.jsx";
import { FichaOS } from "../componentes/FichaOS.jsx";
import { STATUS } from "../constantes/STATUS.jsx";
import { ORDEM_STATUS } from "../constantes/ORDEM_STATUS.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";
import { aplicarDeltaEstoque } from "../utilitarios/aplicarDeltaEstoque.jsx";

export function TelaOrdens({ ordens, clientes, veiculos, estoque, pagamentos, avaliacoes, setOrdens, setClientes, setVeiculos, setEstoque, setPagamentos, setAvaliacoes }) {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [mecanico, setMecanico] = useState("todos");
  const [periodo, setPeriodo] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [reciboOrdem, setReciboOrdem] = useState(null);

  const proximoNumero = () => {
    const nums = ordens.map((o) => Number(o.numero.replace("OS-", "")) || 0);
    const next = (nums.length ? Math.max(...nums) : 200) + 1;
    return `OS-${String(next).padStart(4, "0")}`;
  };

  const filtradas = ordens.filter((o) => {
    if (filtro !== "todas" && o.status !== filtro) return false;
    if (mecanico !== "todos" && (o.mecanico || "Sem atribuição") !== mecanico) return false;
    if (!dentroDoPeriodo(o.dataEntrada, periodo)) return false;
    const c = clientes.find((c) => c.id === o.clienteId);
    const v = veiculos.find((v) => v.id === o.veiculoId);
    return correspondeBusca(`${o.numero} ${c?.nome || ""} ${v?.placa || ""} ${v?.marca || ""} ${v?.modelo || ""} ${o.descricao || ""} ${o.mecanico || ""} ${(o.itens || []).map((i) => i.descricao).join(" ")}`, busca);
  }).sort((a, b) => (a.dataEntrada < b.dataEntrada ? 1 : -1));

  const filtrosAtivos = filtro !== "todas" || mecanico !== "todos" || periodo !== "todos" || busca.trim() !== "";
  const limparFiltros = () => { setFiltro("todas"); setMecanico("todos"); setPeriodo("todos"); setBusca(""); };

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
      const novo = { id: gerarId("c"), ...payload.novoCliente };
      setClientes((prev) => [...prev, novo]);
      clienteId = novo.id;
    }
    let veiculoId = payload.veiculoId;
    if (payload.veiculoMode === "new") {
      const novo = { id: gerarId("v"), clienteId, ...payload.novoVeiculo };
      setVeiculos((prev) => [...prev, novo]);
      veiculoId = novo.id;
    }
    const ordem = {
      id: gerarId("o"), numero: proximoNumero(), clienteId, veiculoId, status: "aguardando",
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
        <div className="wf-toolbar__linha">
          <CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nº, cliente, placa, serviço..." />
          <SeletorFiltro rotulo="Mecânico" valor={mecanico} aoMudar={setMecanico} opcoes={[{ valor: "todos", rotulo: "Todos" }, ...MECANICOS.map((m) => ({ valor: m, rotulo: m }))]} />
          <SeletorFiltro rotulo="Entrada" valor={periodo} aoMudar={setPeriodo} opcoes={PERIODOS_ORDENS} />
        </div>
        <div className="wf-pills">
          <button className={`wf-pill ${filtro === "todas" ? "active" : ""}`} onClick={() => setFiltro("todas")}>Todas ({ordens.length})</button>
          {ORDEM_STATUS.map((s) => (
            <button key={s} className={`wf-pill ${filtro === s ? "active" : ""}`} style={{ "--pill-color": STATUS[s].color }} onClick={() => setFiltro(s)}>
              {STATUS[s].label} ({ordens.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>
        <ContagemResultados mostrando={filtradas.length} total={ordens.length} />
      </div>

      {filtradas.length === 0 ? (
        <SemResultados mensagem="Nenhuma ordem de serviço encontrada para esses filtros." aoLimpar={filtrosAtivos ? limparFiltros : undefined} />
      ) : (
        <div className="wf-ticket-grid">
          {filtradas.map((o) => (
            <FichaOS
              key={o.id} ordem={o}
              cliente={clientes.find((c) => c.id === o.clienteId)}
              veiculo={veiculos.find((v) => v.id === o.veiculoId)}
              avaliacao={avaliacoes.find((a) => a.ordemId === o.id)}
              onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={setEditing} onRecibo={setReciboOrdem}
            />
          ))}
        </div>
      )}

      {reciboOrdem && (
        <ReciboOS
          ordem={reciboOrdem}
          cliente={clientes.find((c) => c.id === reciboOrdem.clienteId)}
          veiculo={veiculos.find((v) => v.id === reciboOrdem.veiculoId)}
          pagamentos={pagamentos}
          onClose={() => setReciboOrdem(null)}
        />
      )}

      {modalOpen && <JanelaNovaOS clientes={clientes} veiculos={veiculos} estoque={estoque} nextNumero={proximoNumero()} onClose={() => setModalOpen(false)} onCreate={handleCreate} />}
      {editing && (
        <JanelaEditarOS
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
