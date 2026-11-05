import { Wrench, LogIn, UserPlus } from "lucide-react";
import { PUBLIC_PAGES } from "../../constants/PUBLIC_PAGES.jsx";

export function PublicHeader({ page, setPage }) {
  return (
    <header className="wf-pub-header">
      <button className="wf-pub-brand" onClick={() => setPage("home")}>
        <Wrench size={20} /><span>Torque</span>
      </button>
      <nav className="wf-pub-nav">
        {PUBLIC_PAGES.map((p) => (
          <button key={p.key} className={`wf-pub-nav__item ${page === p.key ? "active" : ""}`} onClick={() => setPage(p.key)}>{p.label}</button>
        ))}
      </nav>
      <div className="wf-pub-header__cta">
        <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={() => setPage("login")}><LogIn size={15} /> Entrar</button>
        <button className="wf-btn wf-btn--accent wf-btn--sm" onClick={() => setPage("cadastro")}><UserPlus size={15} /> Cadastrar</button>
      </div>
    </header>
  );
}
