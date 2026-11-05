import { pecaQtyMap } from "./pecaQtyMap.jsx";

export function aplicarDeltaEstoque(setEstoque, itensAntigos, itensNovos) {
  const oldMap = pecaQtyMap(itensAntigos);
  const newMap = pecaQtyMap(itensNovos);
  const ids = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
  if (ids.size === 0) return;
  setEstoque((prev) => prev.map((p) => {
    if (!ids.has(p.id)) return p;
    const delta = (newMap[p.id] || 0) - (oldMap[p.id] || 0); // uso maior agora → desconta do estoque
    return { ...p, quantidade: Math.max(0, p.quantidade - delta) };
  }));
}
