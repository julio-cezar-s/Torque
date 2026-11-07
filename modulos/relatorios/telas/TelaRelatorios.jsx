import { useState } from "react";
import { Wallet, Hourglass, Receipt, Star } from "lucide-react";
import { CartaoEstatistica } from "../../../compartilhado/componentes/CartaoEstatistica.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";
import { totalOS } from "../../ordens-servico/utilitarios/totalOS.jsx";
import { totalPago } from "../../ordens-servico/utilitarios/totalPago.jsx";
import { PERIODOS } from "../constantes/PERIODOS.jsx";
import { mesesDoPeriodo } from "../utilitarios/mesesDoPeriodo.jsx";
import { faturamentoPorMes } from "../utilitarios/faturamentoPorMes.jsx";
import { servicosMaisAgendados } from "../utilitarios/servicosMaisAgendados.jsx";
import { pecasMaisUsadas } from "../utilitarios/pecasMaisUsadas.jsx";
import { ordensPorSituacao } from "../utilitarios/ordensPorSituacao.jsx";
import { melhoresClientes } from "../utilitarios/melhoresClientes.jsx";
import { CartaoRelatorio } from "../componentes/CartaoRelatorio.jsx";
import { GraficoColunas } from "../componentes/GraficoColunas.jsx";
import { GraficoBarras } from "../componentes/GraficoBarras.jsx";

export function TelaRelatorios({ ordens, pagamentos, agendamentos, servicos, clientes, avaliacoes }) {
  const [periodo, setPeriodo] = useState("6");
  const escolhido = PERIODOS.find((p) => p.chave === periodo);
  const datas = [...pagamentos.map((p) => p.data), ...ordens.map((o) => o.dataEntrada), ...agendamentos.map((a) => a.data)];
  const meses = mesesDoPeriodo(escolhido.meses, datas);

  const porMes = faturamentoPorMes(pagamentos, meses);
  const recebido = porMes.reduce((s, m) => s + m.valor, 0);
  const aReceber = ordens.reduce((s, o) => s + Math.max(totalOS(o) - totalPago(o.id, pagamentos), 0), 0);
  const finalizadas = ordens.filter((o) => ["concluido", "entregue"].includes(o.status) && meses.includes(String(o.dataEntrada).slice(0, 7)));
  const ticketMedio = finalizadas.length ? finalizadas.reduce((s, o) => s + totalOS(o), 0) / finalizadas.length : null;
  const notas = avaliacoes.filter((a) => meses.includes(String(a.data).slice(0, 7)));
  const notaMedia = notas.length ? notas.reduce((s, a) => s + a.nota, 0) / notas.length : null;

  const situacao = ordensPorSituacao(ordens, meses);
  const servicosTop = servicosMaisAgendados(agendamentos, servicos, meses);
  const pecasTop = pecasMaisUsadas(ordens, meses);
  const clientesTop = melhoresClientes(pagamentos, ordens, clientes, meses);
  const inteiro = (v) => String(v);

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Gestão</p><h1>Relatórios</h1></div>
      </div>

      <div className="wf-pills" role="group" aria-label="Período do relatório" style={{ marginBottom: 20 }}>
        {PERIODOS.map((p) => (
          <button key={p.chave} className={`wf-pill ${periodo === p.chave ? "active" : ""}`} onClick={() => setPeriodo(p.chave)}>{p.label}</button>
        ))}
      </div>

      <div className="wf-stats">
        <CartaoEstatistica icon={Wallet} label="Recebido no período" value={formatarReais(recebido)} tone="#3F7D57" />
        <CartaoEstatistica icon={Hourglass} label="A receber (todas as OS)" value={formatarReais(aReceber)} tone="#C4441E" />
        <CartaoEstatistica icon={Receipt} label="Ticket médio por OS" value={ticketMedio === null ? "—" : formatarReais(ticketMedio)} tone="#3C5A6B" />
        <CartaoEstatistica icon={Star} label="Nota média dos clientes" value={notaMedia === null ? "—" : `${notaMedia.toFixed(1).replace(".", ",")} / 5`} tone="#B8860B" />
      </div>

      <div className="wf-relatorios-grade">
        <div className="wf-relatorios-grade__largo">
          <CartaoRelatorio titulo="Faturamento por mês" subtitulo="Pagamentos recebidos em cada mês" linhas={porMes} formatar={formatarReais}>
            <GraficoColunas dados={porMes} />
          </CartaoRelatorio>
        </div>
        <CartaoRelatorio titulo="Ordens por situação" subtitulo="OS abertas no período" linhas={situacao} formatar={inteiro} vazio="Nenhuma ordem de serviço neste período.">
          <GraficoBarras dados={situacao} formatar={inteiro} />
        </CartaoRelatorio>
        <CartaoRelatorio titulo="Serviços mais agendados" subtitulo="Agendamentos não cancelados" linhas={servicosTop} formatar={inteiro} vazio="Nenhum agendamento neste período.">
          <GraficoBarras dados={servicosTop} formatar={inteiro} />
        </CartaoRelatorio>
        <CartaoRelatorio titulo="Clientes que mais pagaram" subtitulo="Total pago no período" linhas={clientesTop} formatar={formatarReais} vazio="Nenhum pagamento neste período.">
          <GraficoBarras dados={clientesTop} formatar={formatarReais} />
        </CartaoRelatorio>
        <CartaoRelatorio titulo="Peças mais usadas" subtitulo="Quantidade nas ordens de serviço" linhas={pecasTop} formatar={inteiro} vazio="Nenhuma peça usada neste período.">
          <GraficoBarras dados={pecasTop} formatar={inteiro} />
        </CartaoRelatorio>
      </div>
    </div>
  );
}
