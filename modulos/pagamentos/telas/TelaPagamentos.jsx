import { useState } from "react";
import { Plus, Wallet, Receipt, ClipboardList, Trash2 } from "lucide-react";
import { CampoBusca } from "../../../compartilhado/componentes/CampoBusca.jsx";
import { SeletorFiltro } from "../../../compartilhado/componentes/SeletorFiltro.jsx";
import { SemResultados } from "../../../compartilhado/componentes/SemResultados.jsx";
import { ContagemResultados } from "../../../compartilhado/componentes/ContagemResultados.jsx";
import { correspondeBusca } from "../../../compartilhado/utilitarios/correspondeBusca.jsx";
import { Placa } from "../../../compartilhado/componentes/Placa.jsx";
import { CartaoEstatistica } from "../../../compartilhado/componentes/CartaoEstatistica.jsx";
import { JanelaPagamento } from "../componentes/JanelaPagamento.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";
import { formatarData } from "../../../compartilhado/utilitarios/formatarData.jsx";
import { totalOS } from "../../ordens-servico/utilitarios/totalOS.jsx";
import { totalPago } from "../../ordens-servico/utilitarios/totalPago.jsx";

export function TelaPagamentos({ ordens, clientes, veiculos, pagamentos, setPagamentos }) {
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("todas");
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const todasLinhas = ordens.map((o) => {
    const total = totalOS(o);
    const pago = totalPago(o.id, pagamentos);
    const saldo = total - pago;
    const status = saldo <= 0 ? "pago" : pago > 0 ? "parcial" : "pendente";
    return { ordem: o, total, pago, saldo, status };
  }).sort((a, b) => (a.ordem.dataEntrada < b.ordem.dataEntrada ? 1 : -1));

  const linhas = todasLinhas.filter((l) => {
    if (situacao !== "todas" && l.status !== situacao) return false;
    const c = clientes.find((c) => c.id === l.ordem.clienteId);
    const v = veiculos.find((v) => v.id === l.ordem.veiculoId);
    return correspondeBusca(`${l.ordem.numero} ${c?.nome || ""} ${v?.placa || ""} ${v?.marca || ""} ${v?.modelo || ""}`, busca);
  });
  const filtrosAtivos = situacao !== "todas" || busca.trim() !== "";
  const limparFiltros = () => { setSituacao("todas"); setBusca(""); };

  const totalRecebido = pagamentos.reduce((s, p) => s + Number(p.valor || 0), 0);
  const totalEmAberto = todasLinhas.reduce((s, l) => s + Math.max(0, l.saldo), 0);
  const STATUS_PGTO = { pago: { label: "Pago", color: "#3F7D57" }, parcial: { label: "Parcial", color: "#B8860B" }, pendente: { label: "Pendente", color: "#C4441E" } };

  const handleDeletePagamento = (id) => { if (confirm("Excluir este pagamento?")) setPagamentos((prev) => prev.filter((p) => p.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Financeiro</p><h1>Pagamentos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => setModalOpen(true)}><Plus size={18} /> Registrar Pagamento</button>
      </div>

      <div className="wf-stats" style={{ marginBottom: 24 }}>
        <CartaoEstatistica icon={Wallet} label="Total recebido" value={formatarReais(totalRecebido)} tone="#3F7D57" />
        <CartaoEstatistica icon={Receipt} label="Em aberto" value={formatarReais(totalEmAberto)} tone="#C4441E" />
        <CartaoEstatistica icon={ClipboardList} label="Ordens de serviço" value={ordens.length} tone="#3C5A6B" />
      </div>

      <div className="wf-toolbar">
        <div className="wf-toolbar__linha"><CampoBusca valor={busca} aoMudar={setBusca} placeholder="Buscar por nº, cliente ou placa..." /></div>
        <div className="wf-pills">
          <button className={`wf-pill ${situacao === "todas" ? "active" : ""}`} onClick={() => setSituacao("todas")}>Todas ({todasLinhas.length})</button>
          {Object.entries(STATUS_PGTO).map(([chave, info]) => (
            <button key={chave} className={`wf-pill ${situacao === chave ? "active" : ""}`} style={{ "--pill-color": info.color }} onClick={() => setSituacao(chave)}>
              {info.label} ({todasLinhas.filter((l) => l.status === chave).length})
            </button>
          ))}
        </div>
        <ContagemResultados mostrando={linhas.length} total={todasLinhas.length} />
      </div>

      {linhas.length === 0 ? <SemResultados mensagem="Nenhuma ordem de serviço para exibir." aoLimpar={filtrosAtivos ? limparFiltros : undefined} /> : (
        <div className="wf-msg-list">
          {linhas.map((l) => {
            const c = clientes.find((c) => c.id === l.ordem.clienteId);
            const v = veiculos.find((v) => v.id === l.ordem.veiculoId);
            const pagamentosDaOS = pagamentos.filter((p) => p.ordemId === l.ordem.id).sort((a, b) => (a.data < b.data ? 1 : -1));
            const st = STATUS_PGTO[l.status];
            return (
              <div key={l.ordem.id} className="wf-msg-row">
                <div className="wf-msg-row__head" onClick={() => setExpandedId((prev) => (prev === l.ordem.id ? null : l.ordem.id))}>
                  <div className="wf-msg-row__info">
                    <span className="wf-msg-row__nome">{l.ordem.numero} · {c?.nome || "Cliente removido"}</span>
                    <span className="wf-msg-row__assunto"><Placa>{v?.placa || "—"}</Placa></span>
                  </div>
                  <span className="wf-mono">{formatarReais(l.total)}</span>
                  <span className="wf-stamp wf-stamp--sm" style={{ color: st.color, borderColor: st.color }}>{st.label}</span>
                </div>
                {expandedId === l.ordem.id && (
                  <div className="wf-msg-row__body">
                    <p className="wf-mono" style={{ margin: "0 0 8px" }}>Pago: {formatarReais(l.pago)} &nbsp;·&nbsp; Saldo: {formatarReais(Math.max(0, l.saldo))}</p>
                    {pagamentosDaOS.length === 0 ? <p className="wf-empty-note">Nenhum pagamento registrado para esta OS.</p> : (
                      <div className="wf-table-wrap">
                        <table className="wf-table">
                          <thead><tr><th>Data</th><th>Forma</th><th>Valor</th><th>Obs.</th><th></th></tr></thead>
                          <tbody>
                            {pagamentosDaOS.map((p) => (
                              <tr key={p.id}>
                                <td className="wf-mono">{formatarData(p.data)}</td>
                                <td>{p.forma}</td>
                                <td className="wf-mono">{formatarReais(p.valor)}</td>
                                <td className="wf-muted">{p.obs || "—"}</td>
                                <td><button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDeletePagamento(p.id)}><Trash2 size={14} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <JanelaPagamento
          ordens={ordens} clientes={clientes} veiculos={veiculos} pagamentos={pagamentos}
          onClose={() => setModalOpen(false)}
          onSave={(p) => { setPagamentos((prev) => [p, ...prev]); setModalOpen(false); }}
        />
      )}
    </div>
  );
}
