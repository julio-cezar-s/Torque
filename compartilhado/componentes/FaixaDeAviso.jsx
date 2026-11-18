import { AlertTriangle, X } from "lucide-react";

// Faixa fixa no topo para avisar de falhas (ex.: sem conexão ao salvar).
export function FaixaDeAviso({ mensagem, onFechar }) {
  if (!mensagem) return null;
  return (
    <div className="wf-faixa-aviso" role="alert">
      <AlertTriangle size={18} />
      <span>{mensagem}</span>
      <button onClick={onFechar} aria-label="Fechar aviso"><X size={16} /></button>
    </div>
  );
}
