// Telefone brasileiro com DDD: celular (11 dígitos, começa com 9) ou fixo (10 dígitos).
export function telefoneValido(telefone) {
  const d = String(telefone || "").replace(/\D/g, "");
  if (d.length !== 10 && d.length !== 11) return false;
  if (/^(\d)\1+$/.test(d)) return false;        // 00000000000, 11111111111...
  if (!/^[1-9][1-9]/.test(d)) return false;     // DDD de 11 a 99
  return d.length === 11 ? d[2] === "9" : /[2-5]/.test(d[2]);
}
