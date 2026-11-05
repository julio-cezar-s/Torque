import { AGENDAMENTO_STATUS } from "../../constants/AGENDAMENTO_STATUS.jsx";

export function AgStamp({ status, size = "md" }) {
  const s = AGENDAMENTO_STATUS[status] || AGENDAMENTO_STATUS.pendente;
  return <span className={`wf-stamp wf-stamp--${size}`} style={{ color: s.color, borderColor: s.color }}>{s.label}</span>;
}
