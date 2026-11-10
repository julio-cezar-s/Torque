// Pelo menos 3 caracteres, só letras (com acento), espaços, apóstrofo, ponto e hífen.
export function nomeValido(nome) {
  return /^\p{L}[\p{L}\s'.-]{2,}$/u.test(String(nome || "").trim());
}
