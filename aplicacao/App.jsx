import { useState, useEffect, useCallback, useRef } from "react";
import { AreaAdmin } from "../modulos/paineis/AreaAdmin.jsx";
import { AreaCliente } from "../modulos/paineis/AreaCliente.jsx";
import { SitePublico } from "../modulos/site-publico/componentes/SitePublico.jsx";
import { useTabela } from "../nucleo/ganchos/useTabela.jsx";
import { aoMudarSessao } from "../modulos/autenticacao/integracao/aoMudarSessao.jsx";
import { TelaNovaSenha } from "../modulos/autenticacao/telas/TelaNovaSenha.jsx";
import { sair } from "../modulos/autenticacao/integracao/sair.jsx";
import { carregarSessao } from "../modulos/autenticacao/integracao/carregarSessao.jsx";
import { carregarTabela } from "../nucleo/dados/carregarTabela.jsx";
import { carregarTabelaSegura } from "../nucleo/dados/carregarTabelaSegura.jsx";
import { assinarMudancas } from "../nucleo/dados/assinarMudancas.jsx";
import { aguardarGravacoes } from "../nucleo/dados/filaDeGravacao.jsx";
import { TABELAS } from "../nucleo/supabase/TABELAS.jsx";
import { supabaseConfigurado } from "../nucleo/supabase/supabase.jsx";
import { TelaCarregando } from "../compartilhado/componentes/TelaCarregando.jsx";
import { TelaSemConfiguracao } from "../compartilhado/componentes/TelaSemConfiguracao.jsx";
import { FaixaDeAviso } from "../compartilhado/componentes/FaixaDeAviso.jsx";
import { setAoFalhar } from "../nucleo/supabase/avisoDeFalha.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSessionState] = useState(null);
  const [aviso, setAviso] = useState("");
  // true quando a pessoa chega pelo link do e-mail "Esqueci minha senha" (o Supabase já cria uma sessão temporária)
  const [recuperandoSenha, setRecuperandoSenha] = useState(() => window.location.hash.includes("type=recovery"));

  const [clientes, setClientes, carregarClientes, remotoClientes] = useTabela("clientes");
  const [veiculos, setVeiculos, carregarVeiculos, remotoVeiculos] = useTabela("veiculos");
  const [ordens, setOrdens, carregarOrdens, remotoOrdens] = useTabela("ordens");
  const [estoque, setEstoque, carregarEstoque, remotoEstoque] = useTabela("estoque");
  const [servicos, setServicos, carregarServicos, remotoServicos] = useTabela("servicos");
  const [agendamentos, setAgendamentos, carregarAgendamentos, remotoAgendamentos] = useTabela("agendamentos");
  const [mensagens, setMensagens, carregarMensagens, remotoMensagens] = useTabela("mensagens");
  const [pagamentos, setPagamentos, carregarPagamentos, remotoPagamentos] = useTabela("pagamentos");
  const [conversas, setConversas, carregarConversas, remotoConversas] = useTabela("conversas");
  const [avaliacoes, setAvaliacoes, carregarAvaliacoes, remotoAvaliacoes] = useTabela("avaliacoes");

  const carregadores = {
    clientes: carregarClientes, veiculos: carregarVeiculos, ordens: carregarOrdens, estoque: carregarEstoque,
    servicos: carregarServicos, agendamentos: carregarAgendamentos, mensagens: carregarMensagens,
    pagamentos: carregarPagamentos, conversas: carregarConversas, avaliacoes: carregarAvaliacoes,
  };
  const carregadoresRef = useRef(carregadores);
  carregadoresRef.current = carregadores;
  const remotos = {
    clientes: remotoClientes, veiculos: remotoVeiculos, ordens: remotoOrdens, estoque: remotoEstoque,
    servicos: remotoServicos, agendamentos: remotoAgendamentos, mensagens: remotoMensagens,
    pagamentos: remotoPagamentos, conversas: remotoConversas, avaliacoes: remotoAvaliacoes,
  };
  const remotosRef = useRef(remotos);
  remotosRef.current = remotos;

  // Com RLS, o que o banco devolve depende de quem está logado: por isso recarregamos
  // tudo no login (e limpamos no logout), não só na abertura da página.
  const carregarTudo = useCallback(async () => {
    const nomes = Object.keys(carregadoresRef.current);
    const resultados = await Promise.all(nomes.map((n) => carregarTabelaSegura(n)));
    nomes.forEach((n, i) => carregadoresRef.current[n](resultados[i] ?? []));
    if (resultados.some((r) => r === null)) {
      setAviso("Não foi possível carregar todos os dados. Verifique sua conexão com a internet e recarregue a página.");
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado) { setLoading(false); return; }
    (async () => {
      const sess = await carregarSessao();
      await carregarTudo();
      setSessionState(sess);
      setLoading(false);
    })();
  }, [carregarTudo]);

  const limparDados = useCallback(() => {
    Object.values(carregadoresRef.current).forEach((carregar) => carregar([]));
    // o catálogo de serviços é público: mantém a vitrine do site
    carregarTabela("servicos").then(carregadoresRef.current.servicos);
  }, []);

  useEffect(() => {
    setAoFalhar((msg) => { setAviso(msg); carregarTudo(); });
    return aoMudarSessao(() => { setSessionState(null); limparDados(); }, () => setRecuperandoSenha(true));
  }, [carregarTudo, limparDados]);

  // Tempo real: quando outra pessoa (ou outra aba) muda algo, busca a tabela de novo e atualiza a tela.
  // Cliente não escuta "mensagens" (contato), que é só do administrador.
  const papel = session?.type;
  useEffect(() => {
    if (!papel) return undefined;
    const tabelas = [...TABELAS.filter((t) => papel === "admin" || t !== "mensagens"), "mensagens_chat"];
    const temporizadores = {};
    const cancelar = assinarMudancas(tabelas, (tabelaDoEvento) => {
      const tabela = tabelaDoEvento === "mensagens_chat" ? "conversas" : tabelaDoEvento; // mensagem nova = conversa atualizada
      clearTimeout(temporizadores[tabela]); // agrupa várias mudanças seguidas numa busca só
      temporizadores[tabela] = setTimeout(async () => {
        const remoto = remotosRef.current[tabela];
        const versao = remoto.versao();
        await aguardarGravacoes(); // não busca enquanto ainda há gravações nossas pendentes
        const dados = await carregarTabelaSegura(tabela);
        if (dados) remoto.mesclar(dados, versao);
      }, 300);
    });
    return () => { Object.values(temporizadores).forEach(clearTimeout); cancelar(); };
  }, [papel]);

  const handleLogin = async (sess) => { await carregarTudo(); setSessionState(sess); };
  const handleLogout = async () => { await sair(); setSessionState(null); limparDados(); };

  const concluirRecuperacao = async () => {
    await sair();
    window.history.replaceState(null, "", window.location.pathname);
    setRecuperandoSenha(false); setSessionState(null); limparDados();
  };

  if (!supabaseConfigurado) return <TelaSemConfiguracao />;

  if (recuperandoSenha) {
    return <div className="wf-pub"><main className="wf-pub-main"><TelaNovaSenha onConcluir={concluirRecuperacao} /></main></div>;
  }

  if (loading) return <TelaCarregando />;

  const data = { clientes, veiculos, ordens, estoque, servicos, agendamentos, mensagens, pagamentos, conversas, avaliacoes };
  const setters = { setClientes, setVeiculos, setOrdens, setEstoque, setServicos, setAgendamentos, setMensagens, setPagamentos, setConversas, setAvaliacoes };

  return (
    <>
      <FaixaDeAviso mensagem={aviso} onFechar={() => setAviso("")} />
      {!session && <SitePublico servicos={servicos} onLogin={handleLogin} />}
      {session?.type === "admin" && <AreaAdmin data={data} setters={setters} onLogout={handleLogout} />}
      {session?.type === "cliente" && <AreaCliente clienteId={session.id} data={data} setters={setters} onLogout={handleLogout} />}
    </>
  );
}
