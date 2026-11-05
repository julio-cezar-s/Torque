import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Field } from "../../components/common/Field.jsx";
import { OFICINA_INFO } from "../../constants/OFICINA_INFO.jsx";
import { apiEnviarMensagemContato } from "../../services/contato/apiEnviarMensagemContato.jsx";

export function ContatoPage() {
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
      await apiEnviarMensagemContato({ nome, email, telefone, assunto, mensagem });
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
          <Field label="Nome"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
          <div className="wf-grid2">
            <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Field>
          </div>
          <Field label="Assunto"><input value={assunto} onChange={(e) => setAssunto(e.target.value)} /></Field>
          <Field label="Mensagem"><textarea rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} /></Field>
          <button className="wf-btn wf-btn--accent" disabled={!pode || enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar mensagem"}</button>
        </div>
        <div className="wf-panel">
          <h4 style={{ marginTop: 0 }}>Outros canais</h4>
          <p className="wf-contact"><MapPin size={14} /> {OFICINA_INFO.endereco}</p>
          <p className="wf-contact"><Phone size={14} /> {OFICINA_INFO.telefone}</p>
          <p className="wf-contact"><Mail size={14} /> {OFICINA_INFO.email}</p>
          <p className="wf-contact"><Clock size={14} /> {OFICINA_INFO.horario}</p>
        </div>
      </div>
    </div>
  );
}
