import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { CATEGORIAS_SERVICO } from "../constantes/CATEGORIAS_SERVICO.jsx";
import { limparDecimal } from "../../../compartilhado/utilitarios/limparDecimal.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaServico({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [categoria, setCategoria] = useState(initial?.categoria || CATEGORIAS_SERVICO[0]);
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [preco, setPreco] = useState(initial?.preco ?? "");
  const [duracao, setDuracao] = useState(initial?.duracao || "");
  const pode = nome.trim();
  return (
    <Janela title={initial ? "Editar Serviço" : "Novo Serviço"} onClose={onClose} width="480px">
      <Campo label="Nome do serviço"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Troca de óleo" /></Campo>
      <Campo label="Categoria">
        <select className="wf-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS_SERVICO.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Campo>
      <Campo label="Descrição"><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que está incluso neste serviço" /></Campo>
      <div className="wf-grid2">
        <Campo label="Preço estimado (R$)"><input className="wf-mono" value={preco} onChange={(e) => setPreco(limparDecimal(e.target.value))} placeholder="0,00" /></Campo>
        <Campo label="Duração estimada"><input value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="Ex: 1h30" /></Campo>
      </div>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: initial?.id || gerarId("s"), nome, categoria, descricao, preco: Number(preco) || 0, duracao })}>
          {initial ? "Salvar alterações" : "Salvar serviço"}
        </button>
      </div>
    </Janela>
  );
}
