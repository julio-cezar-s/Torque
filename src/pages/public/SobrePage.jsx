import { Wrench, Users, ShieldCheck, MapPin, Clock, Phone } from "lucide-react";
import { OFICINA_INFO } from "../../constants/OFICINA_INFO.jsx";

export function SobrePage() {
  return (
    <div className="wf-section">
      <p className="wf-eyebrow">Institucional</p>
      <h1 className="wf-page-title">Sobre a Torque</h1>
      <p className="wf-page-lead">Cuidamos de veículos com a mesma atenção que teríamos com os nossos. Combinamos experiência mecânica com um jeito organizado de trabalhar: toda ordem de serviço é registrada, todo orçamento é aprovado antes de começar, e você acompanha o andamento de perto.</p>
      <div className="wf-diff-grid">
        <div className="wf-diff-card"><Wrench size={22} /><h3>Estrutura completa</h3><p>Bancadas equipadas para elétrica, suspensão, freios e revisões programadas.</p></div>
        <div className="wf-diff-card"><Users size={22} /><h3>Equipe própria</h3><p>Mecânicos fixos, sem terceirização, para manter o padrão de qualidade em cada serviço.</p></div>
        <div className="wf-diff-card"><ShieldCheck size={22} /><h3>Garantia nos serviços</h3><p>Reparos executados com garantia de mão de obra e peças utilizadas.</p></div>
      </div>
      <div className="wf-panel" style={{ marginTop: 28, maxWidth: 520 }}>
        <h4 style={{ marginTop: 0 }}>Endereço e horário</h4>
        <p className="wf-contact"><MapPin size={14} /> {OFICINA_INFO.endereco}</p>
        <p className="wf-contact"><Clock size={14} /> {OFICINA_INFO.horario}</p>
        <p className="wf-contact"><Phone size={14} /> {OFICINA_INFO.telefone}</p>
      </div>
    </div>
  );
}
