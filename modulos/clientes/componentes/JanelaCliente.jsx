import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaCliente({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [telefone, setTelefone] = useState(initial?.telefone || "");
  const [email, setEmail] = useState(initial?.email || "");
  return (
    <Janela title={initial ? "Editar Cliente" : "Novo Cliente"} onClose={onClose} width="420px">
      <Campo label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" autoFocus /></Campo>
      <div className="wf-grid2">
        <Campo label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 90000-0000" /></Campo>
        <Campo label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" /></Campo>
      </div>
      <p className="wf-muted" style={{ fontSize: 13 }}>Para acessar o portal, o cliente cria a própria senha em “Cadastre-se” usando este mesmo e-mail — o cadastro dele é vinculado automaticamente.</p>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!nome.trim()} onClick={() => onSave({ id: initial?.id || gerarId("c"), nome: nome.trim(), telefone, email: email.trim() })}>
          {initial ? "Salvar alterações" : "Salvar cliente"}
        </button>
      </div>
    </Janela>
  );
}
