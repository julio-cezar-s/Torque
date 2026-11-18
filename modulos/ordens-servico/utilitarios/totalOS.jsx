export function totalOS(ordem) { return ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0); }
