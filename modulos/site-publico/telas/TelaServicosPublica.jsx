import { GradeServicos } from "../../catalogo-servicos/componentes/GradeServicos.jsx";

export function TelaServicosPublica({ servicos, onSelectServico }) {
  return (
    <div className="wf-section">
      <p className="wf-eyebrow">Catálogo completo</p>
      <h1 className="wf-page-title">Nossos Serviços</h1>
      <p className="wf-page-lead">Conheça os serviços oferecidos pela nossa oficina. Clique em um serviço para ver os detalhes — para agendar, crie sua conta ou faça login.</p>
      <GradeServicos servicos={servicos} onSelect={onSelectServico} />
    </div>
  );
}
