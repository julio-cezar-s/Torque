export function Badge({ children, accent }) { return <span className={`wf-badge ${accent ? "wf-badge--accent" : ""}`}>{children}</span>; }
