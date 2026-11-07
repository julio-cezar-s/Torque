import { useState } from "react";
import { Plus } from "lucide-react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { Placa } from "../../../compartilhado/componentes/Placa.jsx";
import { LinhaItem } from "./LinhaItem.jsx";
import { MECANICOS } from "../constantes/MECANICOS.jsx";
import { STATUS } from "../constantes/STATUS.jsx";
import { ORDEM_STATUS } from "../constantes/ORDEM_STATUS.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaEditarOS({ ordem, cliente, veiculo, estoque, onClose, onSave }) {
  const [descricao, setDescricao] = useState(ordem.descricao);
  const [mecanico, setMecanico] = useState(ordem.mecanico);
  const [previsao, setPrevisao] = useState(ordem.previsao);
  const [status, setStatus] = useState(ordem.status);
  const [itens, setItens] = useState(ordem.itens.length ? ordem.itens : [{ id: gerarId("i"), tipo: "avulso", descricao: "", valor: "" }]);

  const addItem = () => setItens((p) => [...p, { id: gerarId("i"), tipo: "avulso", descricao: "", valor: "" }]);
  const removeItem = (id) => setItens((p) => p.filter((i) => i.id !== id));
  const updateItem = (id, novo) => setItens((p) => p.map((i) => (i.id === id ? novo : i)));
  const itemSubtotal = (i) => (i.tipo === "peca" ? (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0) : (Number(i.valor) || 0));
  const total = itens.reduce((s, i) => s + itemSubtotal(i), 0);

  const salvar = () => onSave({
    ...ordem, descricao, mecanico, previsao, status,
    itens: itens.filter((i) => (i.tipo === "peca" ? !!i.pecaId : i.descricao.trim())).map((i) => ({ ...i, valor: itemSubtotal(i) })),
  });

  return (
    <Janela title={`Editar ${ordem.numero}`} onClose={onClose} width="600px">
      <div className="wf-ticket__cliente" style={{ marginBottom: 4 }}>{cliente?.nome || "Cliente removido"}</div>
      <div className="wf-ticket__veiculo" style={{ marginBottom: 16 }}>
        <Placa>{veiculo?.placa || "—"}</Placa><span>{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : ""}</span>
      </div>
      <Campo label="Descrição"><textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Campo>
      <div className="wf-grid2">
        <Campo label="Mecânico"><select className="wf-select" value={mecanico} onChange={(e) => setMecanico(e.target.value)}>{MECANICOS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Campo>
        <Campo label="Previsão"><input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} /></Campo>
      </div>
      <Campo label="Status"><select className="wf-select" value={status} onChange={(e) => setStatus(e.target.value)}>{ORDEM_STATUS.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</select></Campo>
      <div className="wf-form-section__head"><span>Itens / peças / mão de obra</span></div>
      <div className="wf-itens">
        {itens.map((item) => (
          <LinhaItem key={item.id} item={item} estoque={estoque} onChange={(novo) => updateItem(item.id, novo)} onRemove={() => removeItem(item.id)} />
        ))}
      </div>
      <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={addItem}><Plus size={14} /> Adicionar item</button>
      <div className="wf-modal__foot">
        <span className="wf-mono wf-modal__total">Total: {formatarReais(total)}</span>
        <button className="wf-btn wf-btn--accent" onClick={salvar}>Salvar alterações</button>
      </div>
    </Janela>
  );
}
