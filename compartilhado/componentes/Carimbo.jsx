import { STATUS } from "../../modulos/ordens-servico/constantes/STATUS.jsx";

export function Carimbo({ status, size = "md" }) {
  const s = STATUS[status] || STATUS.aguardando;
  return <span className={`wf-stamp wf-stamp--${size}`} style={{ color: s.color, borderColor: s.color }}>{s.label}</span>;
}
