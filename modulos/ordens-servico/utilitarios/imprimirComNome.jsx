// Abre a janela de impressão (de onde se escolhe "Salvar como PDF") com um título que vira o nome sugerido do arquivo.
export function imprimirComNome(nome) {
  const tituloOriginal = document.title;
  const restaurar = () => { document.title = tituloOriginal; window.removeEventListener("afterprint", restaurar); };
  window.addEventListener("afterprint", restaurar);
  document.title = nome;
  window.print();
}
