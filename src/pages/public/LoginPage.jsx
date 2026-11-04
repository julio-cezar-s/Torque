import { useState } from "react";
import { Field } from "../../components/common/Field.jsx";
import { apiLogin } from "../../services/auth/apiLogin.jsx";

export function LoginPage({ setPage, onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    setErro("");
    if (!email.trim() || !senha) { setErro("Informe e-mail e senha."); return; }
    setCarregando(true);
    try {
      const sessao = await apiLogin(email.trim(), senha);
      await onLogin(sessao);
    } catch (err) {
      setErro(err.message || "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Entrar</h1>
        <p className="wf-muted" style={{ marginBottom: 18 }}>Acesse sua conta ou o painel administrativo.</p>
        <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} /></Field>
        {erro && <p className="wf-error">{erro}</p>}
        <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={entrar} disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</button>
        <p className="wf-authcard__switch">Não tem conta? <button onClick={() => setPage("cadastro")}>Cadastre-se</button></p>
      </div>
    </div>
  );
}
