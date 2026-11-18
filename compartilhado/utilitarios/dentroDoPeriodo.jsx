const dois = (n) => String(n).padStart(2, "0");
const textoDaData = (d) => `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;

// Confere se uma data ISO ("2026-11-06...") está no período escolhido.
// Chaves: todos | hoje | 7dias (últimos 7 dias) | mes (este mês) | proximos7 (hoje e próximos 7 dias) | passados (antes de hoje)
export function dentroDoPeriodo(dataIso, chave) {
  if (chave === "todos") return true;
  const data = String(dataIso || "").slice(0, 10);
  if (!data) return false;
  const hoje = new Date();
  const hojeTexto = textoDaData(hoje);
  const deslocado = (dias) => textoDaData(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + dias));
  switch (chave) {
    case "hoje": return data === hojeTexto;
    case "7dias": return data >= deslocado(-6) && data <= hojeTexto;
    case "mes": return data.slice(0, 7) === hojeTexto.slice(0, 7);
    case "proximos7": return data >= hojeTexto && data <= deslocado(7);
    case "passados": return data < hojeTexto;
    default: return true;
  }
}
