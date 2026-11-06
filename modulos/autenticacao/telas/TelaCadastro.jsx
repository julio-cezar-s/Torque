import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { emailValido } from "../../../compartilhado/validacao/emailValido.jsx";
import { formatarTelefone } from "../../../compartilhado/validacao/formatarTelefone.jsx";
import { nomeValido } from "../../../compartilhado/validacao/nomeValido.jsx";
import { telefoneValido } from "../../../compartilhado/validacao/telefoneValido.jsx";
import { registrarCliente } from "../integracao/registrarCliente.jsx";

export function TelaCadastro({ setPage, onLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [tentou, setTentou] = useState(false);

  const erros = {
    nome: nomeValido(nome) ? "" : "Informe seu nome completo.",
    email: emailValido(email) ? "" : "Informe um e-mail válido, como nome@email.com.",
    telefone: !telefone || telefoneValido(telefone) ? "" : "Telefone inválido. Use DDD + número, ex.: (69) 99999-9999.",
    senha: senha.length >= 6 ? "" : "A senha precisa ter pelo menos 6 caracteres.",
    confirmarSenha: senha === confirmarSenha ? "" : "As senhas não coincidem.",
  };
  const mostrar = (campo) => (tentou ? erros[campo] : "");

  const cadastrar = async () => {
    setErro(""); setAviso(""); setTentou(true);
    if (Object.values(erros).some(Boolean)) return;
    setCarregando(true);
    try {
      const resultado = await registrarCliente({ nome: nome.trim(), email: email.trim(), telefone, senha });
      if (resultado.precisaConfirmar) {
        setAviso("Conta criada! Enviamos um e-mail de confirmação — confirme-o e depois entre com sua senha.");
      } else {
        await onLogin(resultado.sessao);
      }
    } catch (err) {
      setErro(err.message || "Não foi possível criar sua conta.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Criar conta</h1>
        <p className="wf-muted" style={{ marginBottom: 18 }}>Cadastre-se para agendar serviços e acompanhar seu veículo.</p>
        <Campo label="Nome completo" erro={mostrar("nome")}><input value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
        <Campo label="E-mail" erro={mostrar("email")}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@email.com" /></Campo>
        <Campo label="Telefone (opcional)" erro={mostrar("telefone")}><input type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value, telefone))} placeholder="(69) 99999-9999" /></Campo>
        <div className="wf-grid2">
          <Campo label="Senha" erro={mostrar("senha")}><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></Campo>
          <Campo label="Confirmar senha" erro={mostrar("confirmarSenha")}><input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} /></Campo>
        </div>
        {erro && <p className="wf-error">{erro}</p>}
        {aviso && <p className="wf-success">{aviso}</p>}
        <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={cadastrar} disabled={carregando}>{carregando ? "Criando conta..." : "Criar conta"}</button>
        <p className="wf-authcard__switch">Já tem conta? <button onClick={() => setPage("login")}>Entrar</button></p>
      </div>
    </div>
  );
}
