import { CalendarClock, Car, ChevronRight, ClipboardList, Wallet } from "lucide-react";
import { Plate } from "../../components/common/Plate.jsx";
import { Stamp } from "../../components/common/Stamp.jsx";
import { AgStamp } from "../../components/common/AgStamp.jsx";
import { StatCard } from "../../components/common/StatCard.jsx";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";
import { fmtData } from "../../utils/formato/fmtData.jsx";
import { totalOS } from "../../utils/ordens/totalOS.jsx";
import { totalPago } from "../../utils/ordens/totalPago.jsx";

export function ClienteDashboardView({ cliente, veiculos, ordens, agendamentos, servicos, pagamentos, onGoTab }) {
  const hoje = new Date().toISOString().slice(0, 10);
  const osEmAberto = ordens.filter((o) => o.status !== "entregue");
  const proximos = agendamentos
    .filter((a) => (a.status === "pendente" || a.status === "confirmado") && a.data >= hoje)
    .sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1));
  const saldoDevedor = ordens.reduce((s, o) => s + Math.max(0, totalOS(o) - totalPago(o.id, pagamentos)), 0);
  const recentes = [...ordens].sort((a, b) => (a.dataEntrada < b.dataEntrada ? 1 : -1)).slice(0, 5);

  const placa = (id) => veiculos.find((v) => v.id === id)?.placa || "—";
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Visão geral</p><h1>Olá, {cliente.nome.split(" ")[0]}</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => onGoTab("agendar")}><CalendarClock size={18} /> Agendar serviço</button>
      </div>

      <div className="wf-stats">
        <StatCard icon={ClipboardList} label="OS em andamento" value={osEmAberto.length} tone="#3C5A6B" />
        <StatCard icon={Car} label="Meus veículos" value={veiculos.length} tone="#3F7D57" />
        <StatCard icon={CalendarClock} label="Próximos agendamentos" value={proximos.length} tone="#B8860B" />
        <StatCard icon={Wallet} label="Saldo a pagar" value={fmtBRL(saldoDevedor)} tone={saldoDevedor > 0 ? "#C4441E" : "#3F7D57"} />
      </div>

      <div className="wf-dash-grid">
        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Minhas últimas ordens de serviço</h2><button className="wf-link" onClick={() => onGoTab("ordens")}>Ver todas <ChevronRight size={14} /></button></div>
          {recentes.length === 0 ? <p className="wf-empty-note">Você ainda não tem ordens de serviço.</p> : (
            <div className="wf-recent-list">
              {recentes.map((o) => (
                <div key={o.id} className="wf-recent-row">
                  <span className="wf-mono wf-recent-row__num">{o.numero}</span>
                  <Plate>{placa(o.veiculoId)}</Plate>
                  <span className="wf-mono">{fmtBRL(totalOS(o))}</span>
                  <Stamp status={o.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Próximos agendamentos</h2><button className="wf-link" onClick={() => onGoTab("agendar")}>Ver agenda <ChevronRight size={14} /></button></div>
          {proximos.length === 0 ? <p className="wf-empty-note">Nenhum agendamento futuro.</p> : (
            <div className="wf-recent-list">
              {proximos.slice(0, 5).map((a) => (
                <div key={a.id} className="wf-recent-row">
                  <span className="wf-recent-row__cliente">{servicoNome(a.servicoId)}</span>
                  <Plate>{placa(a.veiculoId)}</Plate>
                  <span className="wf-mono">{fmtData(a.data)} {a.hora}</span>
                  <AgStamp status={a.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
