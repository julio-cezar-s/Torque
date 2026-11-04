export function Field({ label, children }) {
  return <label className="wf-field"><span>{label}</span>{children}</label>;
}
