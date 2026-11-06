import { formatarPlaca } from "./formatarPlaca.jsx";

// Aceita o padrão antigo (ABC1234) e o Mercosul (ABC1D23).
export function placaValida(placa) {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(formatarPlaca(placa));
}
