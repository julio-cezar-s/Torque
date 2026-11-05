export const limparDecimal = (v) => {
  const limpo = v.replace(/[^0-9.]/g, "");
  const primeiroPonto = limpo.indexOf(".");
  if (primeiroPonto === -1) return limpo;
  return limpo.slice(0, primeiroPonto + 1) + limpo.slice(primeiroPonto + 1).replace(/\./g, "");
};
