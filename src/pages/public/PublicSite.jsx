import { useState } from "react";
import { CadastroPage } from "./CadastroPage.jsx";
import { ContatoPage } from "./ContatoPage.jsx";
import { HomePage } from "./HomePage.jsx";
import { LoginPage } from "./LoginPage.jsx";
import { PublicFooter } from "./PublicFooter.jsx";
import { PublicHeader } from "./PublicHeader.jsx";
import { ServicoDetalhePage } from "./ServicoDetalhePage.jsx";
import { ServicosPublicPage } from "./ServicosPublicPage.jsx";
import { SobrePage } from "./SobrePage.jsx";

export function PublicSite({ servicos, onLogin }) {
  const [page, setPage] = useState("home");
  const [servicoDetalheId, setServicoDetalheId] = useState(null);
  const abrirDetalheServico = (id) => { setServicoDetalheId(id); setPage("servico-detalhe"); };
  const servicoSelecionado = servicos.find((s) => s.id === servicoDetalheId) || null;

  return (
    <div className="wf-pub">
      <PublicHeader page={page} setPage={setPage} />
      <main className="wf-pub-main">
        {page === "home" && <HomePage servicos={servicos} setPage={setPage} />}
        {page === "servicos" && <ServicosPublicPage servicos={servicos} onSelectServico={abrirDetalheServico} />}
        {page === "servico-detalhe" && <ServicoDetalhePage servico={servicoSelecionado} onVoltar={() => setPage("servicos")} setPage={setPage} />}
        {page === "sobre" && <SobrePage />}
        {page === "contato" && <ContatoPage />}
        {page === "login" && <LoginPage setPage={setPage} onLogin={onLogin} />}
        {page === "cadastro" && <CadastroPage setPage={setPage} onLogin={onLogin} />}
      </main>
      <PublicFooter />
    </div>
  );
}
