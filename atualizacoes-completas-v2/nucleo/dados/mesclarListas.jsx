const ordenarChaves = (valor) => {
  if (Array.isArray(valor)) return valor.map(ordenarChaves);
  if (valor && typeof valor === "object") {
    return Object.fromEntries(Object.keys(valor).sort().map((k) => [k, ordenarChaves(valor[k])]));
  }
  return valor;
};
const iguais = (a, b) => JSON.stringify(ordenarChaves(a)) === JSON.stringify(ordenarChaves(b));

// Junta a lista que está na tela com a lista atual do banco:
// mantém a ordem da tela, troca só o que mudou, remove o que sumiu e põe os novos no fim.
// Se nada mudou, devolve a MESMA lista (assim o React não redesenha a tela à toa).
export function mesclarListas(atual, remota) {
  const remotoPorId = new Map(remota.map((x) => [x.id, x]));
  const idsAtuais = new Set(atual.map((x) => x.id));

  const mantidos = atual
    .filter((x) => remotoPorId.has(x.id))
    .map((x) => (iguais(x, remotoPorId.get(x.id)) ? x : remotoPorId.get(x.id)));
  const novos = remota.filter((x) => !idsAtuais.has(x.id));

  const resultado = [...mantidos, ...novos];
  const mudou = resultado.length !== atual.length || resultado.some((x, i) => x !== atual[i]);
  return mudou ? resultado : atual;
}
