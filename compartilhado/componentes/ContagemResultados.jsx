// "Mostrando 3 de 12" — só aparece quando algum filtro reduz a lista.
export function ContagemResultados({ mostrando, total }) {
  if (mostrando === total) return null;
  return <p className="wf-contagem" aria-live="polite">Mostrando {mostrando} de {total}</p>;
}
