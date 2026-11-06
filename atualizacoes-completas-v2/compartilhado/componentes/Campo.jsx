// "erro" (opcional): mensagem de validação mostrada logo abaixo do campo.
export function Campo({ label, erro, children }) {
  return (
    <label className="wf-field">
      <span>{label}</span>
      {children}
      {erro && <small className="wf-error" role="alert" style={{ display: "block", marginTop: 4, marginBottom: 0 }}>{erro}</small>}
    </label>
  );
}
