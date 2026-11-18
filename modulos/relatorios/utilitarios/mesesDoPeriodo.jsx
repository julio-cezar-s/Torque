import { chaveDoMes } from "./chaveDoMes.jsx";

// Lista de meses ("YYYY-MM") do mais antigo ao atual.
// meses = null → desde o mês mais antigo que aparece nas datas informadas (no máximo 24 meses).
export function mesesDoPeriodo(meses, datas = []) {
  const hoje = new Date();
  const atual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  let quantidade = meses;
  if (!quantidade) {
    const antigos = datas.map(chaveDoMes).filter(Boolean).sort();
    if (antigos.length) {
      const [a, m] = antigos[0].split("-").map(Number);
      quantidade = (atual.getFullYear() - a) * 12 + (atual.getMonth() + 1 - m) + 1;
    }
    quantidade = Math.min(Math.max(quantidade || 1, 1), 24);
  }
  const lista = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const d = new Date(atual.getFullYear(), atual.getMonth() - i, 1);
    lista.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return lista;
}
