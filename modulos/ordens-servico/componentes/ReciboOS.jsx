import { X, Wrench, Printer } from "lucide-react";
import { Placa } from "../../../compartilhado/componentes/Placa.jsx";
import { Carimbo } from "../../../compartilhado/componentes/Carimbo.jsx";
import { DADOS_OFICINA } from "../../site-publico/constantes/DADOS_OFICINA.jsx";
import { formatarReais } from "../../../compartilhado/utilitarios/formatarReais.jsx";
import { formatarData } from "../../../compartilhado/utilitarios/formatarData.jsx";
import { imprimirComNome } from "../utilitarios/imprimirComNome.jsx";

export function ReciboOS({ ordem, cliente, veiculo, pagamentos, onClose }) {
  const total = ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0);
  const pagamentosDaOS = (pagamentos || []).filter((p) => p.ordemId === ordem.id).sort((a, b) => (a.data < b.data ? -1 : 1));
  const pago = pagamentosDaOS.reduce((s, p) => s + Number(p.valor || 0), 0);
  const saldo = total - pago;
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  const nomeDoArquivo = `${ordem.numero} - ${DADOS_OFICINA.nome}${cliente?.nome ? ` - ${cliente.nome}` : ""}`;

  return (
    <div className="wf-modal-veil wf-recibo-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wf-modal wf-recibo-modal">
        <div className="wf-modal__head wf-recibo-noimprimir">
          <h3>Ordem de Serviço · {ordem.numero}</h3>
          <button className="wf-iconbtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="wf-modal__body">
          <div className="wf-recibo">
            <div className="wf-recibo__cabecalho">
              <div>
                <div className="wf-recibo__marca"><Wrench size={20} /> Torque</div>
                <p>{DADOS_OFICINA.endereco}</p>
                <p>{DADOS_OFICINA.telefone} · {DADOS_OFICINA.email}</p>
              </div>
              <div className="wf-recibo__doc">
                <p className="wf-eyebrow">Ordem de Serviço</p>
                <p className="wf-mono wf-recibo__numero">{ordem.numero}</p>
                <p className="wf-muted">Emitido em {emitidoEm}</p>
              </div>
            </div>

            <div className="wf-recibo__grid">
              <div>
                <span className="wf-recibo__label">Cliente</span>
                <p>{cliente?.nome || "—"}</p>
                {cliente?.telefone && <p className="wf-muted">{cliente.telefone}</p>}
                {cliente?.email && <p className="wf-muted">{cliente.email}</p>}
              </div>
              <div>
                <span className="wf-recibo__label">Veículo</span>
                <p>{veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}` : "—"}</p>
                {veiculo?.placa && <p className="wf-muted"><Placa>{veiculo.placa}</Placa></p>}
              </div>
              <div>
                <span className="wf-recibo__label">Mecânico responsável</span>
                <p>{ordem.mecanico || "—"}</p>
              </div>
              <div>
                <span className="wf-recibo__label">Status</span>
                <p><Carimbo status={ordem.status} size="sm" /></p>
              </div>
              <div>
                <span className="wf-recibo__label">Data de entrada</span>
                <p>{formatarData(ordem.dataEntrada)}</p>
              </div>
              <div>
                <span className="wf-recibo__label">Previsão de entrega</span>
                <p>{formatarData(ordem.previsao)}</p>
              </div>
            </div>

            {ordem.descricao && (
              <div className="wf-recibo__desc">
                <span className="wf-recibo__label">Descrição do serviço</span>
                <p>{ordem.descricao}</p>
              </div>
            )}

            <table className="wf-recibo__tabela">
              <thead><tr><th>Item</th><th>Qtd.</th><th>Valor unit.</th><th>Valor</th></tr></thead>
              <tbody>
                {ordem.itens.length === 0 ? (
                  <tr><td colSpan={4} className="wf-muted">Nenhum item registrado.</td></tr>
                ) : ordem.itens.map((item) => (
                  <tr key={item.id}>
                    <td>{item.descricao}</td>
                    <td className="wf-mono">{item.tipo === "peca" && item.quantidade ? item.quantidade : "—"}</td>
                    <td className="wf-mono">{item.tipo === "peca" && item.valorUnitario ? formatarReais(item.valorUnitario) : "—"}</td>
                    <td className="wf-mono">{formatarReais(item.valor)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td colSpan={3}>Total</td><td className="wf-mono">{formatarReais(total)}</td></tr>
                {pago > 0 && (<>
                  <tr><td colSpan={3}>Pago</td><td className="wf-mono">{formatarReais(pago)}</td></tr>
                  <tr><td colSpan={3}>Saldo {saldo > 0 ? "em aberto" : ""}</td><td className="wf-mono">{formatarReais(Math.max(saldo, 0))}</td></tr>
                </>)}
              </tfoot>
            </table>

            {pagamentosDaOS.length > 0 && (
              <table className="wf-recibo__tabela wf-recibo__pagamentos">
                <thead><tr><th>Pagamento</th><th>Forma</th><th>Valor</th></tr></thead>
                <tbody>
                  {pagamentosDaOS.map((p) => (
                    <tr key={p.id}><td>{formatarData(p.data)}{p.obs ? ` · ${p.obs}` : ""}</td><td>{p.forma}</td><td className="wf-mono">{formatarReais(p.valor)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className="wf-recibo__assinaturas">
              <div><span /><p>Oficina {DADOS_OFICINA.nome}</p></div>
              <div><span /><p>{cliente?.nome || "Cliente"}</p></div>
            </div>

            <p className="wf-recibo__rodape">Obrigado pela confiança. Este comprovante não substitui a nota fiscal.</p>
          </div>
        </div>
        <div className="wf-modal__foot wf-recibo-noimprimir">
          <button className="wf-btn wf-btn--accent" onClick={() => imprimirComNome(nomeDoArquivo)}><Printer size={16} /> Imprimir / salvar em PDF</button>
        </div>
      </div>
    </div>
  );
}
