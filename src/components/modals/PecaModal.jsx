import { useState } from "react";
import { Field } from "../common/Field.jsx";
import { Modal } from "../common/Modal.jsx";
import { sanitizeDecimal } from "../../utils/formato/sanitizeDecimal.jsx";
import { uid } from "../../utils/formato/uid.jsx";

export function PecaModal({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [codigo, setCodigo] = useState(initial?.codigo || "");
  const [quantidade, setQuantidade] = useState(initial ? String(initial.quantidade) : "");
  const [quantidadeMinima, setQuantidadeMinima] = useState(initial ? String(initial.quantidadeMinima) : "");
  const [preco, setPreco] = useState(initial ? String(initial.preco) : "");
  const [imagem, setImagem] = useState(initial?.imagem || "");
  const pode = nome.trim() && codigo.trim();
  return (
    <Modal title={initial ? "Editar Peça" : "Nova Peça no Estoque"} onClose={onClose} width="440px">
      <Field label="Nome da peça"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Filtro de ar" /></Field>
      <div className="wf-grid2">
        <Field label="Código"><input className="wf-mono" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="FA-STD" /></Field>
        <Field label="Preço unitário (R$)"><input className="wf-mono" inputMode="decimal" value={preco} onChange={(e) => setPreco(sanitizeDecimal(e.target.value))} placeholder="0,00" /></Field>
        <Field label="Quantidade em estoque"><input className="wf-mono" inputMode="numeric" value={quantidade} onChange={(e) => setQuantidade(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Field>
        <Field label="Quantidade mínima"><input className="wf-mono" inputMode="numeric" value={quantidadeMinima} onChange={(e) => setQuantidadeMinima(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Field>
      </div>
      <Field label="URL da imagem (opcional)">
        <input value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="https://exemplo.com/foto-da-peca.jpg" />
      </Field>
      {imagem && (
        <div className="wf-peca-preview">
          <img src={imagem} alt="Pré-visualização" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      )}
      <div className="wf-modal__foot">
        <button
          className="wf-btn wf-btn--accent"
          disabled={!pode}
          onClick={() => onSave({
            id: initial?.id || uid("p"), nome, codigo,
            quantidade: Number(quantidade) || 0,
            quantidadeMinima: Number(quantidadeMinima) || 0,
            preco: Number(preco) || 0,
            imagem: imagem.trim(),
          })}
        >
          {initial ? "Salvar alterações" : "Salvar peça"}
        </button>
      </div>
    </Modal>
  );
}
