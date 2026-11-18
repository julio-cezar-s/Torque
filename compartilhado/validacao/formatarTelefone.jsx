// Máscara enquanto a pessoa digita: (69) 99999-9999 ou (69) 3333-4444.
// "anterior" (opcional) é o valor antes da digitação: permite apagar normalmente
// mesmo quando o cursor está em cima de um símbolo da máscara, como ")" ou "-".
export function formatarTelefone(valor, anterior = "") {
  let d = String(valor || "").replace(/\D/g, "");
  const dAnterior = String(anterior).replace(/\D/g, "");
  if (valor.length < anterior.length && d === dAnterior) d = d.slice(0, -1);
  d = d.slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
