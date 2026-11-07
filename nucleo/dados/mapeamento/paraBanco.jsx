import { paraSnake } from "./paraSnake.jsx";

// Só converte as chaves do primeiro nível: o conteúdo de colunas jsonb
// (itens da OS, mensagens do chat) continua exatamente como o app espera.
export const paraBanco = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [paraSnake(k), v]));
