import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { LinhaItem } from "./LinhaItem.jsx";
import { MECANICOS } from "../constantes/MECANICOS.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaNovaOS({ clientes, veiculos, estoque, onClose, onCreate, nextNumero }) {
  const [clienteMode, setClienteMode] = useState("existing");
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "", email: "" });
  const [veiculoMode, setVeiculoMode] = useState("existing");
  const [veiculoId, setVeiculoId] = useState("");
  const [novoVeiculo, setNovoVeiculo] = useState({ placa: "", marca: "", modelo: "", ano: "", cor: "" });
  const [descricao, setDescricao] = useState("");
  const [mecanico, setMecanico] = useState(MECANICOS[MECANICOS.length - 1]);
  const [previsao, setPrevisao] = useState("");
  const [itens, setItens] = useState([{ id: gerarId("i"), tipo: "avulso", descricao: "", valor: "" }]);

  const veiculosDoCliente = clienteMode === "existing" ? veiculos.filter((v) => v.clienteId === clienteId) : [];

  useEffect(() => {
    if (clienteMode === "existing") {
      const list = veiculos.filter((v) => v.clienteId === clienteId);
      if (list.length) { setVeiculoMode("existing"); setVeiculoId(list[0].id); }
      else { setVeiculoMode("new"); setVeiculoId(""); }
    } else { setVeiculoMode("new"); setVeiculoId(""); }
    // eslint-disable-next-line
  }, [clienteId, clienteMode]);

  const addItem = () => setItens((prev) => [...prev, { id: gerarId("i"), tipo: "avulso", descricao: "", valor: "" }]);
  const removeItem = (id) => setItens((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id, novo) => setItens((prev) => prev.map((i) => (i.id === id ? novo : i)));
  const itemSubtotal = (i) => (i.tipo === "peca" ? (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0) : (Number(i.valor) || 0));
  const total = itens.reduce((s, i) => s + itemSubtotal(i), 0);

  const podeSalvar =
    (clienteMode === "existing" ? !!clienteId : novoCliente.nome.trim()) &&
    (veiculoMode === "existing" ? !!veiculoId : novoVeiculo.placa.trim());

  const handleSalvar = () => {
    if (!podeSalvar) return;
    onCreate({
      clienteMode, clienteId, novoCliente, veiculoMode, veiculoId, novoVeiculo,
      descricao, mecanico, previsao,
      itens: itens.filter((i) => (i.tipo === "peca" ? !!i.pecaId : i.descricao.trim())).map((i) => ({ ...i, valor: itemSubtotal(i) })),
    });
  };

  return (
    <Janela title={`Nova Ordem de Serviço · ${nextNumero}`} onClose={onClose} width="640px">
      <div className="wf-form-section">
        <div className="wf-form-section__head">
          <span>Cliente</span>
          <div className="wf-toggle">
            <button className={clienteMode === "existing" ? "active" : ""} onClick={() => setClienteMode("existing")}>Existente</button>
            <button className={clienteMode === "new" ? "active" : ""} onClick={() => setClienteMode("new")}>Novo</button>
          </div>
        </div>
        {clienteMode === "existing" ? (
          <select className="wf-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        ) : (
          <div className="wf-grid2">
            <Campo label="Nome"><input value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} placeholder="Nome completo" /></Campo>
            <Campo label="Telefone"><input value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} placeholder="(11) 90000-0000" /></Campo>
          </div>
        )}
      </div>

      <div className="wf-form-section">
        <div className="wf-form-section__head">
          <span>Veículo</span>
          {veiculosDoCliente.length > 0 && (
            <div className="wf-toggle">
              <button className={veiculoMode === "existing" ? "active" : ""} onClick={() => setVeiculoMode("existing")}>Existente</button>
              <button className={veiculoMode === "new" ? "active" : ""} onClick={() => setVeiculoMode("new")}>Novo</button>
            </div>
          )}
        </div>
        {veiculoMode === "existing" && veiculosDoCliente.length > 0 ? (
          <select className="wf-select" value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
            {veiculosDoCliente.map((v) => <option key={v.id} value={v.id}>{v.placa} · {v.marca} {v.modelo}</option>)}
          </select>
        ) : (
          <div className="wf-grid3">
            <Campo label="Placa"><input value={novoVeiculo.placa} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })} placeholder="ABC1D23" /></Campo>
            <Campo label="Marca"><input value={novoVeiculo.marca} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, marca: e.target.value })} placeholder="Fiat" /></Campo>
            <Campo label="Modelo"><input value={novoVeiculo.modelo} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })} placeholder="Argo" /></Campo>
            <Campo label="Ano"><input value={novoVeiculo.ano} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano: e.target.value })} placeholder="2021" /></Campo>
            <Campo label="Cor"><input value={novoVeiculo.cor} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })} placeholder="Branco" /></Campo>
          </div>
        )}
      </div>

      <div className="wf-form-section">
        <div className="wf-form-section__head"><span>Detalhes do serviço</span></div>
        <Campo label="Problema relatado / descrição">
          <textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: barulho ao frear, revisão programada..." />
        </Campo>
        <div className="wf-grid2">
          <Campo label="Mecânico responsável">
            <select className="wf-select" value={mecanico} onChange={(e) => setMecanico(e.target.value)}>
              {MECANICOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Campo>
          <Campo label="Previsão de entrega"><input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} /></Campo>
        </div>
      </div>

      <div className="wf-form-section">
        <div className="wf-form-section__head"><span>Itens / peças / mão de obra</span></div>
        <div className="wf-itens">
          {itens.map((item) => (
            <LinhaItem key={item.id} item={item} estoque={estoque} onChange={(novo) => updateItem(item.id, novo)} onRemove={() => removeItem(item.id)} />
          ))}
        </div>
        <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={addItem}><Plus size={14} /> Adicionar item</button>
      </div>

      <div className="wf-modal__foot">
        <span className="wf-mono wf-modal__total">Total: {formatarReais(total)}</span>
        <button className="wf-btn wf-btn--accent" disabled={!podeSalvar} onClick={handleSalvar}>Criar Ordem de Serviço</button>
      </div>
    </Janela>
  );
}
