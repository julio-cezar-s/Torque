import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { emailValido } from "../../../compartilhado/validacao/emailValido.jsx";
import { solicitarRecuperacaoSenha } from "../integracao/solicitarRecuperacaoSenha.jsx";
import { traduzirErroAutenticacao } from "../integracao/traduzirErroAutenticacao.jsx";

export function TelaEsqueciSenha({ setPage }) {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const enviar = async () => {
    setErro("");
    if (!email.trim()) { setErro("Informe o e-mail da sua conta."); return; }
    if (!emailValido(email)) { setErro("Informe um e-mail válido, como nome@email.com."); return; }
    setCarregando(true);
    try {
      await solicitarRecuperacaoSenha(email.trim());
      setEnviado(true);
    } catch (err) {
      setErro(traduzirErroAutenticacao(err, err.message || "Não foi possível enviar o e-mail. Tente novamente."));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Esqueci minha senha</h1>
        <p className="wf-muted" style={{ marginBottom: 18 }}>Informe o e-mail da sua conta e enviaremos um link para você criar uma nova senha.</p>
        {enviado ? (
          <p className="wf-success">Se este e-mail tiver uma conta, enviamos o link de recuperação. Confira também a caixa de spam.</p>
        ) : (
          <>
            <Campo label="E-mail"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && enviar()} /></Campo>
            {erro && <p className="wf-error">{erro}</p>}
            <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={enviar} disabled={carregando}>{carregando ? "Enviando..." : "Enviar link de recuperação"}</button>
          </>
        )}
        <p className="wf-authcard__switch"><button onClick={() => setPage("login")}>Voltar para o login</button></p>
      </div>
    </div>
  );
}
