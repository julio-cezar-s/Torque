import { Search, X } from "lucide-react";

// Caixa de busca com botão para limpar o texto.
export function CampoBusca({ valor, aoMudar, placeholder }) {
  return (
    <div className="wf-search" role="search">
      <Search size={16} />
      <input type="search" placeholder={placeholder} value={valor} onChange={(e) => aoMudar(e.target.value)} aria-label={placeholder} />
      {valor && <button className="wf-search__limpar" onClick={() => aoMudar("")} aria-label="Limpar busca"><X size={14} /></button>}
    </div>
  );
}
