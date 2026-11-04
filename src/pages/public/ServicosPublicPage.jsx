import { ServicosGrid } from "../../components/ServicosGrid.jsx";

export function ServicosPublicPage({ servicos, onSelectServico }) {
  return (
    <div className="wf-section">
      <p className="wf-eyebrow">Catálogo completo</p>
      <h1 className="wf-page-title">Nossos Serviços</h1>
      <p className="wf-page-lead">Conheça os serviços oferecidos pela nossa oficina. Clique em um serviço para ver os detalhes — para agendar, crie sua conta ou faça login.</p>
      <ServicosGrid servicos={servicos} onSelect={onSelectServico} />
    </div>
  );
}
