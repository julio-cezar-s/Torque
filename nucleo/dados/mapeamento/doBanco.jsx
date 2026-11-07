import { COLUNAS_SO_BANCO } from "./COLUNAS_SO_BANCO.jsx";
import { paraCamel } from "./paraCamel.jsx";

export const doBanco = (row) => Object.fromEntries(
  Object.entries(row).map(([k, v]) => [paraCamel(k), v]).filter(([k]) => !COLUNAS_SO_BANCO.includes(k))
);
