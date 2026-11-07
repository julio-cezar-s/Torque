import { ArrowRight, ShieldCheck, Clock, Users, Star, ChevronRight } from "lucide-react";
import { GradeServicos } from "../../catalogo-servicos/componentes/GradeServicos.jsx";

export function TelaInicial({ servicos, setPage }) {
  return (
    <div>
      <section className="wf-hero">
        <p className="wf-eyebrow" style={{ color: "#F4B400" }}>Oficina multimarcas</p>
        <h1>Seu carro em boas mãos,<br />do diagnóstico à entrega.</h1>
        <p className="wf-hero__lead">Acompanhe cada etapa do serviço: agende, consulte suas ordens de serviço e fale com a equipe sem sair de casa.</p>
        <div className="wf-hero__cta">
          <button className="wf-btn wf-btn--accent" onClick={() => setPage("servicos")}>Ver serviços <ArrowRight size={16} /></button>
          <button className="wf-btn wf-btn--ghost" onClick={() => setPage("cadastro")}>Criar minha conta</button>
        </div>
      </section>

      <section className="wf-section">
        <p className="wf-eyebrow">Por que a Torque</p>
        <h2 className="wf-section__title">Diferenciais da nossa oficina</h2>
        <div className="wf-diff-grid">
          <div className="wf-diff-card"><ShieldCheck size={22} /><h3>Orçamento transparente</h3><p>Você aprova cada item antes de qualquer serviço ser executado.</p></div>
          <div className="wf-diff-card"><Clock size={22} /><h3>Prazo cumprido</h3><p>Acompanhamento de cada ordem de serviço até a entrega do veículo.</p></div>
          <div className="wf-diff-card"><Users size={22} /><h3>Equipe qualificada</h3><p>Mecânicos experientes em manutenção de veículos multimarcas.</p></div>
          <div className="wf-diff-card"><Star size={22} /><h3>Peças de qualidade</h3><p>Componentes de procedência garantida em todo reparo.</p></div>
        </div>
      </section>

      <section className="wf-section">
        <div className="wf-section__head">
          <div><p className="wf-eyebrow">Catálogo</p><h2 className="wf-section__title">Serviços em destaque</h2></div>
          <button className="wf-link" onClick={() => setPage("servicos")}>Ver todos <ChevronRight size={14} /></button>
        </div>
        <GradeServicos servicos={servicos} limit={3} />
      </section>

      <section className="wf-cta-banner">
        <div><h2>Pronto para agendar?</h2><p>Crie sua conta gratuita e solicite o agendamento do seu veículo em poucos minutos.</p></div>
        <button className="wf-btn wf-btn--accent" onClick={() => setPage("cadastro")}>Criar minha conta <ArrowRight size={16} /></button>
      </section>
    </div>
  );
}
