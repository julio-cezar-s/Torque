import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { emailValido } from "../../../compartilhado/validacao/emailValido.jsx";
import { formatarTelefone } from "../../../compartilhado/validacao/formatarTelefone.jsx";
import { nomeValido } from "../../../compartilhado/validacao/nomeValido.jsx";
import { telefoneValido } from "../../../compartilhado/validacao/telefoneValido.jsx";
import { atualizarCredenciais } from "../../autenticacao/integracao/atualizarCredenciais.jsx";
import { traduzirErroAutenticacao } from "../../autenticacao/integracao/traduzirErroAutenticacao.jsx";

export function TelaPerfilCliente({ cliente, setClientes }) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(cliente.telefone || "");
  const [email, setEmail] = useState(cliente.email || "");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  const [aviso, setAviso] = useState("");
  const [tentou, setTentou] = useState(false);
  const erros = {
    nome: nomeValido(nome) ? "" : "Informe seu nome completo.",
    email: emailValido(email) ? "" : "Informe um e-mail válido, como nome@email.com.",
    telefone: !telefone || telefoneValido(telefone) ? "" : "Telefone inválido. Use DDD + número, ex.: (69) 99999-9999.",
    senha: !senha || senha.length >= 6 ? "" : "A senha precisa ter pelo menos 6 caracteres.",
    confirmarSenha: senha === confirmarSenha ? "" : "As senhas não coincidem.",
  };
  const mostrar = (campo) => (tentou ? erros[campo] : "");

  const salvar = async () => {
    setErro(""); setSalvo(false); setAviso("");
    setTentou(true);
    if (Object.values(erros).some(Boolean)) return;
    try {
      const { emailPendente } = await atualizarCredenciais({ email: email.trim(), senha });
      if (emailPendente) setAviso("Enviamos um link de confirmação para o novo e-mail; o login só muda depois de confirmar.");
    } catch (err) {
      setErro(traduzirErroAutenticacao(err, err.message || "Não foi possível salvar seus dados. Tente novamente.")); return;
    }
    setClientes((prev) => prev.map((c) => (c.id === cliente.id ? { ...c, nome: nome.trim(), telefone, email: email.trim() } : c)));
    setSenha(""); setConfirmarSenha(""); setSalvo(true);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Conta</p><h1>Meu Perfil</h1></div></div>
      <div className="wf-panel" style={{ maxWidth: 480 }}>
        <Campo label="Nome completo" erro={mostrar("nome")}><input value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
        <div className="wf-grid2">
          <Campo label="Telefone" erro={mostrar("telefone")}><input type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value, telefone))} placeholder="(69) 99999-9999" /></Campo>
          <Campo label="E-mail" erro={mostrar("email")}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Campo>
        </div>
        <div className="wf-grid2">
          <Campo label="Nova senha" erro={mostrar("senha")}><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Deixe em branco para manter" /></Campo>
          <Campo label="Confirmar nova senha" erro={mostrar("confirmarSenha")}><input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} /></Campo>
        </div>
        {erro && <p className="wf-error">{erro}</p>}
        {salvo && <p className="wf-success">Perfil atualizado com sucesso.</p>}
        {aviso && <p className="wf-muted">{aviso}</p>}
        <button className="wf-btn wf-btn--accent" onClick={salvar}>Salvar alterações</button>
      </div>
    </div>
  );
}
