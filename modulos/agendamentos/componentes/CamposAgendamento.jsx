import { useState, useEffect, useRef } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { dataNaoPassada } from "../../../compartilhado/validacao/dataNaoPassada.jsx";
import { errosDoVeiculo } from "../../../compartilhado/validacao/errosDoVeiculo.jsx";
import { formatarPlaca } from "../../../compartilhado/validacao/formatarPlaca.jsx";
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

  const [tentou, setTentou] = useState(false);
  const usandoNovoVeiculo = !(veiculoMode === "existing" && veiculosDoCliente.length > 0);
  const errosVeiculoNovo = errosDoVeiculo(novoVeiculo);
  const erros = {
    cliente: efetivoClienteId ? "" : "Selecione o cliente.",
    veiculo: allowNovoVeiculo ? (usandoNovoVeiculo || veiculoId ? "" : "Escolha o veículo.") : (veiculoId ? "" : "Cadastre um veículo antes de agendar."),
    placa: usandoNovoVeiculo && allowNovoVeiculo ? errosVeiculoNovo.placa : "",
    ano: usandoNovoVeiculo && allowNovoVeiculo ? errosVeiculoNovo.ano : "",
    servico: servicoId ? "" : "Escolha o serviço.",
    data: !data ? "Informe a data." : (!initial && !dataNaoPassada(data) ? "A data não pode ser no passado." : ""),
    hora: hora ? "" : "Informe o horário.",
  };
  const mostrar = (campo) => (tentou ? erros[campo] : "");
  const hojeTexto = new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD no fuso do navegador

  const handleSubmit = () => {
    setTentou(true);
    if (Object.values(erros).some(Boolean)) return;
    onSubmit({ clienteId: efetivoClienteId, veiculoMode, veiculoId, novoVeiculo, servicoId, data, hora, observacoes, status });
  };

  return (
    <>
      {!fixedClienteId && clientes && (
        <Campo label="Cliente" erro={mostrar("cliente")}>
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
          <Campo label="Placa" erro={mostrar("placa")}><input value={novoVeiculo.placa} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: formatarPlaca(e.target.value) })} placeholder="ABC1D23" maxLength={7} /></Campo>
          <Campo label="Marca"><input value={novoVeiculo.marca} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, marca: e.target.value })} /></Campo>
          <Campo label="Modelo"><input value={novoVeiculo.modelo} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })} /></Campo>
          <Campo label="Ano" erro={mostrar("ano")}><input inputMode="numeric" value={novoVeiculo.ano} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano: e.target.value.replace(/\D/g, "").slice(0, 4) })} maxLength={4} /></Campo>
          <Campo label="Cor"><input value={novoVeiculo.cor} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })} /></Campo>
        </div>
      ) : (
        <p className="wf-empty-note">Nenhum veículo disponível. Cadastre um veículo antes de agendar.</p>
      )}

      {mostrar("veiculo") && <p className="wf-error">{erros.veiculo}</p>}

      <Campo label="Serviço desejado" erro={mostrar("servico")}>
        <select className="wf-select" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
          {(!servicos || servicos.length === 0) && <option value="">Nenhum serviço disponível</option>}
          {servicos && servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </Campo>
      <div className="wf-grid2">
        <Campo label="Data" erro={mostrar("data")}><input type="date" value={data} min={initial ? undefined : hojeTexto} onChange={(e) => setData(e.target.value)} /></Campo>
        <Campo label="Horário" erro={mostrar("hora")}><input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></Campo>
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
        <button className="wf-btn wf-btn--accent" onClick={handleSubmit}>{submitLabel}</button>
      </div>
    </>
  );
}
