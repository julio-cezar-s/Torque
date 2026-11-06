import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { emailValido } from "../../../compartilhado/validacao/emailValido.jsx";
import { formatarTelefone } from "../../../compartilhado/validacao/formatarTelefone.jsx";
import { nomeValido } from "../../../compartilhado/validacao/nomeValido.jsx";
import { telefoneValido } from "../../../compartilhado/validacao/telefoneValido.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export function JanelaCliente({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [telefone, setTelefone] = useState(initial?.telefone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [tentou, setTentou] = useState(false);
  const erros = {
    nome: nomeValido(nome) ? "" : "Informe o nome completo do cliente.",
    telefone: !telefone || telefoneValido(telefone) ? "" : "Telefone inválido. Use DDD + número.",
    email: !email.trim() || emailValido(email) ? "" : "E-mail inválido.",
  };
  const mostrar = (campo) => (tentou ? erros[campo] : "");
  const salvar = () => {
    setTentou(true);
    if (Object.values(erros).some(Boolean)) return;
    onSave({ id: initial?.id || gerarId("c"), nome: nome.trim(), telefone, email: email.trim() });
  };
  return (
    <Janela title={initial ? "Editar Cliente" : "Novo Cliente"} onClose={onClose} width="420px">
      <Campo label="Nome completo" erro={mostrar("nome")}><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" autoFocus /></Campo>
      <div className="wf-grid2">
        <Campo label="Telefone" erro={mostrar("telefone")}><input type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value, telefone))} placeholder="(69) 99999-9999" /></Campo>
        <Campo label="E-mail" erro={mostrar("email")}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" /></Campo>
      </div>
      <p className="wf-muted" style={{ fontSize: 13 }}>Para acessar o portal, o cliente cria a própria senha em “Cadastre-se” usando este mesmo e-mail — o cadastro dele é vinculado automaticamente.</p>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" onClick={salvar}>
          {initial ? "Salvar alterações" : "Salvar cliente"}
        </button>
      </div>
    </Janela>
  );
}
