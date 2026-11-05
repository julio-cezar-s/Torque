import { useState, useEffect, useRef } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { STATUS_AGENDAMENTO } from "../constantes/STATUS_AGENDAMENTO.jsx";
import { ORDEM_STATUS_AGENDAMENTO } from "../constantes/ORDEM_STATUS_AGENDAMENTO.jsx";

export function CamposAgendamento({ clientes, veiculos, servicos, fixedClienteId, initial, allowNovoVeiculo = true, showStatus = false, submitLabel, onSubmit }) {
  const [clienteId, setClienteId] = useState(fixedClienteId || initial?.clienteId || clientes?.[0]?.id || "");
  const efetivoClienteIdInicial = fixedClienteId || initial?.clienteId || clientes?.[0]?.id || "";
  const veiculosDoClienteInicial = veiculos.filter((v) => v.clienteId === efetivoClienteIdInicial);
  const [veiculoMode, setVeiculoMode] = useState(initial?.veiculoId || veiculosDoClienteInicial.length ? "existing" : (allowNovoVeiculo ? "new" : "existing"));
  const [veiculoId, setVeiculoId] = useState(initial?.veiculoId || veiculosDoClienteInicial[0]?.id || "");
  const [novoVeiculo, setNovoVeiculo] = useState({ placa: "", marca: "", modelo: "", ano: "", cor: "" });
  const [servicoId, setServicoId] = useState(initial?.servicoId || servicos?.[0]?.id || "");
  const [data, setData] = useState(initial?.data || "");
  const [hora, setHora] = useState(initial?.hora || "");
  const [observacoes, setObservacoes] = useState(initial?.observacoes || "");
  const [status, setStatus] = useState(initial?.status || "pendente");

  const efetivoClienteId = fixedClienteId || clienteId;
  const veiculosDoCliente = veiculos.filter((v) => v.clienteId === efetivoClienteId);

  const jaMontou = useRef(false);
  useEffect(() => {
    if (!jaMontou.current) { jaMontou.current = true; return; }
    if (veiculosDoCliente.length) { setVeiculoMode("existing"); setVeiculoId(veiculosDoCliente[0].id); }
    else { setVeiculoMode(allowNovoVeiculo ? "new" : "existing"); setVeiculoId(""); }
    // eslint-disable-next-line
  }, [efetivoClienteId]);

  const podeSalvar = efetivoClienteId && servicoId && data && hora && (veiculoMode === "existing" ? veiculoId : novoVeiculo.placa.trim());

  const handleSubmit = () => {
    if (!podeSalvar) return;
    onSubmit({ clienteId: efetivoClienteId, veiculoMode, veiculoId, novoVeiculo, servicoId, data, hora, observacoes, status });
  };

  return (
    <>
      {!fixedClienteId && clientes && (
        <Campo label="Cliente">
          <select className="wf-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>
      )}

      <div className="wf-form-section__head">
        <span>Veículo</span>
        {allowNovoVeiculo && veiculosDoCliente.length > 0 && (
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
      ) : allowNovoVeiculo ? (
        <div className="wf-grid3">
          <Campo label="Placa"><input value={novoVeiculo.placa} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })} /></Campo>
          <Campo label="Marca"><input value={novoVeiculo.marca} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, marca: e.target.value })} /></Campo>
          <Campo label="Modelo"><input value={novoVeiculo.modelo} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })} /></Campo>
          <Campo label="Ano"><input value={novoVeiculo.ano} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano: e.target.value })} /></Campo>
          <Campo label="Cor"><input value={novoVeiculo.cor} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })} /></Campo>
        </div>
      ) : (
        <p className="wf-empty-note">Nenhum veículo disponível. Cadastre um veículo antes de agendar.</p>
      )}

      <Campo label="Serviço desejado">
        <select className="wf-select" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
          {(!servicos || servicos.length === 0) && <option value="">Nenhum serviço disponível</option>}
          {servicos && servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </Campo>
      <div className="wf-grid2">
        <Campo label="Data"><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Campo>
        <Campo label="Horário"><input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></Campo>
      </div>
      <Campo label="Observações"><textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Detalhes adicionais (opcional)" /></Campo>
      {showStatus && (
        <Campo label="Status">
          <select className="wf-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {ORDEM_STATUS_AGENDAMENTO.map((s) => <option key={s} value={s}>{STATUS_AGENDAMENTO[s].label}</option>)}
          </select>
        </Campo>
      )}
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!podeSalvar} onClick={handleSubmit}>{submitLabel}</button>
      </div>
    </>
  );
}
