import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import { AdminArea } from "./areas/AdminArea.jsx";
import { ClientArea } from "./areas/ClientArea.jsx";
import { PublicSite } from "./pages/public/PublicSite.jsx";
import { useTabela } from "./hooks/useTabela.jsx";
import { aoMudarSessao } from "./services/auth/aoMudarSessao.jsx";
import { apiLogout } from "./services/auth/apiLogout.jsx";
import { loadSession } from "./services/auth/loadSession.jsx";
import { carregarTabela } from "./services/dados/carregarTabela.jsx";
import { supabaseConfigurado } from "./services/supabase/supabase.jsx";
import { setAoFalhar } from "./services/supabase/avisoDeFalha.jsx";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSessionState] = useState(null);
  const [aviso, setAviso] = useState("");

  const [clientes, setClientes, carregarClientes] = useTabela("clientes");
  const [veiculos, setVeiculos, carregarVeiculos] = useTabela("veiculos");
  const [ordens, setOrdens, carregarOrdens] = useTabela("ordens");
  const [estoque, setEstoque, carregarEstoque] = useTabela("estoque");
  const [servicos, setServicos, carregarServicos] = useTabela("servicos");
  const [agendamentos, setAgendamentos, carregarAgendamentos] = useTabela("agendamentos");
  const [mensagens, setMensagens, carregarMensagens] = useTabela("mensagens");
  const [pagamentos, setPagamentos, carregarPagamentos] = useTabela("pagamentos");
  const [conversas, setConversas, carregarConversas] = useTabela("conversas");
  const [avaliacoes, setAvaliacoes, carregarAvaliacoes] = useTabela("avaliacoes");

  const carregadores = {
    clientes: carregarClientes, veiculos: carregarVeiculos, ordens: carregarOrdens, estoque: carregarEstoque,
    servicos: carregarServicos, agendamentos: carregarAgendamentos, mensagens: carregarMensagens,
    pagamentos: carregarPagamentos, conversas: carregarConversas, avaliacoes: carregarAvaliacoes,
  };
  const carregadoresRef = useRef(carregadores);
  carregadoresRef.current = carregadores;

  // Com RLS, o que o banco devolve depende de quem está logado: por isso recarregamos
  // tudo no login (e limpamos no logout), não só na abertura da página.
  const carregarTudo = useCallback(async () => {
    const nomes = Object.keys(carregadoresRef.current);
    const resultados = await Promise.all(nomes.map((n) => carregarTabela(n)));
    nomes.forEach((n, i) => carregadoresRef.current[n](resultados[i]));
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado) { setLoading(false); return; }
    (async () => {
      const sess = await loadSession();
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
    return aoMudarSessao(() => { setSessionState(null); limparDados(); });
  }, [carregarTudo, limparDados]);

  const handleLogin = async (sess) => { await carregarTudo(); setSessionState(sess); };
  const handleLogout = async () => { await apiLogout(); setSessionState(null); limparDados(); };

  if (!supabaseConfigurado) {
    return (
      <div className="wf-root wf-root--loading">
        <p><strong>Supabase não configurado.</strong></p>
        <p>Copie <code>.env.example</code> para <code>.env</code> e preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="wf-root wf-root--loading">
        <Loader2 className="wf-spin" size={28} />
        <p>Abrindo a oficina...</p>
      </div>
    );
  }

  const data = { clientes, veiculos, ordens, estoque, servicos, agendamentos, mensagens, pagamentos, conversas, avaliacoes };
  const setters = { setClientes, setVeiculos, setOrdens, setEstoque, setServicos, setAgendamentos, setMensagens, setPagamentos, setConversas, setAvaliacoes };

  return (
    <>
      {aviso && (
        <div role="alert" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "#C4441E", color: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", gap: 12 }}>
          <span>{aviso}</span>
          <button onClick={() => setAviso("")} style={{ background: "none", border: 0, color: "inherit", cursor: "pointer", fontWeight: 700 }}>Fechar</button>
        </div>
      )}
      {!session && <PublicSite servicos={servicos} onLogin={handleLogin} />}
      {session?.type === "admin" && <AdminArea data={data} setters={setters} onLogout={handleLogout} />}
      {session?.type === "cliente" && <ClientArea clienteId={session.id} data={data} setters={setters} onLogout={handleLogout} />}
    </>
  );
}
