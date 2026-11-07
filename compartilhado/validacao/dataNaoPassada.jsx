// true se a data (AAAA-MM-DD) é hoje ou futura.
export function dataNaoPassada(data) {
  const hoje = new Date();
  const hojeTexto = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, "0")}-${String(hoje.getDate()).padStart(2, "0")}`;
  return Boolean(data) && data >= hojeTexto;
}
