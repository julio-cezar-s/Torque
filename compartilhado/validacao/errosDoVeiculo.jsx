import { anoValido } from "./anoValido.jsx";
import { placaValida } from "./placaValida.jsx";

// Mensagens de erro dos campos de um veículo (vazio = sem erro). O ano é opcional.
export function errosDoVeiculo({ placa, ano }) {
  return {
    placa: placaValida(placa) ? "" : "Placa inválida. Use o formato ABC1234 ou ABC1D23.",
    ano: !String(ano || "").trim() || anoValido(ano) ? "" : `Ano inválido. Use 4 dígitos, entre 1900 e ${new Date().getFullYear() + 1}.`,
  };
}
