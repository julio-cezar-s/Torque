import { useState } from "react";
import { Field } from "../../components/common/Field.jsx";
import { apiAtualizarCredenciais } from "../../services/auth/apiAtualizarCredenciais.jsx";

export function ClientePerfilView({ cliente, setClientes }) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(cliente.telefone || "");
  const [email, setEmail] = useState(cliente.email || "");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  const [aviso, setAviso] = useState("");

  const salvar = async () => {
    setErro(""); setSalvo(false); setAviso("");
    if (senha && senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (senha && senha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
    try {
      const { emailPendente } = await apiAtualizarCredenciais({ email: email.trim(), senha });
      if (emailPendente) setAviso("Enviamos um link de confirmação para o novo e-mail; o login só muda depois de confirmar.");
    } catch (err) {
      setErro(err.message); return;
    }
    setClientes((prev) => prev.map((c) => (c.id === cliente.id ? { ...c, nome: nome.trim(), telefone, email: email.trim() } : c)));
    setSenha(""); setConfirmarSenha(""); setSalvo(true);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Conta</p><h1>Meu Perfil</h1></div></div>
      <div className="wf-panel" style={{ maxWidth: 480 }}>
        <Field label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
        <div className="wf-grid2">
          <Field label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Field>
          <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        </div>
        <div className="wf-grid2">
          <Field label="Nova senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Deixe em branco para manter" /></Field>
          <Field label="Confirmar nova senha"><input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} /></Field>
        </div>
        {erro && <p className="wf-error">{erro}</p>}
        {salvo && <p className="wf-success">Perfil atualizado com sucesso.</p>}
        {aviso && <p className="wf-muted">{aviso}</p>}
        <button className="wf-btn wf-btn--accent" onClick={salvar}>Salvar alterações</button>
      </div>
    </div>
  );
}
