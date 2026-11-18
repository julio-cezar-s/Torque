import { useState } from "react";
import { TelaChatAdmin } from "../chat/componentes/TelaChatAdmin.jsx";
import { Estrutura } from "../../compartilhado/componentes/Estrutura.jsx";
import { TelaAgendamentos } from "../agendamentos/telas/TelaAgendamentos.jsx";
import { TelaClientes } from "../clientes/telas/TelaClientes.jsx";
import { TelaPainelAdmin } from "./telas/TelaPainelAdmin.jsx";
import { TelaEstoque } from "../estoque/telas/TelaEstoque.jsx";
import { TelaMensagens } from "../mensagens/telas/TelaMensagens.jsx";
import { TelaOrdens } from "../ordens-servico/telas/TelaOrdens.jsx";
import { TelaPagamentos } from "../pagamentos/telas/TelaPagamentos.jsx";
import { TelaServicos } from "../catalogo-servicos/telas/TelaServicos.jsx";
import { TelaRelatorios } from "../relatorios/telas/TelaRelatorios.jsx";
import { TelaVeiculos } from "../veiculos/telas/TelaVeiculos.jsx";
import { pecasComEstoqueBaixo } from "../../compartilhado/utilitarios/pecasComEstoqueBaixo.jsx";
import { MENU_ADMIN } from "./constantes/MENU_ADMIN.jsx";

export function AreaAdmin({ data, setters, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const { clientes, veiculos, ordens, estoque, servicos, agendamentos, mensagens, pagamentos, conversas, avaliacoes } = data;
  const { setClientes, setVeiculos, setOrdens, setEstoque, setServicos, setAgendamentos, setMensagens, setPagamentos, setConversas, setAvaliacoes } = setters;
  const estoqueBaixo = pecasComEstoqueBaixo(estoque);
  return (
    <Estrutura brandSub="Painel Administrativo" navItems={MENU_ADMIN} tab={tab} setTab={setTab} onLogout={onLogout} avisos={{ estoque: estoqueBaixo.length }}>
      {tab === "dashboard" && <TelaPainelAdmin ordens={ordens} clientes={clientes} veiculos={veiculos} estoque={estoque} servicos={servicos} agendamentos={agendamentos} mensagens={mensagens} avaliacoes={avaliacoes} onGoTab={setTab} />}
      {tab === "ordens" && <TelaOrdens ordens={ordens} clientes={clientes} veiculos={veiculos} estoque={estoque} pagamentos={pagamentos} avaliacoes={avaliacoes} setOrdens={setOrdens} setClientes={setClientes} setVeiculos={setVeiculos} setEstoque={setEstoque} setPagamentos={setPagamentos} setAvaliacoes={setAvaliacoes} />}
      {tab === "agendamentos" && <TelaAgendamentos agendamentos={agendamentos} clientes={clientes} veiculos={veiculos} servicos={servicos} setAgendamentos={setAgendamentos} setVeiculos={setVeiculos} />}
      {tab === "servicos" && <TelaServicos servicos={servicos} setServicos={setServicos} />}
      {tab === "clientes" && <TelaClientes clientes={clientes} veiculos={veiculos} agendamentos={agendamentos} setClientes={setClientes} setVeiculos={setVeiculos} />}
      {tab === "veiculos" && <TelaVeiculos veiculos={veiculos} clientes={clientes} ordens={ordens} agendamentos={agendamentos} setVeiculos={setVeiculos} />}
      {tab === "estoque" && <TelaEstoque estoque={estoque} ordens={ordens} setEstoque={setEstoque} />}
      {tab === "pagamentos" && <TelaPagamentos ordens={ordens} clientes={clientes} veiculos={veiculos} pagamentos={pagamentos} setPagamentos={setPagamentos} />}
      {tab === "relatorios" && <TelaRelatorios ordens={ordens} pagamentos={pagamentos} agendamentos={agendamentos} servicos={servicos} clientes={clientes} avaliacoes={avaliacoes} />}
      {tab === "chat" && <TelaChatAdmin conversas={conversas} setConversas={setConversas} clientes={clientes} />}
      {tab === "mensagens" && <TelaMensagens mensagens={mensagens} setMensagens={setMensagens} />}
    </Estrutura>
  );
}
