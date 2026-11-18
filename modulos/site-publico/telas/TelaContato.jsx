import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { emailValido } from "../../../compartilhado/validacao/emailValido.jsx";
import { formatarTelefone } from "../../../compartilhado/validacao/formatarTelefone.jsx";
import { nomeValido } from "../../../compartilhado/validacao/nomeValido.jsx";
import { telefoneValido } from "../../../compartilhado/validacao/telefoneValido.jsx";
import { DADOS_OFICINA } from "../constantes/DADOS_OFICINA.jsx";
import { enviarMensagemContato } from "../integracao/enviarMensagemContato.jsx";
import { traduzirErroAutenticacao } from "../../autenticacao/integracao/traduzirErroAutenticacao.jsx";

export function TelaContato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [tentou, setTentou] = useState(false);
  const erros = {
    nome: nomeValido(nome) ? "" : "Informe seu nome.",
    email: emailValido(email) ? "" : "Informe um e-mail válido, como nome@email.com.",
    telefone: !telefone || telefoneValido(telefone) ? "" : "Telefone inválido. Use DDD + número, ex.: (69) 99999-9999.",
    mensagem: mensagem.trim().length >= 10 ? "" : "Escreva uma mensagem com pelo menos 10 caracteres.",
  };
  const mostrar = (campo) => (tentou ? erros[campo] : "");

  const enviar = async () => {
    setTentou(true);
    if (Object.values(erros).some(Boolean)) return;
    setErro(""); setEnviando(true);
    try {
      await enviarMensagemContato({ nome: nome.trim(), email: email.trim(), telefone, assunto: assunto.trim(), mensagem: mensagem.trim() });
      setEnviado(true); setTentou(false); setNome(""); setEmail(""); setTelefone(""); setAssunto(""); setMensagem("");
    } catch (err) {
      setErro(traduzirErroAutenticacao(err, err.message || "Não foi possível enviar sua mensagem. Tente novamente."));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="wf-section">
      <p className="wf-eyebrow">Fale conosco</p>
      <h1 className="wf-page-title">Contato</h1>
      <div className="wf-contato-grid">
        <div className="wf-panel">
          {enviado && <p className="wf-success">Mensagem enviada! Retornaremos em breve.</p>}
          {erro && <p className="wf-error">{erro}</p>}
          <Campo label="Nome" erro={mostrar("nome")}><input value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
          <div className="wf-grid2">
            <Campo label="E-mail" erro={mostrar("email")}><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Campo>
            <Campo label="Telefone (opcional)" erro={mostrar("telefone")}><input type="tel" inputMode="tel" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value, telefone))} placeholder="(69) 99999-9999" /></Campo>
          </div>
          <Campo label="Assunto"><input value={assunto} onChange={(e) => setAssunto(e.target.value)} /></Campo>
          <Campo label="Mensagem" erro={mostrar("mensagem")}><textarea rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} /></Campo>
          <button className="wf-btn wf-btn--accent" disabled={enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar mensagem"}</button>
        </div>
        <div className="wf-panel">
          <h4 style={{ marginTop: 0 }}>Outros canais</h4>
          <p className="wf-contact"><MapPin size={14} /> {DADOS_OFICINA.endereco}</p>
          <p className="wf-contact"><Phone size={14} /> {DADOS_OFICINA.telefone}</p>
          <p className="wf-contact"><Mail size={14} /> {DADOS_OFICINA.email}</p>
          <p className="wf-contact"><Clock size={14} /> {DADOS_OFICINA.horario}</p>
        </div>
      </div>
    </div>
  );
}
