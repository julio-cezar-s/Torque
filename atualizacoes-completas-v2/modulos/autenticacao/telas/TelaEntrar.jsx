import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { emailValido } from "../../../compartilhado/validacao/emailValido.jsx";
import { entrar } from "../integracao/entrar.jsx";

export function TelaEntrar({ setPage, onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const aoClicarEntrar = async () => {
    setErro("");
    if (!email.trim() || !senha) { setErro("Informe e-mail e senha."); return; }
    if (!emailValido(email)) { setErro("Informe um e-mail válido, como nome@email.com."); return; }
    setCarregando(true);
    try {
      const sessao = await entrar(email.trim(), senha);
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
        <Campo label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Campo>
        <Campo label="Senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && aoClicarEntrar()} /></Campo>
        {erro && <p className="wf-error">{erro}</p>}
        <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={aoClicarEntrar} disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</button>
        <p className="wf-authcard__switch"><button onClick={() => setPage("esqueci-senha")}>Esqueci minha senha</button></p>
        <p className="wf-authcard__switch">Não tem conta? <button onClick={() => setPage("cadastro")}>Cadastre-se</button></p>
      </div>
    </div>
  );
}
