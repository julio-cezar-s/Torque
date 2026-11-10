import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// Tela de espera. Se demorar demais, mostra uma dica em vez de deixar o usuário sem resposta.
export function TelaCarregando({ texto = "Abrindo a oficina..." }) {
  const [demorando, setDemorando] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setDemorando(true), 8000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="wf-root wf-root--loading" role="status" aria-live="polite">
      <Loader2 className="wf-spin" size={28} />
      <p>{texto}</p>
      {demorando && (
        <p className="wf-carregando__dica">
          Está demorando mais que o normal. Confira sua conexão com a internet; se continuar, recarregue a página.
        </p>
      )}
    </div>
  );
}
