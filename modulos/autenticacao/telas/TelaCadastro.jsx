import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
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

  const cadastrar = async () => {
    setErro(""); setAviso("");
    if (!nome.trim() || !email.trim() || !senha) { setErro("Preencha todos os campos obrigatórios."); return; }
    if (senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (senha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
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
        <Campo label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
        <Campo label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Campo>
        <Campo label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Campo>
        <div className="wf-grid2">
          <Campo label="Senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></Campo>
          <Campo label="Confirmar senha"><input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} /></Campo>
        </div>
        {erro && <p className="wf-error">{erro}</p>}
        {aviso && <p className="wf-success">{aviso}</p>}
        <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={cadastrar} disabled={carregando}>{carregando ? "Criando conta..." : "Criar conta"}</button>
        <p className="wf-authcard__switch">Já tem conta? <button onClick={() => setPage("login")}>Entrar</button></p>
      </div>
    </div>
  );
}
