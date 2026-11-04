import { useState } from "react";
import { AdminChatView } from "../components/chat/AdminChatView.jsx";
import { Shell } from "../components/common/Shell.jsx";
import { AgendamentosView } from "../views/admin/AgendamentosView.jsx";
import { ClientesView } from "../views/admin/ClientesView.jsx";
import { DashboardView } from "../views/admin/DashboardView.jsx";
import { EstoqueView } from "../views/admin/EstoqueView.jsx";
import { MensagensView } from "../views/admin/MensagensView.jsx";
import { OrdensView } from "../views/admin/OrdensView.jsx";
import { PagamentosView } from "../views/admin/PagamentosView.jsx";
import { ServicosView } from "../views/admin/ServicosView.jsx";
import { VeiculosView } from "../views/admin/VeiculosView.jsx";
import { ADMIN_NAV } from "../constants/ADMIN_NAV.jsx";

export function AdminArea({ data, setters, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const { clientes, veiculos, ordens, estoque, servicos, agendamentos, mensagens, pagamentos, conversas, avaliacoes } = data;
  const { setClientes, setVeiculos, setOrdens, setEstoque, setServicos, setAgendamentos, setMensagens, setPagamentos, setConversas, setAvaliacoes } = setters;
  return (
    <Shell brandSub="Painel Administrativo" navItems={ADMIN_NAV} tab={tab} setTab={setTab} onLogout={onLogout}>
      {tab === "dashboard" && <DashboardView ordens={ordens} clientes={clientes} veiculos={veiculos} estoque={estoque} servicos={servicos} agendamentos={agendamentos} mensagens={mensagens} avaliacoes={avaliacoes} onGoTab={setTab} />}
      {tab === "ordens" && <OrdensView ordens={ordens} clientes={clientes} veiculos={veiculos} estoque={estoque} pagamentos={pagamentos} avaliacoes={avaliacoes} setOrdens={setOrdens} setClientes={setClientes} setVeiculos={setVeiculos} setEstoque={setEstoque} setPagamentos={setPagamentos} setAvaliacoes={setAvaliacoes} />}
      {tab === "agendamentos" && <AgendamentosView agendamentos={agendamentos} clientes={clientes} veiculos={veiculos} servicos={servicos} setAgendamentos={setAgendamentos} setVeiculos={setVeiculos} />}
      {tab === "servicos" && <ServicosView servicos={servicos} setServicos={setServicos} />}
      {tab === "clientes" && <ClientesView clientes={clientes} veiculos={veiculos} agendamentos={agendamentos} setClientes={setClientes} setVeiculos={setVeiculos} />}
      {tab === "veiculos" && <VeiculosView veiculos={veiculos} clientes={clientes} ordens={ordens} agendamentos={agendamentos} setVeiculos={setVeiculos} />}
      {tab === "estoque" && <EstoqueView estoque={estoque} ordens={ordens} setEstoque={setEstoque} />}
      {tab === "pagamentos" && <PagamentosView ordens={ordens} clientes={clientes} veiculos={veiculos} pagamentos={pagamentos} setPagamentos={setPagamentos} />}
      {tab === "chat" && <AdminChatView conversas={conversas} setConversas={setConversas} clientes={clientes} />}
      {tab === "mensagens" && <MensagensView mensagens={mensagens} setMensagens={setMensagens} />}
    </Shell>
  );
}
