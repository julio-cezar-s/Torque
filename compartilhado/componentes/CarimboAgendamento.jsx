import { STATUS_AGENDAMENTO } from "../../modulos/agendamentos/constantes/STATUS_AGENDAMENTO.jsx";

export function CarimboAgendamento({ status, size = "md" }) {
  const s = STATUS_AGENDAMENTO[status] || STATUS_AGENDAMENTO.pendente;
  return <span className={`wf-stamp wf-stamp--${size}`} style={{ color: s.color, borderColor: s.color }}>{s.label}</span>;
}
