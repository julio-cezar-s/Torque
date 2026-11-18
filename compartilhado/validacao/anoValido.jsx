// Ano do veículo com 4 dígitos, entre 1900 e o próximo ano (modelos novos saem antes do ano começar).
export function anoValido(ano) {
  const valor = String(ano || "").trim();
  if (!/^\d{4}$/.test(valor)) return false;
  const n = Number(valor);
  return n >= 1900 && n <= new Date().getFullYear() + 1;
}
