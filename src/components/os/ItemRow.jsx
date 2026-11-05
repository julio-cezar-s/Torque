import { Trash2, AlertTriangle } from "lucide-react";
import { fmtBRL } from "../../utils/formato/fmtBRL.jsx";
import { sanitizeDecimal } from "../../utils/formato/sanitizeDecimal.jsx";

export function ItemRow({ item, estoque, onChange, onRemove }) {
  const isPeca = item.tipo === "peca";
  const peca = isPeca ? estoque.find((p) => p.id === item.pecaId) : null;
  const subtotal = isPeca ? (Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0) : (Number(item.valor) || 0);

  const handleTipo = (novoTipo) => {
    if (novoTipo === "peca") {
      const primeira = estoque[0];
      onChange({ ...item, tipo: "peca", pecaId: primeira?.id || "", descricao: primeira?.nome || "", quantidade: 1, valorUnitario: primeira?.preco || 0, valor: primeira?.preco || 0 });
    } else {
      onChange({ ...item, tipo: "avulso", pecaId: undefined, descricao: "", quantidade: undefined, valorUnitario: undefined, valor: 0 });
    }
  };
  const handlePecaChange = (pecaId) => {
    const p = estoque.find((x) => x.id === pecaId);
    const qtd = Number(item.quantidade) || 1;
    onChange({ ...item, pecaId, descricao: p?.nome || "", valorUnitario: p?.preco || 0, valor: (p?.preco || 0) * qtd });
  };
  const handleQtdChange = (valorDigitado) => {
    const q = Number(valorDigitado.replace(/\D/g, "")) || 0;
    onChange({ ...item, quantidade: q, valor: q * (Number(item.valorUnitario) || 0) });
  };

  return (
    <div className="wf-item-row-block">
      <div className="wf-item-row-block__tipo">
        <button type="button" className={!isPeca ? "active" : ""} onClick={() => handleTipo("avulso")}>Item avulso</button>
        <button type="button" className={isPeca ? "active" : ""} onClick={() => handleTipo("peca")}>Peça do estoque</button>
      </div>
      {isPeca ? (
        <div className="wf-item-row">
          <select className="wf-select" value={item.pecaId || ""} onChange={(e) => handlePecaChange(e.target.value)}>
            {estoque.length === 0 && <option value="">Nenhuma peça cadastrada</option>}
            {estoque.map((p) => <option key={p.id} value={p.id}>{p.codigo} · {p.nome} ({p.quantidade} disp.)</option>)}
          </select>
          <input className="wf-mono wf-item-row__qtd" inputMode="numeric" value={item.quantidade ?? ""} onChange={(e) => handleQtdChange(e.target.value)} placeholder="Qtd" title="Quantidade" />
          <span className="wf-mono wf-item-row__subtotal">{fmtBRL(subtotal)}</span>
          <button className="wf-iconbtn wf-iconbtn--danger" onClick={onRemove}><Trash2 size={14} /></button>
        </div>
      ) : (
        <div className="wf-item-row">
          <input placeholder="Descrição do item / mão de obra" value={item.descricao || ""} onChange={(e) => onChange({ ...item, descricao: e.target.value })} />
          <input className="wf-mono" placeholder="R$ 0,00" inputMode="decimal" value={item.valor} onChange={(e) => onChange({ ...item, valor: sanitizeDecimal(e.target.value) })} />
          <button className="wf-iconbtn wf-iconbtn--danger" onClick={onRemove}><Trash2 size={14} /></button>
        </div>
      )}
      {isPeca && peca && Number(item.quantidade) > peca.quantidade && (
        <p className="wf-warn-note"><AlertTriangle size={12} /> Quantidade acima do disponível em estoque ({peca.quantidade} un.)</p>
      )}
    </div>
  );
}
