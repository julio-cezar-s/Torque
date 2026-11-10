import { useState, useEffect } from "react";
import { GradeServicos } from "../catalogo-servicos/componentes/GradeServicos.jsx";
import { BalaoChat } from "../chat/componentes/BalaoChat.jsx";
import { Estrutura } from "../../compartilhado/componentes/Estrutura.jsx";
import { TelaPainelCliente } from "./telas/TelaPainelCliente.jsx";
import { TelaAgendarCliente } from "../agendamentos/telas/TelaAgendarCliente.jsx";
import { TelaEstoqueCliente } from "../estoque/telas/TelaEstoqueCliente.jsx";
import { TelaOrdensCliente } from "../ordens-servico/telas/TelaOrdensCliente.jsx";
import { TelaPerfilCliente } from "../clientes/telas/TelaPerfilCliente.jsx";
import { TelaVeiculosCliente } from "../veiculos/telas/TelaVeiculosCliente.jsx";
import { MENU_CLIENTE } from "./constantes/MENU_CLIENTE.jsx";

export function AreaCliente({ clienteId, data, setters, onLogout }) {
  const [tab, setTab] = useState("dashboard");
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
      <Estrutura brandSub={`Olá, ${me.nome.split(" ")[0]}`} navItems={MENU_CLIENTE} tab={tab} setTab={setTab} onLogout={onLogout}>
        {tab === "dashboard" && <TelaPainelCliente cliente={me} veiculos={meusVeiculos} ordens={minhasOrdens} agendamentos={meusAgendamentos} servicos={servicos} pagamentos={pagamentos} onGoTab={setTab} />}
        {tab === "veiculos" && <TelaVeiculosCliente veiculos={meusVeiculos} clienteId={clienteId} ordens={minhasOrdens} agendamentos={meusAgendamentos} setVeiculos={setVeiculos} />}
        {tab === "servicos" && (
          <div className="wf-view">
            <div className="wf-view__head"><div><p className="wf-eyebrow">Catálogo</p><h1>Serviços Disponíveis</h1></div></div>
            <GradeServicos servicos={servicos} />
          </div>
        )}
        {tab === "estoque" && <TelaEstoqueCliente estoque={estoque} />}
        {tab === "agendar" && <TelaAgendarCliente clienteId={clienteId} veiculos={meusVeiculos} servicos={servicos} agendamentos={meusAgendamentos} setAgendamentos={setAgendamentos} onGoVeiculos={() => setTab("veiculos")} />}
        {tab === "ordens" && <TelaOrdensCliente ordens={minhasOrdens} veiculos={veiculos} cliente={me} pagamentos={pagamentos} avaliacoes={avaliacoes} setAvaliacoes={setAvaliacoes} />}
        {tab === "perfil" && <TelaPerfilCliente cliente={me} setClientes={setClientes} />}
      </Estrutura>
      <BalaoChat clienteId={clienteId} clienteNome={me.nome} conversas={conversas} setConversas={setConversas} />
    </>
  );
}
