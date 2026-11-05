import { useState } from "react";
import { TelaCadastro } from "../../autenticacao/telas/TelaCadastro.jsx";
import { TelaContato } from "../telas/TelaContato.jsx";
import { TelaInicial } from "../telas/TelaInicial.jsx";
import { TelaEntrar } from "../../autenticacao/telas/TelaEntrar.jsx";
import { RodapePublico } from "./RodapePublico.jsx";
import { CabecalhoPublico } from "./CabecalhoPublico.jsx";
import { TelaDetalheServico } from "../telas/TelaDetalheServico.jsx";
import { TelaServicosPublica } from "../telas/TelaServicosPublica.jsx";
import { TelaSobre } from "../telas/TelaSobre.jsx";

export function SitePublico({ servicos, onLogin }) {
  const [page, setPage] = useState("home");
  const [servicoDetalheId, setServicoDetalheId] = useState(null);
  const abrirDetalheServico = (id) => { setServicoDetalheId(id); setPage("servico-detalhe"); };
  const servicoSelecionado = servicos.find((s) => s.id === servicoDetalheId) || null;

  return (
    <div className="wf-pub">
      <CabecalhoPublico page={page} setPage={setPage} />
      <main className="wf-pub-main">
        {page === "home" && <TelaInicial servicos={servicos} setPage={setPage} />}
        {page === "servicos" && <TelaServicosPublica servicos={servicos} onSelectServico={abrirDetalheServico} />}
        {page === "servico-detalhe" && <TelaDetalheServico servico={servicoSelecionado} onVoltar={() => setPage("servicos")} setPage={setPage} />}
        {page === "sobre" && <TelaSobre />}
        {page === "contato" && <TelaContato />}
        {page === "login" && <TelaEntrar setPage={setPage} onLogin={onLogin} />}
        {page === "cadastro" && <TelaCadastro setPage={setPage} onLogin={onLogin} />}
      </main>
      <RodapePublico />
    </div>
  );
}
