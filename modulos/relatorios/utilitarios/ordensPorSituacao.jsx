import { STATUS } from "../../ordens-servico/constantes/STATUS.jsx";
import { ORDEM_STATUS } from "../../ordens-servico/constantes/ORDEM_STATUS.jsx";

// Quantidade de ordens de serviço em cada situação (todas as situações aparecem, mesmo com zero).
export function ordensPorSituacao(ordens, meses) {
  const noPeriodo = ordens.filter((o) => meses.includes(String(o.dataEntrada).slice(0, 7)));
  return ORDEM_STATUS.map((s) => ({ rotulo: STATUS[s].label, valor: noPeriodo.filter((o) => o.status === s).length }));
}
