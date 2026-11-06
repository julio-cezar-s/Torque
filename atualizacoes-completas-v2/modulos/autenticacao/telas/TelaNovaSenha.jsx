import { useState } from "react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { definirNovaSenha } from "../integracao/definirNovaSenha.jsx";

// Aparece quando a pessoa chega pelo link do e-mail de recuperação.
export function TelaNovaSenha({ onConcluir }) {
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salva, setSalva] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const salvar = async () => {
    setErro("");
    if (senha.length < 6) { setErro("A senha precisa ter pelo menos 6 caracteres."); return; }
    if (senha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
    setCarregando(true);
    try {
      await definirNovaSenha(senha);
      setSalva(true);
    } catch (err) {
      setErro(err.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Criar nova senha</h1>
        {salva ? (
          <>
            <p className="wf-success">Senha alterada com sucesso! Entre com a nova senha.</p>
            <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={onConcluir}>Ir para o login</button>
          </>
        ) : (
          <>
            <p className="wf-muted" style={{ marginBottom: 18 }}>Escolha uma nova senha para a sua conta.</p>
            <Campo label="Nova senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></Campo>
            <Campo label="Confirmar nova senha"><input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && salvar()} /></Campo>
            {erro && <p className="wf-error">{erro}</p>}
            <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={salvar} disabled={carregando}>{carregando ? "Salvando..." : "Salvar nova senha"}</button>
            <p className="wf-authcard__switch"><button onClick={onConcluir}>Cancelar</button></p>
          </>
        )}
      </div>
    </div>
  );
}
