import { valorMaximoArredondado } from "../utilitarios/valorMaximoArredondado.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";

// Colunas verticais (valor por mês). Só o maior valor recebe número fixo; os demais aparecem ao passar o mouse.
export function GraficoColunas({ dados, formatar = formatarReais }) {
  const maximo = valorMaximoArredondado(Math.max(...dados.map((d) => d.valor)));
  const maiorIndice = dados.reduce((m, d, i) => (d.valor > dados[m].valor ? i : m), 0);
  const marcas = [0, 0.5, 1];
  const eixo = (v) => `R$ ${v.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;
  return (
    <div className={`wf-colunas ${dados.length > 12 ? "wf-colunas--enorme" : dados.length > 6 ? "wf-colunas--muitos" : ""}`} role="img" aria-label={`Gráfico de colunas. ${dados.map((d) => `${d.rotulo}: ${formatar(d.valor)}`).join("; ")}`}>
      <div className="wf-colunas__eixo">
        {marcas.map((m) => <span key={m} style={{ bottom: `${m * 100}%` }}>{eixo(maximo * m)}</span>)}
      </div>
      <div className="wf-colunas__area">
        <div className="wf-colunas__camada">
          {marcas.map((m) => <i key={m} className="wf-colunas__grade" style={{ bottom: `${m * 100}%` }} />)}
        </div>
        <div className="wf-colunas__camada wf-colunas__barras">
          {dados.map((d, i) => {
            const altura = (d.valor / maximo) * 100;
            return (
              <div key={d.chave} className="wf-colunas__item" tabIndex={0}>
                {i === maiorIndice && d.valor > 0 && <span className={`wf-colunas__valor ${i === dados.length - 1 ? "wf-colunas__valor--fim" : i === 0 ? "wf-colunas__valor--ini" : ""}`} style={{ bottom: `calc(${altura}% + 4px)` }}>{formatar(d.valor)}</span>}
                <div className="wf-colunas__barra" style={{ height: `${altura}%` }} />
                <span className="wf-colunas__rotulo">{d.rotulo.split("/")[0]}<span className="wf-colunas__ano">/{d.rotulo.split("/")[1]}</span></span>
                <span className="wf-graf__dica" role="tooltip" style={{ bottom: `calc(${altura}% + 6px)` }}><strong>{d.rotulo}</strong>{formatar(d.valor)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
