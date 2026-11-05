import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { DADOS_OFICINA } from "../constantes/DADOS_OFICINA.jsx";
import { enviarMensagemContato } from "../integracao/enviarMensagemContato.jsx";

export function TelaContato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const pode = nome.trim() && email.trim() && mensagem.trim();

  const enviar = async () => {
    if (!pode) return;
    setErro(""); setEnviando(true);
    try {
      await enviarMensagemContato({ nome, email, telefone, assunto, mensagem });
      setEnviado(true); setNome(""); setEmail(""); setTelefone(""); setAssunto(""); setMensagem("");
    } catch (err) {
      setErro(err.message || "Não foi possível enviar sua mensagem. Tente novamente.");
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
          <Campo label="Nome"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
          <div className="wf-grid2">
            <Campo label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Campo>
            <Campo label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Campo>
          </div>
          <Campo label="Assunto"><input value={assunto} onChange={(e) => setAssunto(e.target.value)} /></Campo>
          <Campo label="Mensagem"><textarea rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} /></Campo>
          <button className="wf-btn wf-btn--accent" disabled={!pode || enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar mensagem"}</button>
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
