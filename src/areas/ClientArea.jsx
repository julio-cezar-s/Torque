import { useState, useEffect } from "react";
import { ServicosGrid } from "../components/ServicosGrid.jsx";
import { ChatBubble } from "../components/chat/ChatBubble.jsx";
import { Shell } from "../components/common/Shell.jsx";
import { ClienteAgendarView } from "../views/client/ClienteAgendarView.jsx";
import { ClienteEstoqueView } from "../views/client/ClienteEstoqueView.jsx";
import { ClienteOrdensView } from "../views/client/ClienteOrdensView.jsx";
import { ClientePerfilView } from "../views/client/ClientePerfilView.jsx";
import { ClienteVeiculosView } from "../views/client/ClienteVeiculosView.jsx";
import { CLIENT_NAV } from "../constants/CLIENT_NAV.jsx";

export function ClientArea({ clienteId, data, setters, onLogout }) {
  const [tab, setTab] = useState("veiculos");
  const { clientes, veiculos, ordens, servicos, agendamentos, estoque, conversas, pagamentos, avaliacoes } = data;
  const { setClientes, setVeiculos, setAgendamentos, setConversas, setAvaliacoes } = setters;
  const me = clientes.find((c) => c.id === clienteId);

  useEffect(() => { if (!me) onLogout(); }, [me]);
  if (!me) return null;

  const meusVeiculos = veiculos.filter((v) => v.clienteId === clienteId);
  const minhasOrdens = ordens.filter((o) => o.clienteId === clienteId);
  const meusAgendamentos = agendamentos.filter((a) => a.clienteId === clienteId);

  return (
    <>
      <Shell brandSub={`Olá, ${me.nome.split(" ")[0]}`} navItems={CLIENT_NAV} tab={tab} setTab={setTab} onLogout={onLogout}>
        {tab === "veiculos" && <ClienteVeiculosView veiculos={meusVeiculos} clienteId={clienteId} ordens={minhasOrdens} agendamentos={meusAgendamentos} setVeiculos={setVeiculos} />}
        {tab === "servicos" && (
          <div className="wf-view">
            <div className="wf-view__head"><div><p className="wf-eyebrow">Catálogo</p><h1>Serviços Disponíveis</h1></div></div>
            <ServicosGrid servicos={servicos} />
          </div>
        )}
        {tab === "estoque" && <ClienteEstoqueView estoque={estoque} />}
        {tab === "agendar" && <ClienteAgendarView clienteId={clienteId} veiculos={meusVeiculos} servicos={servicos} agendamentos={meusAgendamentos} setAgendamentos={setAgendamentos} onGoVeiculos={() => setTab("veiculos")} />}
        {tab === "ordens" && <ClienteOrdensView ordens={minhasOrdens} veiculos={veiculos} cliente={me} pagamentos={pagamentos} avaliacoes={avaliacoes} setAvaliacoes={setAvaliacoes} />}
        {tab === "perfil" && <ClientePerfilView cliente={me} setClientes={setClientes} />}
      </Shell>
      <ChatBubble clienteId={clienteId} clienteNome={me.nome} conversas={conversas} setConversas={setConversas} />
    </>
  );
}
