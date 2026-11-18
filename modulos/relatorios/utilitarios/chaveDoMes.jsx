// "2026-11" a partir de uma data ISO ("2026-11-06" ou "2026-11-06T10:00:00Z").
export const chaveDoMes = (data) => (data ? String(data).slice(0, 7) : "");

// "nov/26" a partir de "2026-11".
export function rotuloDoMes(chave) {
  const [ano, mes] = chave.split("-").map(Number);
  const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
  return `${nome}/${String(ano).slice(2)}`;
}
