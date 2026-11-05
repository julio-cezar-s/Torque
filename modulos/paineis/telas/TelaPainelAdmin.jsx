import { Plus, ClipboardList, Wrench, Car, PackageX, CalendarClock, Inbox, Star, ChevronRight, AlertTriangle } from "lucide-react";
import { Placa } from "../../../compartilhado/componentes/Placa.jsx";
import { Carimbo } from "../../../compartilhado/componentes/Carimbo.jsx";
import { CartaoEstatistica } from "../../../compartilhado/componentes/CartaoEstatistica.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";
import { formatarData } from "../../../compartilhado/utilitarios/formatarData.jsx";

export function TelaPainelAdmin({ ordens, clientes, veiculos, estoque, servicos, agendamentos, mensagens, avaliacoes, onGoTab }) {
  const abertas = ordens.filter((o) => o.status !== "entregue");
  const mesAtual = new Date().toISOString().slice(0, 7);
  const nomeMesAtual = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const faturamento = ordens.filter((o) => o.dataEntrada?.startsWith(mesAtual)).reduce((sum, o) => sum + o.itens.reduce((s, i) => s + Number(i.valor || 0), 0), 0);
  const veiculosNaOficina = new Set(abertas.map((o) => o.veiculoId)).size;
  const critico = estoque.filter((p) => p.quantidade <= p.quantidadeMinima);
  const agendamentosPendentes = agendamentos.filter((a) => a.status === "pendente").length;
  const mensagensNaoLidas = mensagens.filter((m) => !m.lida).length;
  const notaMedia = avaliacoes.length ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length) : null;
  const recentes = [...ordens].sort((a, b) => (a.dataEntrada < b.dataEntrada ? 1 : -1)).slice(0, 5);
  const proximos = [...agendamentos].filter((a) => a.status !== "cancelado").sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1)).slice(0, 5);

  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome || "—";
  const veiculoPlaca = (id) => veiculos.find((v) => v.id === id)?.placa || "—";
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Painel geral</p><h1>Bem-vindo de volta</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => onGoTab("ordens")}><Plus size={18} /> Nova Ordem de Serviço</button>
      </div>

      <div className="wf-stats">
        <CartaoEstatistica icon={ClipboardList} label="OS em aberto" value={abertas.length} tone="#3C5A6B" />
        <CartaoEstatistica icon={Wrench} label={`Faturamento de ${nomeMesAtual}`} value={formatarReais(faturamento)} tone="#B8860B" />
        <CartaoEstatistica icon={Car} label="Veículos na oficina" value={veiculosNaOficina} tone="#3F7D57" />
        <CartaoEstatistica icon={PackageX} label="Peças em falta" value={critico.length} tone="#C4441E" />
        <CartaoEstatistica icon={CalendarClock} label="Agendamentos pendentes" value={agendamentosPendentes} tone="#3C5A6B" />
        <CartaoEstatistica icon={Inbox} label="Mensagens não lidas" value={mensagensNaoLidas} tone="#C4441E" />
        <CartaoEstatistica icon={Star} label="Avaliação média" value={notaMedia ? `${notaMedia.toFixed(1)} / 5` : "Sem avaliações"} tone="#B8860B" />
      </div>

      <div className="wf-dash-grid">
        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Últimas ordens de serviço</h2><button className="wf-link" onClick={() => onGoTab("ordens")}>Ver todas <ChevronRight size={14} /></button></div>
          {recentes.length === 0 ? <p className="wf-empty-note">Nenhuma ordem de serviço criada ainda.</p> : (
            <div className="wf-recent-list">
              {recentes.map((o) => (
                <div key={o.id} className="wf-recent-row">
                  <span className="wf-mono wf-recent-row__num">{o.numero}</span>
                  <span className="wf-recent-row__cliente">{clienteNome(o.clienteId)}</span>
                  <Placa>{veiculoPlaca(o.veiculoId)}</Placa>
                  <Carimbo status={o.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Próximos agendamentos</h2><button className="wf-link" onClick={() => onGoTab("agendamentos")}>Ver agenda <ChevronRight size={14} /></button></div>
          {proximos.length === 0 ? <p className="wf-empty-note">Nenhum agendamento pendente.</p> : (
            <div className="wf-recent-list">
              {proximos.map((a) => (
                <div key={a.id} className="wf-recent-row">
                  <span className="wf-recent-row__cliente">{clienteNome(a.clienteId)}</span>
                  <span className="wf-muted">{servicoNome(a.servicoId)}</span>
                  <span className="wf-mono" style={{ marginLeft: "auto" }}>{formatarData(a.data)} {a.hora}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Estoque crítico</h2><button className="wf-link" onClick={() => onGoTab("estoque")}>Ver estoque <ChevronRight size={14} /></button></div>
          {critico.length === 0 ? <p className="wf-empty-note">Nenhum item abaixo do mínimo.</p> : (
            <div className="wf-recent-list">
              {critico.map((p) => (
                <div key={p.id} className="wf-recent-row">
                  <AlertTriangle size={15} color="#C4441E" />
                  <span className="wf-recent-row__cliente">{p.nome}</span>
                  <span className="wf-mono" style={{ color: "#C4441E", marginLeft: "auto" }}>{p.quantidade}/{p.quantidadeMinima}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
