import { AlertTriangle, ChevronRight } from "lucide-react";
import { situacaoEstoque } from "../utilitarios/situacaoEstoque.jsx";

// Faixa de aviso: mostra quantas peças estão esgotadas e quantas estão com estoque baixo.
export function AlertaEstoque({ pecas, onVer }) {
  if (pecas.length === 0) return null;
  const esgotadas = pecas.filter((p) => situacaoEstoque(p) === "esgotado").length;
  const baixas = pecas.length - esgotadas;
  const partes = [];
  if (esgotadas) partes.push(`${esgotadas} ${esgotadas === 1 ? "peça esgotada" : "peças esgotadas"}`);
  if (baixas) partes.push(`${baixas} ${baixas === 1 ? "peça com estoque baixo" : "peças com estoque baixo"}`);
  return (
    <div className="wf-alerta-estoque" role="alert">
      <AlertTriangle size={20} />
      <div className="wf-alerta-estoque__texto">
        <strong>Atenção ao estoque:</strong> {partes.join(" e ")}.
        <span className="wf-alerta-estoque__nomes">{pecas.slice(0, 3).map((p) => p.nome).join(", ")}{pecas.length > 3 ? ` e mais ${pecas.length - 3}` : ""}</span>
      </div>
      {onVer && <button className="wf-link" onClick={onVer}>Ver estoque <ChevronRight size={14} /></button>}
    </div>
  );
}
