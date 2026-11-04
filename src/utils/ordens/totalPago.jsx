export function totalPago(ordemId, pagamentos) { return pagamentos.filter((p) => p.ordemId === ordemId).reduce((s, p) => s + Number(p.valor || 0), 0); }
