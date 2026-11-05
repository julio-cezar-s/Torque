let aoFalhar = () => {};

export function setAoFalhar(fn) { aoFalhar = fn; }

export function notificarFalha(mensagem) { aoFalhar(mensagem); }
