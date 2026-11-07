import { Settings } from "lucide-react";

// Aparece quando o arquivo .env não foi criado/preenchido.
export function TelaSemConfiguracao() {
  return (
    <div className="wf-root wf-root--loading">
      <div className="wf-config-aviso">
        <Settings size={28} />
        <h1>Falta conectar o sistema ao Supabase</h1>
        <ol>
          <li>Na pasta do projeto, copie o arquivo <code>.env.example</code> e renomeie a cópia para <code>.env</code>.</li>
          <li>Abra o <code>.env</code> e preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> com os dados do projeto no Supabase.</li>
          <li>Pare o servidor (Ctrl + C) e rode <code>npm run dev</code> de novo.</li>
        </ol>
        <p>O passo a passo completo está no <strong>README.md</strong>.</p>
      </div>
    </div>
  );
}
