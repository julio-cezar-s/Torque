import { normalizarTexto } from "./normalizarTexto.jsx";

// Verdadeiro quando TODAS as palavras digitadas aparecem no texto, em qualquer ordem e sem diferenciar acentos.
// Ex.: "maria fit" encontra "Maria Souza · Honda Fit".
export function correspondeBusca(texto, busca) {
  const palavras = normalizarTexto(busca).split(/\s+/).filter(Boolean);
  if (palavras.length === 0) return true;
  const alvo = normalizarTexto(texto);
  return palavras.every((p) => alvo.includes(p));
}
