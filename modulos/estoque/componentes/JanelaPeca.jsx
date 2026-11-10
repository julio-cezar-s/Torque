import { useRef, useState } from "react";
import { enviarImagemPeca, TAMANHO_MAXIMO_MB } from "../integracao/enviarImagemPeca.jsx";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { limparDecimal } from "../../../compartilhado/utilitarios/limparDecimal.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaPeca({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [codigo, setCodigo] = useState(initial?.codigo || "");
  const [quantidade, setQuantidade] = useState(initial ? String(initial.quantidade) : "");
  const [quantidadeMinima, setQuantidadeMinima] = useState(initial ? String(initial.quantidadeMinima) : "");
  const [preco, setPreco] = useState(initial ? String(initial.preco) : "");
  const [imagem, setImagem] = useState(initial?.imagem || "");
  const [enviando, setEnviando] = useState(false);
  const [erroImagem, setErroImagem] = useState("");
  const inputArquivo = useRef(null);
  const pode = nome.trim() && codigo.trim() && !enviando;

  const escolherArquivo = async (e) => {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    setErroImagem(""); setEnviando(true);
    try { setImagem(await enviarImagemPeca(arquivo)); }
    catch (err) { setErroImagem(err.message); }
    finally { setEnviando(false); }
  };
  return (
    <Janela title={initial ? "Editar Peça" : "Nova Peça no Estoque"} onClose={onClose} width="440px">
      <Campo label="Nome da peça"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Filtro de ar" /></Campo>
      <div className="wf-grid2">
        <Campo label="Código"><input className="wf-mono" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="FA-STD" /></Campo>
        <Campo label="Preço unitário (R$)"><input className="wf-mono" inputMode="decimal" value={preco} onChange={(e) => setPreco(limparDecimal(e.target.value))} placeholder="0,00" /></Campo>
        <Campo label="Quantidade em estoque"><input className="wf-mono" inputMode="numeric" value={quantidade} onChange={(e) => setQuantidade(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Campo>
        <Campo label="Quantidade mínima"><input className="wf-mono" inputMode="numeric" value={quantidadeMinima} onChange={(e) => setQuantidadeMinima(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Campo>
      </div>
      <Campo label="Foto da peça (opcional)">
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input ref={inputArquivo} type="file" accept="image/jpeg,image/png,image/webp" onChange={escolherArquivo} style={{ display: "none" }} />
          <button type="button" className="wf-btn wf-btn--ghost wf-btn--sm" disabled={enviando} onClick={() => inputArquivo.current?.click()}>
            {enviando ? "Enviando..." : imagem ? "Trocar imagem" : "Enviar imagem"}
          </button>
          {imagem && !enviando && <button type="button" className="wf-link" onClick={() => setImagem("")}>Remover</button>}
          <span className="wf-muted" style={{ fontSize: 12 }}>JPG, PNG ou WEBP · até {TAMANHO_MAXIMO_MB} MB</span>
        </div>
        {erroImagem && <p className="wf-error" style={{ marginTop: 6 }}>{erroImagem}</p>}
      </Campo>
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
            id: initial?.id || gerarId("p"), nome, codigo,
            quantidade: Number(quantidade) || 0,
            quantidadeMinima: Number(quantidadeMinima) || 0,
            preco: Number(preco) || 0,
            imagem: imagem.trim(),
          })}
        >
          {initial ? "Salvar alterações" : "Salvar peça"}
        </button>
      </div>
    </Janela>
  );
}
