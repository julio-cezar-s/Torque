import { Wrench, MapPin, Phone, Mail, Clock } from "lucide-react";
import { DADOS_OFICINA } from "../constantes/DADOS_OFICINA.jsx";

export function RodapePublico() {
  return (
    <footer className="wf-pub-footer">
      <div className="wf-pub-footer__grid">
        <div>
          <div className="wf-pub-brand" style={{ padding: 0, marginBottom: 8 }}><Wrench size={18} /><span>Torque</span></div>
          <p>Manutenção automotiva com transparência, do diagnóstico à entrega.</p>
        </div>
        <div>
          <h4>Contato</h4>
          <p><MapPin size={14} /> {DADOS_OFICINA.endereco}</p>
          <p><Phone size={14} /> {DADOS_OFICINA.telefone}</p>
          <p><Mail size={14} /> {DADOS_OFICINA.email}</p>
        </div>
        <div>
          <h4>Horário</h4>
          <p><Clock size={14} /> {DADOS_OFICINA.horario}</p>
        </div>
      </div>
      <div className="wf-pub-footer__bottom">© {new Date().getFullYear()} Torque Gestão de Oficina. Todos os direitos reservados.</div>
    </footer>
  );
}
