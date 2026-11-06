// Deixa a placa em maiúsculas, só com letras e números, no máximo 7 caracteres (ABC1D23).
export function formatarPlaca(valor) {
  return String(valor || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
}
