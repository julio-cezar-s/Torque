// Aceita e-mails como nome@dominio.com ou nome.sobrenome@empresa.com.br
const PADRAO = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

export function emailValido(email) {
  const valor = String(email || "").trim();
  return valor.length <= 254 && PADRAO.test(valor) && !valor.includes("..");
}
