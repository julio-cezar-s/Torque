import { chaveDoMes, rotuloDoMes } from "./chaveDoMes.jsx";

// Soma dos pagamentos recebidos em cada mês.
export function faturamentoPorMes(pagamentos, meses) {
  const soma = Object.fromEntries(meses.map((m) => [m, 0]));
  pagamentos.forEach((p) => { const m = chaveDoMes(p.data); if (m in soma) soma[m] += Number(p.valor || 0); });
  return meses.map((m) => ({ chave: m, rotulo: rotuloDoMes(m), valor: soma[m] }));
}
