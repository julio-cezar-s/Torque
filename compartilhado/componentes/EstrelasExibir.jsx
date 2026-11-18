import { Star } from "lucide-react";

export function EstrelasExibir({ nota, size = 14 }) {
  return (
    <span className="wf-estrelas-exibir">
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} fill={n <= nota ? "currentColor" : "none"} />)}
    </span>
  );
}
