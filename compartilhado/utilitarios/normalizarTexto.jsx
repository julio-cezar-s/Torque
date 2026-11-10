// Minúsculas e sem acentos: "João" e "joao" passam a ser iguais na busca.
export const normalizarTexto = (texto) => String(texto ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
