import { useState } from "react";
import { Star } from "lucide-react";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { Janela } from "../../../compartilhado/componentes/Janela.jsx";

export function JanelaAvaliar({ ordem, onClose, onSave }) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  return (
    <Janela title={`Avaliar atendimento · ${ordem.numero}`} onClose={onClose} width="420px">
      <Campo label="Sua nota para este atendimento">
        <div className="wf-estrelas-input">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className="wf-estrela-btn" onClick={() => setNota(n)} aria-label={`${n} estrela(s)`}>
              <Star size={26} fill={n <= nota ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </Campo>
      <Campo label="Comentário (opcional)">
        <textarea rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Conte como foi sua experiência..." />
      </Campo>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" onClick={() => onSave({ nota, comentario })}>Enviar avaliação</button>
      </div>
    </Janela>
  );
}
