// Fila única de gravações: elas chegam ao banco na mesma ordem em que o usuário as fez.
let fila = Promise.resolve();

export function enfileirarGravacao(tarefa) {
  fila = fila.then(tarefa);
  return fila;
}

// Resolve quando todas as gravações pendentes terminarem.
export function aguardarGravacoes() { return fila; }
