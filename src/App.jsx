import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, ClipboardList, Users, Car, Package, Plus, X, Search,
  Phone, Mail, AlertTriangle, PackageX, Trash2, Wrench, Calendar,
  ChevronRight, Loader2, Edit2, LogIn, LogOut, UserPlus, ShieldCheck,
  MapPin, Star, ArrowRight, ArrowLeft, CalendarClock, Inbox, UserCircle, Clock,
  Wallet, MessageCircle, Send, Receipt, Printer,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Dados / utilitários                                                 */
/* ------------------------------------------------------------------ */

const STATUS = {
  aguardando: { label: "Aguardando Diagnóstico", color: "#3C5A6B" },
  andamento: { label: "Em Andamento", color: "#B8860B" },
  peca: { label: "Aguardando Peça", color: "#C4441E" },
  concluido: { label: "Concluído", color: "#3F7D57" },
  entregue: { label: "Entregue", color: "#6B6A63" },
};
const STATUS_ORDER = ["aguardando", "andamento", "peca", "concluido", "entregue"];
const MECANICOS = ["Carlos Mendes", "Ana Ferreira", "Roberto Silva", "Sem atribuição"];

const AGENDAMENTO_STATUS = {
  pendente: { label: "Pendente", color: "#3C5A6B" },
  confirmado: { label: "Confirmado", color: "#3F7D57" },
  concluido: { label: "Concluído", color: "#6B6A63" },
  cancelado: { label: "Cancelado", color: "#C4441E" },
};
const AGENDAMENTO_STATUS_ORDER = ["pendente", "confirmado", "concluido", "cancelado"];

const CATEGORIAS_SERVICO = [
  "Manutenção", "Revisão", "Freios", "Suspensão", "Elétrica",
  "Ar-condicionado", "Pneus e Alinhamento", "Funilaria e Pintura", "Outros",
];

const OFICINA_INFO = {
  nome: "Torque",
  endereco: "Av. das Oficinas, 482 – Vila Industrial, São Paulo/SP",
  telefone: "(11) 3456-7890",
  email: "contato@torque.com.br",
  horario: "Seg a Sex 8h–18h · Sáb 8h–13h",
};

const fmtBRL = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtData = (iso) => { if (!iso) return "—"; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const sanitizeDecimal = (v) => {
  const limpo = v.replace(/[^0-9.]/g, "");
  const primeiroPonto = limpo.indexOf(".");
  if (primeiroPonto === -1) return limpo;
  return limpo.slice(0, primeiroPonto + 1) + limpo.slice(primeiroPonto + 1).replace(/\./g, "");
};
const confirmarExclusaoVeiculo = (veiculoId, ordens, agendamentos) => {
  const osVinculadas = ordens.filter((o) => o.veiculoId === veiculoId).length;
  const agVinculados = agendamentos.filter((a) => a.veiculoId === veiculoId).length;
  if (!osVinculadas && !agVinculados) return confirm("Excluir este veículo?");
  const partes = [];
  if (osVinculadas) partes.push(`${osVinculadas} ordem(ns) de serviço`);
  if (agVinculados) partes.push(`${agVinculados} agendamento(s)`);
  return confirm(`Este veículo está vinculado a ${partes.join(" e ")}, que serão mantidos no histórico sem a referência do veículo. Deseja excluir mesmo assim?`);
};

// Endereço da API local (server.js). Ajuste aqui se o servidor rodar em outra porta/host.
// Em produção, defina VITE_API_URL no ambiente de build (Vercel/Netlify/Railway/etc.)
// apontando para a URL pública da API. Em desenvolvimento local, não precisa
// configurar nada — cai automaticamente em localhost:3001.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Token de sessão: um por navegador, guardado no localStorage para
// sobreviver a um F5. Nunca guarda senha nenhuma, só um código aleatório
// que o servidor gerou no login (ver /api/login no server.js).
const CHAVE_TOKEN = "oficina:token";
const getToken = () => localStorage.getItem(CHAVE_TOKEN) || "";
const setToken = (t) => { if (t) localStorage.setItem(CHAVE_TOKEN, t); else localStorage.removeItem(CHAVE_TOKEN); };

// Se qualquer chamada à API voltar "não autorizado", a sessão local está
// inválida (expirou, foi revogada, ou o banco foi resetado) — a App root
// registra esse callback para deslogar automaticamente nesse caso.
let aoPerderSessao = () => {};

async function loadOrSeed(key, seed) {
  const entidade = key.replace("oficina:", "");
  try {
    const res = await fetch(`${API_URL}/${entidade}`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.status === 401) { aoPerderSessao(); return seed; }
    if (res.status === 403) return seed; // sem permissão pra esse recurso específico — sessão continua válida
    if (!res.ok) throw new Error(`Falha ao carregar "${entidade}" (HTTP ${res.status})`);
    const dados = await res.json();
    return Array.isArray(dados) ? dados : seed;
  } catch (err) {
    console.error(`Não foi possível conectar ao banco de dados para "${entidade}". Confira se o servidor está rodando (npm run server).`, err);
    return seed;
  }
}
async function loadSession() {
  if (!getToken()) return null;
  try {
    const res = await fetch(`${API_URL}/sessao`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("Não foi possível conectar ao banco de dados para carregar a sessão. Confira se o servidor está rodando (npm run server).", err);
    return null;
  }
}
async function persist(key, value) {
  const entidade = key.replace("oficina:", "");
  try {
    const res = await fetch(`${API_URL}/${entidade}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(value),
    });
    if (res.status === 401) { aoPerderSessao(); return; }
    if (res.status === 403) return; // sem permissão pra esse recurso específico — sessão continua válida
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    console.error(`Falha ao salvar "${entidade}" no banco de dados. Confira se o servidor está rodando (npm run server).`, err);
  }
}

// Login/cadastro/contato são validados no servidor (não no navegador) —
// por isso são chamadas dedicadas, em vez de passar pelo persist() genérico.
async function apiLogin(email, senha) {
  const res = await fetch(`${API_URL}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, senha }) });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.error || "E-mail ou senha inválidos.");
  return dados;
}
async function apiLogout() {
  try { await fetch(`${API_URL}/logout`, { method: "POST", headers: { Authorization: `Bearer ${getToken()}` } }); } catch (err) { /* ignora — vamos limpar localmente de qualquer forma */ }
}
async function apiRegistrarCliente({ nome, email, telefone, senha }) {
  const res = await fetch(`${API_URL}/registrar-cliente`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, email, telefone, senha }) });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.error || "Não foi possível criar sua conta.");
  return dados;
}
async function apiEnviarMensagemContato({ nome, email, telefone, assunto, mensagem }) {
  const res = await fetch(`${API_URL}/mensagens`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nome, email, telefone, assunto, mensagem }) });
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(dados.error || "Não foi possível enviar sua mensagem.");
  return dados;
}

/* ------------------------------------------------------------------ */
/* Componentes pequenos reutilizáveis                                  */
/* ------------------------------------------------------------------ */

function Plate({ children }) { return <span className="wf-plate">{children}</span>; }
function Badge({ children, accent }) { return <span className={`wf-badge ${accent ? "wf-badge--accent" : ""}`}>{children}</span>; }

function Stamp({ status, size = "md" }) {
  const s = STATUS[status] || STATUS.aguardando;
  return <span className={`wf-stamp wf-stamp--${size}`} style={{ color: s.color, borderColor: s.color }}>{s.label}</span>;
}
function AgStamp({ status, size = "md" }) {
  const s = AGENDAMENTO_STATUS[status] || AGENDAMENTO_STATUS.pendente;
  return <span className={`wf-stamp wf-stamp--${size}`} style={{ color: s.color, borderColor: s.color }}>{s.label}</span>;
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="wf-stat">
      <div className="wf-stat__icon" style={{ background: tone }}><Icon size={20} strokeWidth={2} /></div>
      <div><div className="wf-stat__value">{value}</div><div className="wf-stat__label">{label}</div></div>
    </div>
  );
}

function Modal({ title, onClose, children, width }) {
  return (
    <div className="wf-modal-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wf-modal" style={width ? { maxWidth: width } : undefined}>
        <div className="wf-modal__head"><h3>{title}</h3><button className="wf-iconbtn" onClick={onClose}><X size={18} /></button></div>
        <div className="wf-modal__body">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return <label className="wf-field"><span>{label}</span>{children}</label>;
}

function VeiculoCampos({ placa, setPlaca, marca, setMarca, modelo, setModelo, ano, setAno, cor, setCor }) {
  return (
    <div className="wf-grid3">
      <Field label="Placa"><input value={placa} onChange={(e) => setPlaca(e.target.value.toUpperCase())} placeholder="ABC1D23" /></Field>
      <Field label="Marca"><input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Fiat" /></Field>
      <Field label="Modelo"><input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Argo" /></Field>
      <Field label="Ano"><input value={ano} onChange={(e) => setAno(e.target.value)} placeholder="2021" /></Field>
      <Field label="Cor"><input value={cor} onChange={(e) => setCor(e.target.value)} placeholder="Branco" /></Field>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Ordens de Serviço                                                    */
/* ------------------------------------------------------------------ */

function EstrelasExibir({ nota, size = 14 }) {
  return (
    <span className="wf-estrelas-exibir">
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={size} fill={n <= nota ? "currentColor" : "none"} />)}
    </span>
  );
}

function AvaliarModal({ ordem, onClose, onSave }) {
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");
  return (
    <Modal title={`Avaliar atendimento · ${ordem.numero}`} onClose={onClose} width="420px">
      <Field label="Sua nota para este atendimento">
        <div className="wf-estrelas-input">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" className="wf-estrela-btn" onClick={() => setNota(n)} aria-label={`${n} estrela(s)`}>
              <Star size={26} fill={n <= nota ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </Field>
      <Field label="Comentário (opcional)">
        <textarea rows={3} value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Conte como foi sua experiência..." />
      </Field>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" onClick={() => onSave({ nota, comentario })}>Enviar avaliação</button>
      </div>
    </Modal>
  );
}

function OSTicket({ ordem, cliente, veiculo, onStatusChange, onDelete, onEdit, onRecibo, onAvaliar, avaliacao, readOnly, hideCliente }) {
  const total = ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0);
  return (
    <div className="wf-ticket">
      <div className="wf-ticket__perf"><span className="wf-ticket__hole" /><span className="wf-ticket__hole" /></div>
      <div className="wf-ticket__top">
        <span className="wf-mono wf-ticket__num">{ordem.numero}</span>
        <div className="wf-ticket__stampwrap"><Stamp status={ordem.status} /></div>
      </div>
      {!hideCliente && <div className="wf-ticket__cliente">{cliente?.nome || "Cliente removido"}</div>}
      <div className="wf-ticket__veiculo">
        <Plate>{veiculo?.placa || "—"}</Plate>
        <span>{veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}` : ""}</span>
      </div>
      <p className="wf-ticket__desc">{ordem.descricao || "Sem descrição informada."}</p>
      <div className="wf-ticket__meta">
        <span><Wrench size={13} /> {ordem.mecanico}</span>
        <span><Calendar size={13} /> Previsão {fmtData(ordem.previsao)}</span>
      </div>
      {(avaliacao || onAvaliar) && (
        <div className="wf-ticket__avaliacao">
          {avaliacao ? (
            <>
              <EstrelasExibir nota={avaliacao.nota} size={13} />
              {avaliacao.comentario && <span className="wf-ticket__avaliacao-comentario">"{avaliacao.comentario}"</span>}
            </>
          ) : (
            <button className="wf-link" onClick={() => onAvaliar(ordem)}><Star size={13} /> Avaliar atendimento</button>
          )}
        </div>
      )}
      <div className="wf-ticket__footer">
        {!readOnly ? (
          <select className="wf-select wf-select--ticket" value={ordem.status} onChange={(e) => onStatusChange(ordem.id, e.target.value)}>
            {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </select>
        ) : <span className="wf-muted" style={{ fontSize: 12 }}>Acompanhamento</span>}
        <span className="wf-mono wf-ticket__total">{fmtBRL(total)}</span>
        {onRecibo && <button className="wf-iconbtn" onClick={() => onRecibo(ordem)} title="Ver / baixar comprovante"><Printer size={15} /></button>}
        {!readOnly && (
          <>
            <button className="wf-iconbtn" onClick={() => onEdit(ordem)} title="Editar OS"><Edit2 size={15} /></button>
            <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => onDelete(ordem.id)} title="Excluir OS"><Trash2 size={15} /></button>
          </>
        )}
      </div>
    </div>
  );
}

function ItemRow({ item, estoque, onChange, onRemove }) {
  const isPeca = item.tipo === "peca";
  const peca = isPeca ? estoque.find((p) => p.id === item.pecaId) : null;
  const subtotal = isPeca ? (Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0) : (Number(item.valor) || 0);

  const handleTipo = (novoTipo) => {
    if (novoTipo === "peca") {
      const primeira = estoque[0];
      onChange({ ...item, tipo: "peca", pecaId: primeira?.id || "", descricao: primeira?.nome || "", quantidade: 1, valorUnitario: primeira?.preco || 0, valor: primeira?.preco || 0 });
    } else {
      onChange({ ...item, tipo: "avulso", pecaId: undefined, descricao: "", quantidade: undefined, valorUnitario: undefined, valor: 0 });
    }
  };
  const handlePecaChange = (pecaId) => {
    const p = estoque.find((x) => x.id === pecaId);
    const qtd = Number(item.quantidade) || 1;
    onChange({ ...item, pecaId, descricao: p?.nome || "", valorUnitario: p?.preco || 0, valor: (p?.preco || 0) * qtd });
  };
  const handleQtdChange = (valorDigitado) => {
    const q = Number(valorDigitado.replace(/\D/g, "")) || 0;
    onChange({ ...item, quantidade: q, valor: q * (Number(item.valorUnitario) || 0) });
  };

  return (
    <div className="wf-item-row-block">
      <div className="wf-item-row-block__tipo">
        <button type="button" className={!isPeca ? "active" : ""} onClick={() => handleTipo("avulso")}>Item avulso</button>
        <button type="button" className={isPeca ? "active" : ""} onClick={() => handleTipo("peca")}>Peça do estoque</button>
      </div>
      {isPeca ? (
        <div className="wf-item-row">
          <select className="wf-select" value={item.pecaId || ""} onChange={(e) => handlePecaChange(e.target.value)}>
            {estoque.length === 0 && <option value="">Nenhuma peça cadastrada</option>}
            {estoque.map((p) => <option key={p.id} value={p.id}>{p.codigo} · {p.nome} ({p.quantidade} disp.)</option>)}
          </select>
          <input className="wf-mono wf-item-row__qtd" inputMode="numeric" value={item.quantidade ?? ""} onChange={(e) => handleQtdChange(e.target.value)} placeholder="Qtd" title="Quantidade" />
          <span className="wf-mono wf-item-row__subtotal">{fmtBRL(subtotal)}</span>
          <button className="wf-iconbtn wf-iconbtn--danger" onClick={onRemove}><Trash2 size={14} /></button>
        </div>
      ) : (
        <div className="wf-item-row">
          <input placeholder="Descrição do item / mão de obra" value={item.descricao || ""} onChange={(e) => onChange({ ...item, descricao: e.target.value })} />
          <input className="wf-mono" placeholder="R$ 0,00" inputMode="decimal" value={item.valor} onChange={(e) => onChange({ ...item, valor: sanitizeDecimal(e.target.value) })} />
          <button className="wf-iconbtn wf-iconbtn--danger" onClick={onRemove}><Trash2 size={14} /></button>
        </div>
      )}
      {isPeca && peca && Number(item.quantidade) > peca.quantidade && (
        <p className="wf-warn-note"><AlertTriangle size={12} /> Quantidade acima do disponível em estoque ({peca.quantidade} un.)</p>
      )}
    </div>
  );
}

function ReciboOS({ ordem, cliente, veiculo, pagamentos, onClose }) {
  const total = ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0);
  const pago = (pagamentos || []).filter((p) => p.ordemId === ordem.id).reduce((s, p) => s + Number(p.valor || 0), 0);
  const saldo = total - pago;
  const emitidoEm = new Date().toLocaleDateString("pt-BR");

  return (
    <div className="wf-modal-veil wf-recibo-veil" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wf-modal wf-recibo-modal">
        <div className="wf-modal__head wf-recibo-noimprimir">
          <h3>Comprovante · {ordem.numero}</h3>
          <button className="wf-iconbtn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="wf-modal__body">
          <div className="wf-recibo">
            <div className="wf-recibo__cabecalho">
              <div>
                <div className="wf-recibo__marca"><Wrench size={20} /> Torque</div>
                <p>{OFICINA_INFO.endereco}</p>
                <p>{OFICINA_INFO.telefone} · {OFICINA_INFO.email}</p>
              </div>
              <div className="wf-recibo__doc">
                <p className="wf-eyebrow">Comprovante de Ordem de Serviço</p>
                <p className="wf-mono wf-recibo__numero">{ordem.numero}</p>
                <p className="wf-muted">Emitido em {emitidoEm}</p>
              </div>
            </div>

            <div className="wf-recibo__grid">
              <div>
                <span className="wf-recibo__label">Cliente</span>
                <p>{cliente?.nome || "—"}</p>
                {cliente?.telefone && <p className="wf-muted">{cliente.telefone}</p>}
              </div>
              <div>
                <span className="wf-recibo__label">Veículo</span>
                <p>{veiculo ? `${veiculo.marca} ${veiculo.modelo} · ${veiculo.ano}` : "—"}</p>
                {veiculo?.placa && <p className="wf-muted"><Plate>{veiculo.placa}</Plate></p>}
              </div>
              <div>
                <span className="wf-recibo__label">Mecânico responsável</span>
                <p>{ordem.mecanico || "—"}</p>
              </div>
              <div>
                <span className="wf-recibo__label">Status</span>
                <p><Stamp status={ordem.status} size="sm" /></p>
              </div>
              <div>
                <span className="wf-recibo__label">Data de entrada</span>
                <p>{fmtData(ordem.dataEntrada)}</p>
              </div>
              <div>
                <span className="wf-recibo__label">Previsão de entrega</span>
                <p>{fmtData(ordem.previsao)}</p>
              </div>
            </div>

            {ordem.descricao && (
              <div className="wf-recibo__desc">
                <span className="wf-recibo__label">Descrição do serviço</span>
                <p>{ordem.descricao}</p>
              </div>
            )}

            <table className="wf-recibo__tabela">
              <thead><tr><th>Item</th><th>Valor</th></tr></thead>
              <tbody>
                {ordem.itens.length === 0 ? (
                  <tr><td colSpan={2} className="wf-muted">Nenhum item registrado.</td></tr>
                ) : ordem.itens.map((item) => (
                  <tr key={item.id}>
                    <td>{item.descricao}{item.tipo === "peca" && item.quantidade ? ` (x${item.quantidade})` : ""}</td>
                    <td className="wf-mono">{fmtBRL(item.valor)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr><td>Total</td><td className="wf-mono">{fmtBRL(total)}</td></tr>
                {pago > 0 && (<>
                  <tr><td>Pago</td><td className="wf-mono">{fmtBRL(pago)}</td></tr>
                  <tr><td>Saldo {saldo > 0 ? "em aberto" : ""}</td><td className="wf-mono">{fmtBRL(Math.max(saldo, 0))}</td></tr>
                </>)}
              </tfoot>
            </table>

            <p className="wf-recibo__rodape">Obrigado pela confiança. Este comprovante não substitui a nota fiscal.</p>
          </div>
        </div>
        <div className="wf-modal__foot wf-recibo-noimprimir">
          <button className="wf-btn wf-btn--accent" onClick={() => window.print()}><Printer size={16} /> Baixar comprovante (salvar como PDF)</button>
        </div>
      </div>
    </div>
  );
}

function NovaOSModal({ clientes, veiculos, estoque, onClose, onCreate, nextNumero }) {
  const [clienteMode, setClienteMode] = useState("existing");
  const [clienteId, setClienteId] = useState(clientes[0]?.id || "");
  const [novoCliente, setNovoCliente] = useState({ nome: "", telefone: "", email: "" });
  const [veiculoMode, setVeiculoMode] = useState("existing");
  const [veiculoId, setVeiculoId] = useState("");
  const [novoVeiculo, setNovoVeiculo] = useState({ placa: "", marca: "", modelo: "", ano: "", cor: "" });
  const [descricao, setDescricao] = useState("");
  const [mecanico, setMecanico] = useState(MECANICOS[MECANICOS.length - 1]);
  const [previsao, setPrevisao] = useState("");
  const [itens, setItens] = useState([{ id: uid("i"), tipo: "avulso", descricao: "", valor: "" }]);

  const veiculosDoCliente = clienteMode === "existing" ? veiculos.filter((v) => v.clienteId === clienteId) : [];

  useEffect(() => {
    if (clienteMode === "existing") {
      const list = veiculos.filter((v) => v.clienteId === clienteId);
      if (list.length) { setVeiculoMode("existing"); setVeiculoId(list[0].id); }
      else { setVeiculoMode("new"); setVeiculoId(""); }
    } else { setVeiculoMode("new"); setVeiculoId(""); }
    // eslint-disable-next-line
  }, [clienteId, clienteMode]);

  const addItem = () => setItens((prev) => [...prev, { id: uid("i"), tipo: "avulso", descricao: "", valor: "" }]);
  const removeItem = (id) => setItens((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id, novo) => setItens((prev) => prev.map((i) => (i.id === id ? novo : i)));
  const itemSubtotal = (i) => (i.tipo === "peca" ? (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0) : (Number(i.valor) || 0));
  const total = itens.reduce((s, i) => s + itemSubtotal(i), 0);

  const podeSalvar =
    (clienteMode === "existing" ? !!clienteId : novoCliente.nome.trim()) &&
    (veiculoMode === "existing" ? !!veiculoId : novoVeiculo.placa.trim());

  const handleSalvar = () => {
    if (!podeSalvar) return;
    onCreate({
      clienteMode, clienteId, novoCliente, veiculoMode, veiculoId, novoVeiculo,
      descricao, mecanico, previsao,
      itens: itens.filter((i) => (i.tipo === "peca" ? !!i.pecaId : i.descricao.trim())).map((i) => ({ ...i, valor: itemSubtotal(i) })),
    });
  };

  return (
    <Modal title={`Nova Ordem de Serviço · ${nextNumero}`} onClose={onClose} width="640px">
      <div className="wf-form-section">
        <div className="wf-form-section__head">
          <span>Cliente</span>
          <div className="wf-toggle">
            <button className={clienteMode === "existing" ? "active" : ""} onClick={() => setClienteMode("existing")}>Existente</button>
            <button className={clienteMode === "new" ? "active" : ""} onClick={() => setClienteMode("new")}>Novo</button>
          </div>
        </div>
        {clienteMode === "existing" ? (
          <select className="wf-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        ) : (
          <div className="wf-grid2">
            <Field label="Nome"><input value={novoCliente.nome} onChange={(e) => setNovoCliente({ ...novoCliente, nome: e.target.value })} placeholder="Nome completo" /></Field>
            <Field label="Telefone"><input value={novoCliente.telefone} onChange={(e) => setNovoCliente({ ...novoCliente, telefone: e.target.value })} placeholder="(11) 90000-0000" /></Field>
          </div>
        )}
      </div>

      <div className="wf-form-section">
        <div className="wf-form-section__head">
          <span>Veículo</span>
          {veiculosDoCliente.length > 0 && (
            <div className="wf-toggle">
              <button className={veiculoMode === "existing" ? "active" : ""} onClick={() => setVeiculoMode("existing")}>Existente</button>
              <button className={veiculoMode === "new" ? "active" : ""} onClick={() => setVeiculoMode("new")}>Novo</button>
            </div>
          )}
        </div>
        {veiculoMode === "existing" && veiculosDoCliente.length > 0 ? (
          <select className="wf-select" value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
            {veiculosDoCliente.map((v) => <option key={v.id} value={v.id}>{v.placa} · {v.marca} {v.modelo}</option>)}
          </select>
        ) : (
          <div className="wf-grid3">
            <Field label="Placa"><input value={novoVeiculo.placa} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })} placeholder="ABC1D23" /></Field>
            <Field label="Marca"><input value={novoVeiculo.marca} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, marca: e.target.value })} placeholder="Fiat" /></Field>
            <Field label="Modelo"><input value={novoVeiculo.modelo} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })} placeholder="Argo" /></Field>
            <Field label="Ano"><input value={novoVeiculo.ano} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano: e.target.value })} placeholder="2021" /></Field>
            <Field label="Cor"><input value={novoVeiculo.cor} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })} placeholder="Branco" /></Field>
          </div>
        )}
      </div>

      <div className="wf-form-section">
        <div className="wf-form-section__head"><span>Detalhes do serviço</span></div>
        <Field label="Problema relatado / descrição">
          <textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: barulho ao frear, revisão programada..." />
        </Field>
        <div className="wf-grid2">
          <Field label="Mecânico responsável">
            <select className="wf-select" value={mecanico} onChange={(e) => setMecanico(e.target.value)}>
              {MECANICOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Previsão de entrega"><input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} /></Field>
        </div>
      </div>

      <div className="wf-form-section">
        <div className="wf-form-section__head"><span>Itens / peças / mão de obra</span></div>
        <div className="wf-itens">
          {itens.map((item) => (
            <ItemRow key={item.id} item={item} estoque={estoque} onChange={(novo) => updateItem(item.id, novo)} onRemove={() => removeItem(item.id)} />
          ))}
        </div>
        <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={addItem}><Plus size={14} /> Adicionar item</button>
      </div>

      <div className="wf-modal__foot">
        <span className="wf-mono wf-modal__total">Total: {fmtBRL(total)}</span>
        <button className="wf-btn wf-btn--accent" disabled={!podeSalvar} onClick={handleSalvar}>Criar Ordem de Serviço</button>
      </div>
    </Modal>
  );
}

function EditarOSModal({ ordem, cliente, veiculo, estoque, onClose, onSave }) {
  const [descricao, setDescricao] = useState(ordem.descricao);
  const [mecanico, setMecanico] = useState(ordem.mecanico);
  const [previsao, setPrevisao] = useState(ordem.previsao);
  const [status, setStatus] = useState(ordem.status);
  const [itens, setItens] = useState(ordem.itens.length ? ordem.itens : [{ id: uid("i"), tipo: "avulso", descricao: "", valor: "" }]);

  const addItem = () => setItens((p) => [...p, { id: uid("i"), tipo: "avulso", descricao: "", valor: "" }]);
  const removeItem = (id) => setItens((p) => p.filter((i) => i.id !== id));
  const updateItem = (id, novo) => setItens((p) => p.map((i) => (i.id === id ? novo : i)));
  const itemSubtotal = (i) => (i.tipo === "peca" ? (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0) : (Number(i.valor) || 0));
  const total = itens.reduce((s, i) => s + itemSubtotal(i), 0);

  const salvar = () => onSave({
    ...ordem, descricao, mecanico, previsao, status,
    itens: itens.filter((i) => (i.tipo === "peca" ? !!i.pecaId : i.descricao.trim())).map((i) => ({ ...i, valor: itemSubtotal(i) })),
  });

  return (
    <Modal title={`Editar ${ordem.numero}`} onClose={onClose} width="600px">
      <div className="wf-ticket__cliente" style={{ marginBottom: 4 }}>{cliente?.nome || "Cliente removido"}</div>
      <div className="wf-ticket__veiculo" style={{ marginBottom: 16 }}>
        <Plate>{veiculo?.placa || "—"}</Plate><span>{veiculo ? `${veiculo.marca} ${veiculo.modelo}` : ""}</span>
      </div>
      <Field label="Descrição"><textarea rows={2} value={descricao} onChange={(e) => setDescricao(e.target.value)} /></Field>
      <div className="wf-grid2">
        <Field label="Mecânico"><select className="wf-select" value={mecanico} onChange={(e) => setMecanico(e.target.value)}>{MECANICOS.map((m) => <option key={m} value={m}>{m}</option>)}</select></Field>
        <Field label="Previsão"><input type="date" value={previsao} onChange={(e) => setPrevisao(e.target.value)} /></Field>
      </div>
      <Field label="Status"><select className="wf-select" value={status} onChange={(e) => setStatus(e.target.value)}>{STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}</select></Field>
      <div className="wf-form-section__head"><span>Itens / peças / mão de obra</span></div>
      <div className="wf-itens">
        {itens.map((item) => (
          <ItemRow key={item.id} item={item} estoque={estoque} onChange={(novo) => updateItem(item.id, novo)} onRemove={() => removeItem(item.id)} />
        ))}
      </div>
      <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={addItem}><Plus size={14} /> Adicionar item</button>
      <div className="wf-modal__foot">
        <span className="wf-mono wf-modal__total">Total: {fmtBRL(total)}</span>
        <button className="wf-btn wf-btn--accent" onClick={salvar}>Salvar alterações</button>
      </div>
    </Modal>
  );
}

function pecaQtyMap(itens) {
  const m = {};
  (itens || []).forEach((i) => { if (i.tipo === "peca" && i.pecaId) m[i.pecaId] = (m[i.pecaId] || 0) + (Number(i.quantidade) || 0); });
  return m;
}
function aplicarDeltaEstoque(setEstoque, itensAntigos, itensNovos) {
  const oldMap = pecaQtyMap(itensAntigos);
  const newMap = pecaQtyMap(itensNovos);
  const ids = new Set([...Object.keys(oldMap), ...Object.keys(newMap)]);
  if (ids.size === 0) return;
  setEstoque((prev) => prev.map((p) => {
    if (!ids.has(p.id)) return p;
    const delta = (newMap[p.id] || 0) - (oldMap[p.id] || 0); // uso maior agora → desconta do estoque
    return { ...p, quantidade: Math.max(0, p.quantidade - delta) };
  }));
}

function OrdensView({ ordens, clientes, veiculos, estoque, pagamentos, avaliacoes, setOrdens, setClientes, setVeiculos, setEstoque, setPagamentos, setAvaliacoes }) {
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const proximoNumero = () => {
    const nums = ordens.map((o) => Number(o.numero.replace("OS-", "")) || 0);
    const next = (nums.length ? Math.max(...nums) : 200) + 1;
    return `OS-${String(next).padStart(4, "0")}`;
  };

  const filtradas = ordens.filter((o) => {
    if (filtro !== "todas" && o.status !== filtro) return false;
    if (!busca.trim()) return true;
    const c = clientes.find((c) => c.id === o.clienteId);
    const v = veiculos.find((v) => v.id === o.veiculoId);
    const alvo = `${o.numero} ${c?.nome || ""} ${v?.placa || ""}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  }).sort((a, b) => (a.dataEntrada < b.dataEntrada ? 1 : -1));

  const handleStatusChange = (id, status) => setOrdens((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  const handleDelete = (id) => {
    const pagamentosVinculados = pagamentos.filter((p) => p.ordemId === id).length;
    const msg = pagamentosVinculados
      ? `Excluir esta ordem de serviço? As peças utilizadas voltarão para o estoque e ${pagamentosVinculados} pagamento(s) registrado(s) para ela também serão excluídos.`
      : "Excluir esta ordem de serviço? As peças utilizadas voltarão para o estoque.";
    if (!confirm(msg)) return;
    const alvo = ordens.find((o) => o.id === id);
    if (alvo) aplicarDeltaEstoque(setEstoque, alvo.itens, []);
    setPagamentos((prev) => prev.filter((p) => p.ordemId !== id));
    setAvaliacoes((prev) => prev.filter((a) => a.ordemId !== id));
    setOrdens((prev) => prev.filter((o) => o.id !== id));
  };
  const handleSaveEdit = (updated) => {
    aplicarDeltaEstoque(setEstoque, editing?.itens, updated.itens);
    setOrdens((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setEditing(null);
  };

  const handleCreate = (payload) => {
    let clienteId = payload.clienteId;
    if (payload.clienteMode === "new") {
      const novo = { id: uid("c"), ...payload.novoCliente };
      setClientes((prev) => [...prev, novo]);
      clienteId = novo.id;
    }
    let veiculoId = payload.veiculoId;
    if (payload.veiculoMode === "new") {
      const novo = { id: uid("v"), clienteId, ...payload.novoVeiculo };
      setVeiculos((prev) => [...prev, novo]);
      veiculoId = novo.id;
    }
    const ordem = {
      id: uid("o"), numero: proximoNumero(), clienteId, veiculoId, status: "aguardando",
      descricao: payload.descricao, mecanico: payload.mecanico,
      dataEntrada: new Date().toISOString().slice(0, 10), previsao: payload.previsao,
      itens: payload.itens,
    };
    aplicarDeltaEstoque(setEstoque, [], ordem.itens);
    setOrdens((prev) => [ordem, ...prev]);
    setModalOpen(false);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Oficina</p><h1>Ordens de Serviço</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => setModalOpen(true)}><Plus size={18} /> Nova OS</button>
      </div>

      <div className="wf-toolbar">
        <div className="wf-search"><Search size={16} /><input placeholder="Buscar por nº, cliente ou placa..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <div className="wf-pills">
          <button className={`wf-pill ${filtro === "todas" ? "active" : ""}`} onClick={() => setFiltro("todas")}>Todas ({ordens.length})</button>
          {STATUS_ORDER.map((s) => (
            <button key={s} className={`wf-pill ${filtro === s ? "active" : ""}`} style={{ "--pill-color": STATUS[s].color }} onClick={() => setFiltro(s)}>
              {STATUS[s].label} ({ordens.filter((o) => o.status === s).length})
            </button>
          ))}
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="wf-empty-note">Nenhuma ordem de serviço encontrada para esse filtro.</p>
      ) : (
        <div className="wf-ticket-grid">
          {filtradas.map((o) => (
            <OSTicket
              key={o.id} ordem={o}
              cliente={clientes.find((c) => c.id === o.clienteId)}
              veiculo={veiculos.find((v) => v.id === o.veiculoId)}
              avaliacao={avaliacoes.find((a) => a.ordemId === o.id)}
              onStatusChange={handleStatusChange} onDelete={handleDelete} onEdit={setEditing}
            />
          ))}
        </div>
      )}

      {modalOpen && <NovaOSModal clientes={clientes} veiculos={veiculos} estoque={estoque} nextNumero={proximoNumero()} onClose={() => setModalOpen(false)} onCreate={handleCreate} />}
      {editing && (
        <EditarOSModal
          ordem={editing}
          cliente={clientes.find((c) => c.id === editing.clienteId)}
          veiculo={veiculos.find((v) => v.id === editing.veiculoId)}
          estoque={estoque}
          onClose={() => setEditing(null)} onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Clientes                                                             */
/* ------------------------------------------------------------------ */

function ClienteModal({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [telefone, setTelefone] = useState(initial?.telefone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [senha, setSenha] = useState(initial?.senha || "");
  return (
    <Modal title={initial ? "Editar Cliente" : "Novo Cliente"} onClose={onClose} width="420px">
      <Field label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome do cliente" autoFocus /></Field>
      <div className="wf-grid2">
        <Field label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 90000-0000" /></Field>
        <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cliente@email.com" /></Field>
      </div>
      <Field label="Senha de acesso ao portal">
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Defina uma senha para o cliente acessar o portal" />
      </Field>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!nome.trim()} onClick={() => onSave({ id: initial?.id || uid("c"), nome: nome.trim(), telefone, email: email.trim(), senha })}>
          {initial ? "Salvar alterações" : "Salvar cliente"}
        </button>
      </div>
    </Modal>
  );
}

function ClientesView({ clientes, veiculos, agendamentos, setClientes, setVeiculos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtrados = clientes.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()));

  const handleDelete = (id) => {
    const agVinculados = agendamentos.filter((a) => a.clienteId === id).length;
    const msg = agVinculados
      ? `Excluir cliente e seus veículos vinculados? Há ${agVinculados} agendamento(s) associado(s) que serão mantidos no histórico, assim como as ordens de serviço relacionadas.`
      : "Excluir cliente e seus veículos vinculados? As ordens de serviço relacionadas serão mantidas no histórico.";
    if (!confirm(msg)) return;
    setClientes((prev) => prev.filter((c) => c.id !== id));
    setVeiculos((prev) => prev.filter((v) => v.clienteId !== id));
  };
  const handleSave = (c) => {
    if (editing) setClientes((prev) => prev.map((x) => (x.id === c.id ? c : x)));
    else setClientes((prev) => [...prev, c]);
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Cadastro</p><h1>Clientes</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Cliente</button>
      </div>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar cliente..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Nome</th><th>Contato</th><th>Veículos</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((c) => {
              const vs = veiculos.filter((v) => v.clienteId === c.id);
              return (
                <tr key={c.id}>
                  <td className="wf-table__strong">{c.nome}</td>
                  <td>
                    <div className="wf-contact"><Phone size={13} /> {c.telefone || "—"}</div>
                    {c.email && <div className="wf-contact"><Mail size={13} /> {c.email}</div>}
                  </td>
                  <td>{vs.length ? vs.map((v) => <Plate key={v.id}>{v.placa}</Plate>) : <span className="wf-muted">Nenhum</span>}</td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(c); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(c.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && <tr><td colSpan={4} className="wf-empty-note">Nenhum cliente encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && <ClienteModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Veículos (admin)                                                     */
/* ------------------------------------------------------------------ */

function VeiculoModal({ clientes, initial, onClose, onSave }) {
  const [clienteId, setClienteId] = useState(initial?.clienteId || clientes[0]?.id || "");
  const [placa, setPlaca] = useState(initial?.placa || "");
  const [marca, setMarca] = useState(initial?.marca || "");
  const [modelo, setModelo] = useState(initial?.modelo || "");
  const [ano, setAno] = useState(initial?.ano || "");
  const [cor, setCor] = useState(initial?.cor || "");
  const pode = clienteId && placa.trim();
  return (
    <Modal title={initial ? "Editar Veículo" : "Novo Veículo"} onClose={onClose} width="480px">
      <Field label="Proprietário">
        <select className="wf-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
          {clientes.length === 0 && <option value="">Cadastre um cliente primeiro</option>}
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </Field>
      <VeiculoCampos placa={placa} setPlaca={setPlaca} marca={marca} setMarca={setMarca} modelo={modelo} setModelo={setModelo} ano={ano} setAno={setAno} cor={cor} setCor={setCor} />
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: initial?.id || uid("v"), clienteId, placa, marca, modelo, ano, cor })}>
          {initial ? "Salvar alterações" : "Salvar veículo"}
        </button>
      </div>
    </Modal>
  );
}

function VeiculosView({ veiculos, clientes, ordens, agendamentos, setVeiculos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome || "Sem proprietário";
  const filtrados = veiculos.filter((v) => `${v.placa} ${v.marca} ${v.modelo} ${clienteNome(v.clienteId)}`.toLowerCase().includes(busca.toLowerCase()));

  const handleDelete = (id) => { if (confirmarExclusaoVeiculo(id, ordens, agendamentos)) setVeiculos((prev) => prev.filter((v) => v.id !== id)); };
  const handleSave = (v) => {
    if (editing) setVeiculos((prev) => prev.map((x) => (x.id === v.id ? v : x)));
    else setVeiculos((prev) => [...prev, v]);
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Cadastro</p><h1>Veículos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Veículo</button>
      </div>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar por placa, modelo ou dono..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Placa</th><th>Veículo</th><th>Ano</th><th>Cor</th><th>Proprietário</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((v) => (
              <tr key={v.id}>
                <td><Plate>{v.placa}</Plate></td>
                <td className="wf-table__strong">{v.marca} {v.modelo}</td>
                <td className="wf-mono">{v.ano}</td>
                <td>{v.cor}</td>
                <td>{clienteNome(v.clienteId)}</td>
                <td>
                  <button className="wf-iconbtn" onClick={() => { setEditing(v); setModalOpen(true); }}><Edit2 size={15} /></button>
                  <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(v.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={6} className="wf-empty-note">Nenhum veículo encontrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && <VeiculoModal clientes={clientes} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Estoque                                                              */
/* ------------------------------------------------------------------ */

function PecaModal({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [codigo, setCodigo] = useState(initial?.codigo || "");
  const [quantidade, setQuantidade] = useState(initial ? String(initial.quantidade) : "");
  const [quantidadeMinima, setQuantidadeMinima] = useState(initial ? String(initial.quantidadeMinima) : "");
  const [preco, setPreco] = useState(initial ? String(initial.preco) : "");
  const [imagem, setImagem] = useState(initial?.imagem || "");
  const pode = nome.trim() && codigo.trim();
  return (
    <Modal title={initial ? "Editar Peça" : "Nova Peça no Estoque"} onClose={onClose} width="440px">
      <Field label="Nome da peça"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Filtro de ar" /></Field>
      <div className="wf-grid2">
        <Field label="Código"><input className="wf-mono" value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="FA-STD" /></Field>
        <Field label="Preço unitário (R$)"><input className="wf-mono" inputMode="decimal" value={preco} onChange={(e) => setPreco(sanitizeDecimal(e.target.value))} placeholder="0,00" /></Field>
        <Field label="Quantidade em estoque"><input className="wf-mono" inputMode="numeric" value={quantidade} onChange={(e) => setQuantidade(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Field>
        <Field label="Quantidade mínima"><input className="wf-mono" inputMode="numeric" value={quantidadeMinima} onChange={(e) => setQuantidadeMinima(e.target.value.replace(/\D/g, ""))} placeholder="0" /></Field>
      </div>
      <Field label="URL da imagem (opcional)">
        <input value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="https://exemplo.com/foto-da-peca.jpg" />
      </Field>
      {imagem && (
        <div className="wf-peca-preview">
          <img src={imagem} alt="Pré-visualização" onError={(e) => { e.currentTarget.style.display = "none"; }} />
        </div>
      )}
      <div className="wf-modal__foot">
        <button
          className="wf-btn wf-btn--accent"
          disabled={!pode}
          onClick={() => onSave({
            id: initial?.id || uid("p"), nome, codigo,
            quantidade: Number(quantidade) || 0,
            quantidadeMinima: Number(quantidadeMinima) || 0,
            preco: Number(preco) || 0,
            imagem: imagem.trim(),
          })}
        >
          {initial ? "Salvar alterações" : "Salvar peça"}
        </button>
      </div>
    </Modal>
  );
}

function EstoqueView({ estoque, ordens, setEstoque }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtrados = estoque.filter((p) => `${p.nome} ${p.codigo}`.toLowerCase().includes(busca.toLowerCase()));
  const handleDelete = (id) => {
    const osVinculadas = ordens.filter((o) => o.itens.some((i) => i.tipo === "peca" && i.pecaId === id)).length;
    const msg = osVinculadas
      ? `Esta peça está usada em ${osVinculadas} ordem(ns) de serviço já registrada(s). Elas manterão o valor e a descrição do item, mas perderão o vínculo com esta peça do estoque. Deseja excluir mesmo assim?`
      : "Remover esta peça do estoque?";
    if (confirm(msg)) setEstoque((prev) => prev.filter((p) => p.id !== id));
  };
  const ajustar = (id, delta) => setEstoque((prev) => prev.map((p) => (p.id === id ? { ...p, quantidade: Math.max(0, p.quantidade + delta) } : p)));
  const handleSave = (p) => {
    if (editing) setEstoque((prev) => prev.map((x) => (x.id === p.id ? p : x)));
    else setEstoque((prev) => [...prev, p]);
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Estoque</p><h1>Peças e Insumos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Nova Peça</button>
      </div>

      <p className="wf-muted" style={{ marginTop: -12, marginBottom: 20, fontSize: 13 }}>
        Peças com foto e preço cadastrados aparecem automaticamente na aba "Estoque" da área do cliente.
      </p>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar por nome ou código..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th></th><th>Código</th><th>Peça</th><th>Quantidade</th><th>Mínimo</th><th>Preço</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((p) => {
              const critico = p.quantidade <= p.quantidadeMinima;
              return (
                <tr key={p.id}>
                  <td>
                    <div className="wf-peca-thumb">
                      {p.imagem ? <img src={p.imagem} alt={p.nome} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : <Package size={16} />}
                    </div>
                  </td>
                  <td className="wf-mono">{p.codigo}</td>
                  <td className="wf-table__strong">{p.nome}</td>
                  <td>
                    <div className="wf-qty">
                      <button onClick={() => ajustar(p.id, -1)}>–</button>
                      <span className={`wf-mono ${critico ? "wf-critico" : ""}`}>{p.quantidade}{critico && <AlertTriangle size={13} />}</span>
                      <button onClick={() => ajustar(p.id, 1)}>+</button>
                    </div>
                  </td>
                  <td className="wf-mono wf-muted">{p.quantidadeMinima}</td>
                  <td className="wf-mono">{fmtBRL(p.preco)}</td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(p); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(p.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              );
            })}
            {filtrados.length === 0 && <tr><td colSpan={7} className="wf-empty-note">Nenhuma peça encontrada.</td></tr>}
          </tbody>
        </table>
      </div>

      {modalOpen && <PecaModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Serviços (catálogo)                                                  */
/* ------------------------------------------------------------------ */

function ServicoModal({ initial, onClose, onSave }) {
  const [nome, setNome] = useState(initial?.nome || "");
  const [categoria, setCategoria] = useState(initial?.categoria || CATEGORIAS_SERVICO[0]);
  const [descricao, setDescricao] = useState(initial?.descricao || "");
  const [preco, setPreco] = useState(initial?.preco ?? "");
  const [duracao, setDuracao] = useState(initial?.duracao || "");
  const pode = nome.trim();
  return (
    <Modal title={initial ? "Editar Serviço" : "Novo Serviço"} onClose={onClose} width="480px">
      <Field label="Nome do serviço"><input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Troca de óleo" /></Field>
      <Field label="Categoria">
        <select className="wf-select" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS_SERVICO.map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field label="Descrição"><textarea rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="O que está incluso neste serviço" /></Field>
      <div className="wf-grid2">
        <Field label="Preço estimado (R$)"><input className="wf-mono" value={preco} onChange={(e) => setPreco(sanitizeDecimal(e.target.value))} placeholder="0,00" /></Field>
        <Field label="Duração estimada"><input value={duracao} onChange={(e) => setDuracao(e.target.value)} placeholder="Ex: 1h30" /></Field>
      </div>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: initial?.id || uid("s"), nome, categoria, descricao, preco: Number(preco) || 0, duracao })}>
          {initial ? "Salvar alterações" : "Salvar serviço"}
        </button>
      </div>
    </Modal>
  );
}

function ServicosView({ servicos, setServicos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const filtrados = servicos.filter((s) => `${s.nome} ${s.categoria}`.toLowerCase().includes(busca.toLowerCase()));
  const handleSave = (s) => {
    if (editing) setServicos((prev) => prev.map((x) => (x.id === s.id ? s : x)));
    else setServicos((prev) => [...prev, s]);
    setModalOpen(false); setEditing(null);
  };
  const handleDelete = (id) => { if (confirm("Excluir este serviço?")) setServicos((prev) => prev.filter((s) => s.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Catálogo</p><h1>Serviços</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Serviço</button>
      </div>
      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar serviço..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>
      <div className="wf-table-wrap">
        <table className="wf-table">
          <thead><tr><th>Serviço</th><th>Categoria</th><th>Preço</th><th>Duração</th><th></th></tr></thead>
          <tbody>
            {filtrados.map((s) => (
              <tr key={s.id}>
                <td className="wf-table__strong">{s.nome}</td>
                <td><Badge>{s.categoria}</Badge></td>
                <td className="wf-mono">{fmtBRL(s.preco)}</td>
                <td className="wf-muted">{s.duracao || "—"}</td>
                <td>
                  <button className="wf-iconbtn" onClick={() => { setEditing(s); setModalOpen(true); }}><Edit2 size={15} /></button>
                  <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(s.id)}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={5} className="wf-empty-note">Nenhum serviço cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>
      {modalOpen && <ServicoModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}

function ServicosGrid({ servicos, limit, onSelect }) {
  const list = limit ? servicos.slice(0, limit) : servicos;
  if (list.length === 0) return <p className="wf-empty-note">Nenhum serviço cadastrado no momento.</p>;
  return (
    <div className="wf-servicos-grid">
      {list.map((s) => (
        <div
          className={`wf-servico-card ${onSelect ? "wf-servico-card--clickable" : ""}`}
          key={s.id}
          onClick={onSelect ? () => onSelect(s.id) : undefined}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onKeyDown={onSelect ? (e) => { if (e.key === "Enter") onSelect(s.id); } : undefined}
        >
          <Badge>{s.categoria}</Badge>
          <h3>{s.nome}</h3>
          <p>{s.descricao || "Consulte a equipe para mais detalhes sobre este serviço."}</p>
          <div className="wf-servico-card__foot">
            <span className="wf-mono">{s.preco ? `a partir de ${fmtBRL(s.preco)}` : "Sob consulta"}</span>
            {s.duracao && <span className="wf-muted">{s.duracao}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Agendamentos                                                         */
/* ------------------------------------------------------------------ */

function AgendamentoFields({ clientes, veiculos, servicos, fixedClienteId, initial, allowNovoVeiculo = true, showStatus = false, submitLabel, onSubmit }) {
  const [clienteId, setClienteId] = useState(fixedClienteId || initial?.clienteId || clientes?.[0]?.id || "");
  const efetivoClienteIdInicial = fixedClienteId || initial?.clienteId || clientes?.[0]?.id || "";
  const veiculosDoClienteInicial = veiculos.filter((v) => v.clienteId === efetivoClienteIdInicial);
  const [veiculoMode, setVeiculoMode] = useState(initial?.veiculoId || veiculosDoClienteInicial.length ? "existing" : (allowNovoVeiculo ? "new" : "existing"));
  const [veiculoId, setVeiculoId] = useState(initial?.veiculoId || veiculosDoClienteInicial[0]?.id || "");
  const [novoVeiculo, setNovoVeiculo] = useState({ placa: "", marca: "", modelo: "", ano: "", cor: "" });
  const [servicoId, setServicoId] = useState(initial?.servicoId || servicos?.[0]?.id || "");
  const [data, setData] = useState(initial?.data || "");
  const [hora, setHora] = useState(initial?.hora || "");
  const [observacoes, setObservacoes] = useState(initial?.observacoes || "");
  const [status, setStatus] = useState(initial?.status || "pendente");

  const efetivoClienteId = fixedClienteId || clienteId;
  const veiculosDoCliente = veiculos.filter((v) => v.clienteId === efetivoClienteId);

  const jaMontou = useRef(false);
  useEffect(() => {
    if (!jaMontou.current) { jaMontou.current = true; return; }
    if (veiculosDoCliente.length) { setVeiculoMode("existing"); setVeiculoId(veiculosDoCliente[0].id); }
    else { setVeiculoMode(allowNovoVeiculo ? "new" : "existing"); setVeiculoId(""); }
    // eslint-disable-next-line
  }, [efetivoClienteId]);

  const podeSalvar = efetivoClienteId && servicoId && data && hora && (veiculoMode === "existing" ? veiculoId : novoVeiculo.placa.trim());

  const handleSubmit = () => {
    if (!podeSalvar) return;
    onSubmit({ clienteId: efetivoClienteId, veiculoMode, veiculoId, novoVeiculo, servicoId, data, hora, observacoes, status });
  };

  return (
    <>
      {!fixedClienteId && clientes && (
        <Field label="Cliente">
          <select className="wf-select" value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
            {clientes.length === 0 && <option value="">Nenhum cliente cadastrado</option>}
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Field>
      )}

      <div className="wf-form-section__head">
        <span>Veículo</span>
        {allowNovoVeiculo && veiculosDoCliente.length > 0 && (
          <div className="wf-toggle">
            <button className={veiculoMode === "existing" ? "active" : ""} onClick={() => setVeiculoMode("existing")}>Existente</button>
            <button className={veiculoMode === "new" ? "active" : ""} onClick={() => setVeiculoMode("new")}>Novo</button>
          </div>
        )}
      </div>
      {veiculoMode === "existing" && veiculosDoCliente.length > 0 ? (
        <select className="wf-select" value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
          {veiculosDoCliente.map((v) => <option key={v.id} value={v.id}>{v.placa} · {v.marca} {v.modelo}</option>)}
        </select>
      ) : allowNovoVeiculo ? (
        <div className="wf-grid3">
          <Field label="Placa"><input value={novoVeiculo.placa} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, placa: e.target.value.toUpperCase() })} /></Field>
          <Field label="Marca"><input value={novoVeiculo.marca} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, marca: e.target.value })} /></Field>
          <Field label="Modelo"><input value={novoVeiculo.modelo} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, modelo: e.target.value })} /></Field>
          <Field label="Ano"><input value={novoVeiculo.ano} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, ano: e.target.value })} /></Field>
          <Field label="Cor"><input value={novoVeiculo.cor} onChange={(e) => setNovoVeiculo({ ...novoVeiculo, cor: e.target.value })} /></Field>
        </div>
      ) : (
        <p className="wf-empty-note">Nenhum veículo disponível. Cadastre um veículo antes de agendar.</p>
      )}

      <Field label="Serviço desejado">
        <select className="wf-select" value={servicoId} onChange={(e) => setServicoId(e.target.value)}>
          {(!servicos || servicos.length === 0) && <option value="">Nenhum serviço disponível</option>}
          {servicos && servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
        </select>
      </Field>
      <div className="wf-grid2">
        <Field label="Data"><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Field>
        <Field label="Horário"><input type="time" value={hora} onChange={(e) => setHora(e.target.value)} /></Field>
      </div>
      <Field label="Observações"><textarea rows={2} value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Detalhes adicionais (opcional)" /></Field>
      {showStatus && (
        <Field label="Status">
          <select className="wf-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {AGENDAMENTO_STATUS_ORDER.map((s) => <option key={s} value={s}>{AGENDAMENTO_STATUS[s].label}</option>)}
          </select>
        </Field>
      )}
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!podeSalvar} onClick={handleSubmit}>{submitLabel}</button>
      </div>
    </>
  );
}

function AgendamentoModal({ clientes, veiculos, servicos, initial, onClose, onSave }) {
  return (
    <Modal title={initial ? "Editar Agendamento" : "Novo Agendamento"} onClose={onClose} width="560px">
      <AgendamentoFields
        clientes={clientes} veiculos={veiculos} servicos={servicos} initial={initial} showStatus={!!initial}
        submitLabel={initial ? "Salvar alterações" : "Criar agendamento"}
        onSubmit={(payload) => onSave(payload, initial)}
      />
    </Modal>
  );
}

function AgendamentosView({ agendamentos, clientes, veiculos, servicos, setAgendamentos, setVeiculos }) {
  const [filtro, setFiltro] = useState("todos");
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome || "—";
  const veiculoPlaca = (id) => veiculos.find((v) => v.id === id)?.placa || "—";
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  const filtrados = agendamentos.filter((a) => {
    if (filtro !== "todos" && a.status !== filtro) return false;
    if (!busca.trim()) return true;
    const alvo = `${clienteNome(a.clienteId)} ${veiculoPlaca(a.veiculoId)} ${servicoNome(a.servicoId)}`.toLowerCase();
    return alvo.includes(busca.toLowerCase());
  }).sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1));

  const handleStatusChange = (id, status) => setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  const handleDelete = (id) => { if (confirm("Excluir este agendamento?")) setAgendamentos((prev) => prev.filter((a) => a.id !== id)); };

  const handleSave = (payload, initial) => {
    let veiculoId = payload.veiculoId;
    if (payload.veiculoMode === "new") {
      const novo = { id: uid("v"), clienteId: payload.clienteId, ...payload.novoVeiculo };
      setVeiculos((prev) => [...prev, novo]);
      veiculoId = novo.id;
    }
    if (initial) {
      setAgendamentos((prev) => prev.map((a) => (a.id === initial.id ? { ...a, clienteId: payload.clienteId, veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: payload.status } : a)));
    } else {
      setAgendamentos((prev) => [{ id: uid("ag"), clienteId: payload.clienteId, veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: "pendente" }, ...prev]);
    }
    setModalOpen(false); setEditing(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Agenda</p><h1>Agendamentos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Agendamento</button>
      </div>
      <div className="wf-toolbar">
        <div className="wf-search"><Search size={16} /><input placeholder="Buscar por cliente, placa ou serviço..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div>
        <div className="wf-pills">
          <button className={`wf-pill ${filtro === "todos" ? "active" : ""}`} onClick={() => setFiltro("todos")}>Todos ({agendamentos.length})</button>
          {AGENDAMENTO_STATUS_ORDER.map((s) => (
            <button key={s} className={`wf-pill ${filtro === s ? "active" : ""}`} style={{ "--pill-color": AGENDAMENTO_STATUS[s].color }} onClick={() => setFiltro(s)}>
              {AGENDAMENTO_STATUS[s].label} ({agendamentos.filter((a) => a.status === s).length})
            </button>
          ))}
        </div>
      </div>
      {filtrados.length === 0 ? <p className="wf-empty-note">Nenhum agendamento encontrado.</p> : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Data</th><th>Horário</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtrados.map((a) => (
                <tr key={a.id}>
                  <td className="wf-table__strong">{clienteNome(a.clienteId)}</td>
                  <td><Plate>{veiculoPlaca(a.veiculoId)}</Plate></td>
                  <td>{servicoNome(a.servicoId)}</td>
                  <td className="wf-mono">{fmtData(a.data)}</td>
                  <td className="wf-mono">{a.hora}</td>
                  <td>
                    <select className="wf-select" style={{ fontSize: 12, padding: "6px 8px" }} value={a.status} onChange={(e) => handleStatusChange(a.id, e.target.value)}>
                      {AGENDAMENTO_STATUS_ORDER.map((s) => <option key={s} value={s}>{AGENDAMENTO_STATUS[s].label}</option>)}
                    </select>
                  </td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(a); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(a.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && <AgendamentoModal clientes={clientes} veiculos={veiculos} servicos={servicos} initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pagamentos                                                           */
/* ------------------------------------------------------------------ */

const FORMAS_PAGAMENTO = ["Dinheiro", "PIX", "Cartão de débito", "Cartão de crédito", "Boleto"];

function totalOS(ordem) { return ordem.itens.reduce((s, i) => s + Number(i.valor || 0), 0); }
function totalPago(ordemId, pagamentos) { return pagamentos.filter((p) => p.ordemId === ordemId).reduce((s, p) => s + Number(p.valor || 0), 0); }

function PagamentoModal({ ordens, clientes, veiculos, pagamentos, onClose, onSave }) {
  const [ordemId, setOrdemId] = useState(ordens[0]?.id || "");
  const [valor, setValor] = useState("");
  const [forma, setForma] = useState(FORMAS_PAGAMENTO[0]);
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));
  const [obs, setObs] = useState("");

  const ordemSel = ordens.find((o) => o.id === ordemId);
  const saldo = ordemSel ? totalOS(ordemSel) - totalPago(ordemSel.id, pagamentos) : 0;
  const pode = ordemId && Number(valor) > 0;

  return (
    <Modal title="Registrar Pagamento" onClose={onClose} width="440px">
      <Field label="Ordem de serviço">
        <select className="wf-select" value={ordemId} onChange={(e) => setOrdemId(e.target.value)}>
          {ordens.length === 0 && <option value="">Nenhuma OS cadastrada</option>}
          {ordens.map((o) => {
            const c = clientes.find((c) => c.id === o.clienteId);
            const v = veiculos.find((v) => v.id === o.veiculoId);
            return <option key={o.id} value={o.id}>{o.numero} · {c?.nome || "—"} · {v?.placa || "—"}</option>;
          })}
        </select>
      </Field>
      {ordemSel && <p className="wf-muted" style={{ fontSize: 12.5, marginTop: -8 }}>Total da OS: {fmtBRL(totalOS(ordemSel))} · Saldo em aberto: {fmtBRL(Math.max(0, saldo))}</p>}
      <div className="wf-grid2">
        <Field label="Valor pago (R$)"><input className="wf-mono" inputMode="decimal" value={valor} onChange={(e) => setValor(sanitizeDecimal(e.target.value))} placeholder="0,00" /></Field>
        <Field label="Forma de pagamento">
          <select className="wf-select" value={forma} onChange={(e) => setForma(e.target.value)}>
            {FORMAS_PAGAMENTO.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Data"><input type="date" value={data} onChange={(e) => setData(e.target.value)} /></Field>
      <Field label="Observações (opcional)"><input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Ex: entrada, pagamento final..." /></Field>
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: uid("pg"), ordemId, valor: Number(valor) || 0, forma, data, obs })}>Registrar pagamento</button>
      </div>
    </Modal>
  );
}

function PagamentosView({ ordens, clientes, veiculos, pagamentos, setPagamentos }) {
  const [busca, setBusca] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const linhas = ordens.map((o) => {
    const total = totalOS(o);
    const pago = totalPago(o.id, pagamentos);
    const saldo = total - pago;
    const status = saldo <= 0 ? "pago" : pago > 0 ? "parcial" : "pendente";
    return { ordem: o, total, pago, saldo, status };
  }).filter((l) => {
    if (!busca.trim()) return true;
    const c = clientes.find((c) => c.id === l.ordem.clienteId);
    const v = veiculos.find((v) => v.id === l.ordem.veiculoId);
    return `${l.ordem.numero} ${c?.nome || ""} ${v?.placa || ""}`.toLowerCase().includes(busca.toLowerCase());
  }).sort((a, b) => (a.ordem.dataEntrada < b.ordem.dataEntrada ? 1 : -1));

  const totalRecebido = pagamentos.reduce((s, p) => s + Number(p.valor || 0), 0);
  const totalEmAberto = linhas.reduce((s, l) => s + Math.max(0, l.saldo), 0);
  const STATUS_PGTO = { pago: { label: "Pago", color: "#3F7D57" }, parcial: { label: "Parcial", color: "#B8860B" }, pendente: { label: "Pendente", color: "#C4441E" } };

  const handleDeletePagamento = (id) => { if (confirm("Excluir este pagamento?")) setPagamentos((prev) => prev.filter((p) => p.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Financeiro</p><h1>Pagamentos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => setModalOpen(true)}><Plus size={18} /> Registrar Pagamento</button>
      </div>

      <div className="wf-stats" style={{ marginBottom: 24 }}>
        <StatCard icon={Wallet} label="Total recebido" value={fmtBRL(totalRecebido)} tone="#3F7D57" />
        <StatCard icon={Receipt} label="Em aberto" value={fmtBRL(totalEmAberto)} tone="#C4441E" />
        <StatCard icon={ClipboardList} label="Ordens de serviço" value={ordens.length} tone="#3C5A6B" />
      </div>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar por nº, cliente ou placa..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      {linhas.length === 0 ? <p className="wf-empty-note">Nenhuma ordem de serviço para exibir.</p> : (
        <div className="wf-msg-list">
          {linhas.map((l) => {
            const c = clientes.find((c) => c.id === l.ordem.clienteId);
            const v = veiculos.find((v) => v.id === l.ordem.veiculoId);
            const pagamentosDaOS = pagamentos.filter((p) => p.ordemId === l.ordem.id).sort((a, b) => (a.data < b.data ? 1 : -1));
            const st = STATUS_PGTO[l.status];
            return (
              <div key={l.ordem.id} className="wf-msg-row">
                <div className="wf-msg-row__head" onClick={() => setExpandedId((prev) => (prev === l.ordem.id ? null : l.ordem.id))}>
                  <div className="wf-msg-row__info">
                    <span className="wf-msg-row__nome">{l.ordem.numero} · {c?.nome || "Cliente removido"}</span>
                    <span className="wf-msg-row__assunto"><Plate>{v?.placa || "—"}</Plate></span>
                  </div>
                  <span className="wf-mono">{fmtBRL(l.total)}</span>
                  <span className="wf-stamp wf-stamp--sm" style={{ color: st.color, borderColor: st.color }}>{st.label}</span>
                </div>
                {expandedId === l.ordem.id && (
                  <div className="wf-msg-row__body">
                    <p className="wf-mono" style={{ margin: "0 0 8px" }}>Pago: {fmtBRL(l.pago)} &nbsp;·&nbsp; Saldo: {fmtBRL(Math.max(0, l.saldo))}</p>
                    {pagamentosDaOS.length === 0 ? <p className="wf-empty-note">Nenhum pagamento registrado para esta OS.</p> : (
                      <div className="wf-table-wrap">
                        <table className="wf-table">
                          <thead><tr><th>Data</th><th>Forma</th><th>Valor</th><th>Obs.</th><th></th></tr></thead>
                          <tbody>
                            {pagamentosDaOS.map((p) => (
                              <tr key={p.id}>
                                <td className="wf-mono">{fmtData(p.data)}</td>
                                <td>{p.forma}</td>
                                <td className="wf-mono">{fmtBRL(p.valor)}</td>
                                <td className="wf-muted">{p.obs || "—"}</td>
                                <td><button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDeletePagamento(p.id)}><Trash2 size={14} /></button></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <PagamentoModal
          ordens={ordens} clientes={clientes} veiculos={veiculos} pagamentos={pagamentos}
          onClose={() => setModalOpen(false)}
          onSave={(p) => { setPagamentos((prev) => [p, ...prev]); setModalOpen(false); }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat de suporte (cliente ↔ admin)                                    */
/* ------------------------------------------------------------------ */

function getConversaDoCliente(conversas, clienteId) { return conversas.find((c) => c.clienteId === clienteId); }
function ultimaMensagem(conversa) { return conversa?.mensagens?.[conversa.mensagens.length - 1]; }

function ChatBubble({ clienteId, clienteNome, conversas, setConversas }) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const conversa = getConversaDoCliente(conversas, clienteId);
  const mensagens = conversa?.mensagens || [];
  const naoLidas = mensagens.filter((m) => m.autor === "admin" && !m.lida).length;

  const marcarLidas = () => {
    if (!conversa) return;
    setConversas((prev) => prev.map((c) => (c.id === conversa.id ? { ...c, mensagens: c.mensagens.map((m) => (m.autor === "admin" ? { ...m, lida: true } : m)) } : c)));
  };

  const toggle = () => { setOpen((v) => { if (!v) marcarLidas(); return !v; }); };

  const enviar = () => {
    if (!texto.trim()) return;
    const nova = { id: uid("msg"), autor: "cliente", texto: texto.trim(), data: new Date().toISOString(), lida: false };
    if (conversa) {
      setConversas((prev) => prev.map((c) => (c.id === conversa.id ? { ...c, mensagens: [...c.mensagens, nova] } : c)));
    } else {
      setConversas((prev) => [...prev, { id: uid("cv"), clienteId, clienteNome, mensagens: [nova] }]);
    }
    setTexto("");
  };

  return (
    <div className="wf-chatbubble-wrap">
      {open && (
        <div className="wf-chatpanel">
          <div className="wf-chatpanel__head">
            <span><MessageCircle size={16} /> Fale com a oficina</span>
            <button className="wf-iconbtn" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <div className="wf-chatpanel__body">
            {mensagens.length === 0 ? (
              <p className="wf-empty-note" style={{ padding: "12px 4px" }}>Envie uma mensagem para tirar dúvidas ou solicitar algo à equipe da oficina.</p>
            ) : mensagens.map((m) => (
              <div key={m.id} className={`wf-chat-msg ${m.autor === "cliente" ? "wf-chat-msg--mine" : ""}`}>
                <p>{m.texto}</p>
                <span>{new Date(m.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            ))}
          </div>
          <div className="wf-chatpanel__foot">
            <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite sua mensagem..." onKeyDown={(e) => { if (e.key === "Enter") enviar(); }} />
            <button className="wf-iconbtn wf-iconbtn--accent" onClick={enviar}><Send size={16} /></button>
          </div>
        </div>
      )}
      <button className="wf-chatbubble" onClick={toggle}>
        <MessageCircle size={22} />
        {naoLidas > 0 && !open && <span className="wf-chatbubble__badge">{naoLidas}</span>}
      </button>
    </div>
  );
}

function AdminChatView({ conversas, setConversas, clientes }) {
  const [selectedId, setSelectedId] = useState(null);
  const [texto, setTexto] = useState("");

  const lista = [...conversas].sort((a, b) => {
    const da = ultimaMensagem(a)?.data || ""; const db = ultimaMensagem(b)?.data || "";
    return da < db ? 1 : -1;
  });
  const selecionada = conversas.find((c) => c.id === selectedId) || null;

  const abrir = (conversa) => {
    setSelectedId(conversa.id);
    setConversas((prev) => prev.map((c) => (c.id === conversa.id ? { ...c, mensagens: c.mensagens.map((m) => (m.autor === "cliente" ? { ...m, lida: true } : m)) } : c)));
  };

  const enviar = () => {
    if (!texto.trim() || !selecionada) return;
    const nova = { id: uid("msg"), autor: "admin", texto: texto.trim(), data: new Date().toISOString(), lida: false };
    setConversas((prev) => prev.map((c) => (c.id === selecionada.id ? { ...c, mensagens: [...c.mensagens, nova] } : c)));
    setTexto("");
  };

  const nomeCliente = (conversa) => clientes.find((c) => c.id === conversa.clienteId)?.nome || conversa.clienteNome || "Cliente";

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Suporte</p><h1>Conversas com Clientes</h1></div></div>
      {lista.length === 0 ? <p className="wf-empty-note">Nenhuma conversa iniciada até o momento.</p> : (
        <div className="wf-chat-wrap">
          <div className="wf-chat-list">
            {lista.map((c) => {
              const ultima = ultimaMensagem(c);
              const naoLidas = c.mensagens.filter((m) => m.autor === "cliente" && !m.lida).length;
              return (
                <button key={c.id} className={`wf-chat-list__item ${selectedId === c.id ? "active" : ""}`} onClick={() => abrir(c)}>
                  <span className="wf-chat-list__nome">{nomeCliente(c)}</span>
                  <span className="wf-chat-list__preview">{ultima?.texto || "—"}</span>
                  {naoLidas > 0 && <span className="wf-chat-list__badge">{naoLidas}</span>}
                </button>
              );
            })}
          </div>
          <div className="wf-chat-thread">
            {!selecionada ? (
              <p className="wf-empty-note">Selecione uma conversa para visualizar.</p>
            ) : (
              <>
                <div className="wf-chat-thread__head">{nomeCliente(selecionada)}</div>
                <div className="wf-chat-thread__body">
                  {selecionada.mensagens.map((m) => (
                    <div key={m.id} className={`wf-chat-msg ${m.autor === "admin" ? "wf-chat-msg--mine" : ""}`}>
                      <p>{m.texto}</p>
                      <span>{new Date(m.data).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  ))}
                </div>
                <div className="wf-chatpanel__foot">
                  <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Responder ao cliente..." onKeyDown={(e) => { if (e.key === "Enter") enviar(); }} />
                  <button className="wf-iconbtn wf-iconbtn--accent" onClick={enviar}><Send size={16} /></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mensagens de contato                                                 */
/* ------------------------------------------------------------------ */

function MensagensView({ mensagens, setMensagens }) {
  const [expandedId, setExpandedId] = useState(null);
  const naoLidas = mensagens.filter((m) => !m.lida).length;
  const ordenadas = [...mensagens].sort((a, b) => (a.data < b.data ? 1 : -1));

  const toggle = (m) => {
    setExpandedId((prev) => (prev === m.id ? null : m.id));
    if (!m.lida) setMensagens((prev) => prev.map((x) => (x.id === m.id ? { ...x, lida: true } : x)));
  };
  const handleDelete = (id) => { if (confirm("Excluir esta mensagem?")) setMensagens((prev) => prev.filter((m) => m.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Contato</p><h1>Mensagens Recebidas</h1></div>
        {naoLidas > 0 && <Badge accent>{naoLidas} não lida{naoLidas > 1 ? "s" : ""}</Badge>}
      </div>
      {ordenadas.length === 0 ? <p className="wf-empty-note">Nenhuma mensagem recebida ainda.</p> : (
        <div className="wf-msg-list">
          {ordenadas.map((m) => (
            <div key={m.id} className={`wf-msg-row ${!m.lida ? "unread" : ""}`}>
              <div className="wf-msg-row__head" onClick={() => toggle(m)}>
                {!m.lida && <span className="wf-msg-dot" />}
                <div className="wf-msg-row__info">
                  <span className="wf-msg-row__nome">{m.nome}</span>
                  <span className="wf-msg-row__assunto">{m.assunto}</span>
                </div>
                <span className="wf-muted wf-mono">{fmtData(m.data)}</span>
                <button className="wf-iconbtn wf-iconbtn--danger" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }}><Trash2 size={15} /></button>
              </div>
              {expandedId === m.id && (
                <div className="wf-msg-row__body">
                  <p>{m.mensagem}</p>
                  <div className="wf-msg-row__contact"><Mail size={13} /> {m.email}{m.telefone && <> · <Phone size={13} /> {m.telefone}</>}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Painel (Dashboard)                                                   */
/* ------------------------------------------------------------------ */

function DashboardView({ ordens, clientes, veiculos, estoque, servicos, agendamentos, mensagens, avaliacoes, onGoTab }) {
  const abertas = ordens.filter((o) => o.status !== "entregue");
  const mesAtual = new Date().toISOString().slice(0, 7);
  const nomeMesAtual = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const faturamento = ordens.filter((o) => o.dataEntrada?.startsWith(mesAtual)).reduce((sum, o) => sum + o.itens.reduce((s, i) => s + Number(i.valor || 0), 0), 0);
  const veiculosNaOficina = new Set(abertas.map((o) => o.veiculoId)).size;
  const critico = estoque.filter((p) => p.quantidade <= p.quantidadeMinima);
  const agendamentosPendentes = agendamentos.filter((a) => a.status === "pendente").length;
  const mensagensNaoLidas = mensagens.filter((m) => !m.lida).length;
  const notaMedia = avaliacoes.length ? (avaliacoes.reduce((s, a) => s + a.nota, 0) / avaliacoes.length) : null;
  const recentes = [...ordens].sort((a, b) => (a.dataEntrada < b.dataEntrada ? 1 : -1)).slice(0, 5);
  const proximos = [...agendamentos].filter((a) => a.status !== "cancelado").sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1)).slice(0, 5);

  const clienteNome = (id) => clientes.find((c) => c.id === id)?.nome || "—";
  const veiculoPlaca = (id) => veiculos.find((v) => v.id === id)?.placa || "—";
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Painel geral</p><h1>Bem-vindo de volta</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => onGoTab("ordens")}><Plus size={18} /> Nova Ordem de Serviço</button>
      </div>

      <div className="wf-stats">
        <StatCard icon={ClipboardList} label="OS em aberto" value={abertas.length} tone="#3C5A6B" />
        <StatCard icon={Wrench} label={`Faturamento de ${nomeMesAtual}`} value={fmtBRL(faturamento)} tone="#B8860B" />
        <StatCard icon={Car} label="Veículos na oficina" value={veiculosNaOficina} tone="#3F7D57" />
        <StatCard icon={PackageX} label="Peças em falta" value={critico.length} tone="#C4441E" />
        <StatCard icon={CalendarClock} label="Agendamentos pendentes" value={agendamentosPendentes} tone="#3C5A6B" />
        <StatCard icon={Inbox} label="Mensagens não lidas" value={mensagensNaoLidas} tone="#C4441E" />
        <StatCard icon={Star} label="Avaliação média" value={notaMedia ? `${notaMedia.toFixed(1)} / 5` : "Sem avaliações"} tone="#B8860B" />
      </div>

      <div className="wf-dash-grid">
        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Últimas ordens de serviço</h2><button className="wf-link" onClick={() => onGoTab("ordens")}>Ver todas <ChevronRight size={14} /></button></div>
          {recentes.length === 0 ? <p className="wf-empty-note">Nenhuma ordem de serviço criada ainda.</p> : (
            <div className="wf-recent-list">
              {recentes.map((o) => (
                <div key={o.id} className="wf-recent-row">
                  <span className="wf-mono wf-recent-row__num">{o.numero}</span>
                  <span className="wf-recent-row__cliente">{clienteNome(o.clienteId)}</span>
                  <Plate>{veiculoPlaca(o.veiculoId)}</Plate>
                  <Stamp status={o.status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Próximos agendamentos</h2><button className="wf-link" onClick={() => onGoTab("agendamentos")}>Ver agenda <ChevronRight size={14} /></button></div>
          {proximos.length === 0 ? <p className="wf-empty-note">Nenhum agendamento pendente.</p> : (
            <div className="wf-recent-list">
              {proximos.map((a) => (
                <div key={a.id} className="wf-recent-row">
                  <span className="wf-recent-row__cliente">{clienteNome(a.clienteId)}</span>
                  <span className="wf-muted">{servicoNome(a.servicoId)}</span>
                  <span className="wf-mono" style={{ marginLeft: "auto" }}>{fmtData(a.data)} {a.hora}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="wf-panel">
          <div className="wf-panel__head"><h2>Estoque crítico</h2><button className="wf-link" onClick={() => onGoTab("estoque")}>Ver estoque <ChevronRight size={14} /></button></div>
          {critico.length === 0 ? <p className="wf-empty-note">Nenhum item abaixo do mínimo.</p> : (
            <div className="wf-recent-list">
              {critico.map((p) => (
                <div key={p.id} className="wf-recent-row">
                  <AlertTriangle size={15} color="#C4441E" />
                  <span className="wf-recent-row__cliente">{p.nome}</span>
                  <span className="wf-mono" style={{ color: "#C4441E", marginLeft: "auto" }}>{p.quantidade}/{p.quantidadeMinima}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell genérica (admin / cliente)                                     */
/* ------------------------------------------------------------------ */

function Shell({ brandSub, navItems, tab, setTab, onLogout, children }) {
  return (
    <div className="wf-root">
      <aside className="wf-sidebar">
        <div className="wf-brand">
          <Wrench size={22} />
          <div><span className="wf-brand__title">Torque</span><span className="wf-brand__sub">{brandSub}</span></div>
        </div>
        <nav className="wf-nav">
          {navItems.map((n) => (
            <button key={n.key} className={`wf-nav__item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
              <n.icon size={18} /><span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="wf-sidebar__foot">
          <button className="wf-nav__item" onClick={onLogout}><LogOut size={18} /><span>Sair</span></button>
        </div>
      </aside>
      <main className="wf-main">{children}</main>
      <nav className="wf-mobilenav">
        {navItems.map((n) => (
          <button key={n.key} className={`wf-mobilenav__item ${tab === n.key ? "active" : ""}`} onClick={() => setTab(n.key)}>
            <n.icon size={18} /><span>{n.label.split(" ")[0]}</span>
          </button>
        ))}
        <button className="wf-mobilenav__item" onClick={onLogout}><LogOut size={18} /><span>Sair</span></button>
      </nav>
    </div>
  );
}

const ADMIN_NAV = [
  { key: "dashboard", label: "Painel", icon: LayoutDashboard },
  { key: "ordens", label: "Ordens de Serviço", icon: ClipboardList },
  { key: "agendamentos", label: "Agendamentos", icon: CalendarClock },
  { key: "servicos", label: "Serviços", icon: Wrench },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "veiculos", label: "Veículos", icon: Car },
  { key: "estoque", label: "Estoque", icon: Package },
  { key: "pagamentos", label: "Pagamentos", icon: Wallet },
  { key: "chat", label: "Chat", icon: MessageCircle },
  { key: "mensagens", label: "Mensagens", icon: Inbox },
];

function AdminArea({ data, setters, onLogout }) {
  const [tab, setTab] = useState("dashboard");
  const { clientes, veiculos, ordens, estoque, servicos, agendamentos, mensagens, pagamentos, conversas, avaliacoes } = data;
  const { setClientes, setVeiculos, setOrdens, setEstoque, setServicos, setAgendamentos, setMensagens, setPagamentos, setConversas, setAvaliacoes } = setters;
  return (
    <Shell brandSub="Painel Administrativo" navItems={ADMIN_NAV} tab={tab} setTab={setTab} onLogout={onLogout}>
      {tab === "dashboard" && <DashboardView ordens={ordens} clientes={clientes} veiculos={veiculos} estoque={estoque} servicos={servicos} agendamentos={agendamentos} mensagens={mensagens} avaliacoes={avaliacoes} onGoTab={setTab} />}
      {tab === "ordens" && <OrdensView ordens={ordens} clientes={clientes} veiculos={veiculos} estoque={estoque} pagamentos={pagamentos} avaliacoes={avaliacoes} setOrdens={setOrdens} setClientes={setClientes} setVeiculos={setVeiculos} setEstoque={setEstoque} setPagamentos={setPagamentos} setAvaliacoes={setAvaliacoes} />}
      {tab === "agendamentos" && <AgendamentosView agendamentos={agendamentos} clientes={clientes} veiculos={veiculos} servicos={servicos} setAgendamentos={setAgendamentos} setVeiculos={setVeiculos} />}
      {tab === "servicos" && <ServicosView servicos={servicos} setServicos={setServicos} />}
      {tab === "clientes" && <ClientesView clientes={clientes} veiculos={veiculos} agendamentos={agendamentos} setClientes={setClientes} setVeiculos={setVeiculos} />}
      {tab === "veiculos" && <VeiculosView veiculos={veiculos} clientes={clientes} ordens={ordens} agendamentos={agendamentos} setVeiculos={setVeiculos} />}
      {tab === "estoque" && <EstoqueView estoque={estoque} ordens={ordens} setEstoque={setEstoque} />}
      {tab === "pagamentos" && <PagamentosView ordens={ordens} clientes={clientes} veiculos={veiculos} pagamentos={pagamentos} setPagamentos={setPagamentos} />}
      {tab === "chat" && <AdminChatView conversas={conversas} setConversas={setConversas} clientes={clientes} />}
      {tab === "mensagens" && <MensagensView mensagens={mensagens} setMensagens={setMensagens} />}
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/* Área do cliente (autenticada)                                        */
/* ------------------------------------------------------------------ */

function ClienteVeiculoModal({ initial, onClose, onSave }) {
  const [placa, setPlaca] = useState(initial?.placa || "");
  const [marca, setMarca] = useState(initial?.marca || "");
  const [modelo, setModelo] = useState(initial?.modelo || "");
  const [ano, setAno] = useState(initial?.ano || "");
  const [cor, setCor] = useState(initial?.cor || "");
  const pode = placa.trim();
  return (
    <Modal title={initial ? "Editar Veículo" : "Novo Veículo"} onClose={onClose} width="440px">
      <VeiculoCampos placa={placa} setPlaca={setPlaca} marca={marca} setMarca={setMarca} modelo={modelo} setModelo={setModelo} ano={ano} setAno={setAno} cor={cor} setCor={setCor} />
      <div className="wf-modal__foot">
        <button className="wf-btn wf-btn--accent" disabled={!pode} onClick={() => onSave({ id: initial?.id || uid("v"), placa, marca, modelo, ano, cor })}>{initial ? "Salvar alterações" : "Salvar veículo"}</button>
      </div>
    </Modal>
  );
}

function ClienteVeiculosView({ veiculos, clienteId, ordens, agendamentos, setVeiculos }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const handleSave = (v) => {
    if (editing) setVeiculos((prev) => prev.map((x) => (x.id === v.id ? { ...v, clienteId } : x)));
    else setVeiculos((prev) => [...prev, { ...v, clienteId }]);
    setModalOpen(false); setEditing(null);
  };
  const handleDelete = (id) => { if (confirmarExclusaoVeiculo(id, ordens, agendamentos)) setVeiculos((prev) => prev.filter((v) => v.id !== id)); };

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Meus dados</p><h1>Meus Veículos</h1></div>
        <button className="wf-btn wf-btn--accent" onClick={() => { setEditing(null); setModalOpen(true); }}><Plus size={18} /> Novo Veículo</button>
      </div>
      {veiculos.length === 0 ? <p className="wf-empty-note">Você ainda não cadastrou nenhum veículo.</p> : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Placa</th><th>Veículo</th><th>Ano</th><th>Cor</th><th></th></tr></thead>
            <tbody>
              {veiculos.map((v) => (
                <tr key={v.id}>
                  <td><Plate>{v.placa}</Plate></td>
                  <td className="wf-table__strong">{v.marca} {v.modelo}</td>
                  <td className="wf-mono">{v.ano}</td>
                  <td>{v.cor}</td>
                  <td>
                    <button className="wf-iconbtn" onClick={() => { setEditing(v); setModalOpen(true); }}><Edit2 size={15} /></button>
                    <button className="wf-iconbtn wf-iconbtn--danger" onClick={() => handleDelete(v.id)}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {modalOpen && <ClienteVeiculoModal initial={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />}
    </div>
  );
}

function ClienteAgendarView({ clienteId, veiculos, servicos, agendamentos, setAgendamentos, onGoVeiculos }) {
  const handleSubmit = (payload) => {
    setAgendamentos((prev) => [{ id: uid("ag"), clienteId, veiculoId: payload.veiculoId, servicoId: payload.servicoId, data: payload.data, hora: payload.hora, observacoes: payload.observacoes, status: "pendente" }, ...prev]);
  };
  const cancelar = (id) => setAgendamentos((prev) => prev.map((a) => (a.id === id ? { ...a, status: "cancelado" } : a)));
  const veiculoPlaca = (id) => veiculos.find((v) => v.id === id)?.placa || "—";
  const servicoNome = (id) => servicos.find((s) => s.id === id)?.nome || "—";

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Solicitação</p><h1>Agendar Serviço</h1></div></div>
      <div className="wf-panel" style={{ maxWidth: 560, marginBottom: 28 }}>
        {veiculos.length === 0 ? (
          <div>
            <p className="wf-empty-note">Cadastre um veículo antes de solicitar um agendamento.</p>
            <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={onGoVeiculos}>Cadastrar veículo</button>
          </div>
        ) : (
          <AgendamentoFields veiculos={veiculos} servicos={servicos} fixedClienteId={clienteId} allowNovoVeiculo={false} submitLabel="Solicitar agendamento" onSubmit={handleSubmit} />
        )}
      </div>
      <h2 className="wf-subhead">Meus agendamentos</h2>
      {agendamentos.length === 0 ? <p className="wf-empty-note">Nenhum agendamento solicitado ainda.</p> : (
        <div className="wf-table-wrap">
          <table className="wf-table">
            <thead><tr><th>Veículo</th><th>Serviço</th><th>Data</th><th>Horário</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {[...agendamentos].sort((a, b) => (a.data + a.hora < b.data + b.hora ? -1 : 1)).map((a) => (
                <tr key={a.id}>
                  <td><Plate>{veiculoPlaca(a.veiculoId)}</Plate></td>
                  <td>{servicoNome(a.servicoId)}</td>
                  <td className="wf-mono">{fmtData(a.data)}</td>
                  <td className="wf-mono">{a.hora}</td>
                  <td><AgStamp status={a.status} size="sm" /></td>
                  <td>{(a.status === "pendente" || a.status === "confirmado") && <button className="wf-link" onClick={() => cancelar(a.id)}>Cancelar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ClienteOrdensView({ ordens, veiculos, cliente, pagamentos, avaliacoes, setAvaliacoes }) {
  const [reciboOrdem, setReciboOrdem] = useState(null);
  const [avaliarOrdem, setAvaliarOrdem] = useState(null);

  const avaliacaoDe = (ordemId) => avaliacoes.find((a) => a.ordemId === ordemId);
  const salvarAvaliacao = ({ nota, comentario }) => {
    setAvaliacoes((prev) => [...prev, { id: uid("av"), ordemId: avaliarOrdem.id, clienteId: cliente?.id || null, nota, comentario, data: new Date().toISOString().slice(0, 10) }]);
    setAvaliarOrdem(null);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Histórico</p><h1>Minhas Ordens de Serviço</h1></div></div>
      {ordens.length === 0 ? <p className="wf-empty-note">Nenhuma ordem de serviço registrada para você ainda.</p> : (
        <div className="wf-ticket-grid">
          {ordens.map((o) => (
            <OSTicket
              key={o.id} ordem={o} veiculo={veiculos.find((v) => v.id === o.veiculoId)}
              onRecibo={setReciboOrdem}
              avaliacao={avaliacaoDe(o.id)}
              onAvaliar={(o.status === "concluido" || o.status === "entregue") ? setAvaliarOrdem : undefined}
              readOnly hideCliente
            />
          ))}
        </div>
      )}
      {reciboOrdem && (
        <ReciboOS
          ordem={reciboOrdem}
          cliente={cliente}
          veiculo={veiculos.find((v) => v.id === reciboOrdem.veiculoId)}
          pagamentos={pagamentos}
          onClose={() => setReciboOrdem(null)}
        />
      )}
      {avaliarOrdem && <AvaliarModal ordem={avaliarOrdem} onClose={() => setAvaliarOrdem(null)} onSave={salvarAvaliacao} />}
    </div>
  );
}

function ClientePerfilView({ cliente, setClientes }) {
  const [nome, setNome] = useState(cliente.nome);
  const [telefone, setTelefone] = useState(cliente.telefone || "");
  const [email, setEmail] = useState(cliente.email || "");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(false);

  const salvar = () => {
    setErro(""); setSalvo(false);
    if (senha && senha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
    setClientes((prev) => prev.map((c) => (c.id === cliente.id ? { ...c, nome: nome.trim(), telefone, email: email.trim(), senha: senha ? senha : c.senha } : c)));
    setSenha(""); setConfirmarSenha(""); setSalvo(true);
  };

  return (
    <div className="wf-view">
      <div className="wf-view__head"><div><p className="wf-eyebrow">Conta</p><h1>Meu Perfil</h1></div></div>
      <div className="wf-panel" style={{ maxWidth: 480 }}>
        <Field label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
        <div className="wf-grid2">
          <Field label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Field>
          <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        </div>
        <div className="wf-grid2">
          <Field label="Nova senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Deixe em branco para manter" /></Field>
          <Field label="Confirmar nova senha"><input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} /></Field>
        </div>
        {erro && <p className="wf-error">{erro}</p>}
        {salvo && <p className="wf-success">Perfil atualizado com sucesso.</p>}
        <button className="wf-btn wf-btn--accent" onClick={salvar}>Salvar alterações</button>
      </div>
    </div>
  );
}

function ClienteEstoqueView({ estoque }) {
  const [busca, setBusca] = useState("");
  const publicaveis = estoque.filter((p) => p.imagem && p.preco > 0);
  const filtrados = publicaveis.filter((p) => `${p.nome} ${p.codigo}`.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="wf-view">
      <div className="wf-view__head">
        <div><p className="wf-eyebrow">Consulta</p><h1>Estoque de Peças</h1></div>
      </div>
      <p className="wf-page-lead" style={{ marginTop: -6 }}>
        Consulte o código e o valor das peças disponíveis na oficina. Para orçar a instalação, solicite um agendamento.
      </p>

      <div className="wf-toolbar"><div className="wf-search"><Search size={16} /><input placeholder="Buscar por nome ou código..." value={busca} onChange={(e) => setBusca(e.target.value)} /></div></div>

      {filtrados.length === 0 ? (
        <p className="wf-empty-note">Nenhuma peça encontrada.</p>
      ) : (
        <div className="wf-peca-grid">
          {filtrados.map((p) => {
            const disponivel = p.quantidade > 0;
            return (
              <div key={p.id} className="wf-peca-card">
                <div className="wf-peca-card__img">
                  {p.imagem ? <img src={p.imagem} alt={p.nome} onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.classList.add("wf-peca-card__img--empty"); }} /> : <Package size={28} />}
                </div>
                <div className="wf-peca-card__body">
                  <span className="wf-mono wf-peca-card__codigo">{p.codigo}</span>
                  <h3>{p.nome}</h3>
                  <div className="wf-peca-card__foot">
                    <span className="wf-mono">{fmtBRL(p.preco)}</span>
                    <Badge accent={disponivel}>{disponivel ? "Disponível" : "Sob consulta"}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const CLIENT_NAV = [
  { key: "veiculos", label: "Meus Veículos", icon: Car },
  { key: "servicos", label: "Serviços", icon: Wrench },
  { key: "estoque", label: "Estoque", icon: Package },
  { key: "agendar", label: "Agendar", icon: CalendarClock },
  { key: "ordens", label: "Minhas OS", icon: ClipboardList },
  { key: "perfil", label: "Meu Perfil", icon: UserCircle },
];

function ClientArea({ clienteId, data, setters, onLogout }) {
  const [tab, setTab] = useState("veiculos");
  const { clientes, veiculos, ordens, servicos, agendamentos, estoque, conversas, pagamentos, avaliacoes } = data;
  const { setClientes, setVeiculos, setAgendamentos, setConversas, setAvaliacoes } = setters;
  const me = clientes.find((c) => c.id === clienteId);

  useEffect(() => { if (!me) onLogout(); }, [me]);
  if (!me) return null;

  const meusVeiculos = veiculos.filter((v) => v.clienteId === clienteId);
  const minhasOrdens = ordens.filter((o) => o.clienteId === clienteId);
  const meusAgendamentos = agendamentos.filter((a) => a.clienteId === clienteId);

  return (
    <>
      <Shell brandSub={`Olá, ${me.nome.split(" ")[0]}`} navItems={CLIENT_NAV} tab={tab} setTab={setTab} onLogout={onLogout}>
        {tab === "veiculos" && <ClienteVeiculosView veiculos={meusVeiculos} clienteId={clienteId} ordens={minhasOrdens} agendamentos={meusAgendamentos} setVeiculos={setVeiculos} />}
        {tab === "servicos" && (
          <div className="wf-view">
            <div className="wf-view__head"><div><p className="wf-eyebrow">Catálogo</p><h1>Serviços Disponíveis</h1></div></div>
            <ServicosGrid servicos={servicos} />
          </div>
        )}
        {tab === "estoque" && <ClienteEstoqueView estoque={estoque} />}
        {tab === "agendar" && <ClienteAgendarView clienteId={clienteId} veiculos={meusVeiculos} servicos={servicos} agendamentos={meusAgendamentos} setAgendamentos={setAgendamentos} onGoVeiculos={() => setTab("veiculos")} />}
        {tab === "ordens" && <ClienteOrdensView ordens={minhasOrdens} veiculos={veiculos} cliente={me} pagamentos={pagamentos} avaliacoes={avaliacoes} setAvaliacoes={setAvaliacoes} />}
        {tab === "perfil" && <ClientePerfilView cliente={me} setClientes={setClientes} />}
      </Shell>
      <ChatBubble clienteId={clienteId} clienteNome={me.nome} conversas={conversas} setConversas={setConversas} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Área pública                                                         */
/* ------------------------------------------------------------------ */

const PUBLIC_PAGES = [
  { key: "home", label: "Início" },
  { key: "servicos", label: "Serviços" },
  { key: "sobre", label: "Sobre" },
  { key: "contato", label: "Contato" },
];

function PublicHeader({ page, setPage }) {
  return (
    <header className="wf-pub-header">
      <button className="wf-pub-brand" onClick={() => setPage("home")}>
        <Wrench size={20} /><span>Torque</span>
      </button>
      <nav className="wf-pub-nav">
        {PUBLIC_PAGES.map((p) => (
          <button key={p.key} className={`wf-pub-nav__item ${page === p.key ? "active" : ""}`} onClick={() => setPage(p.key)}>{p.label}</button>
        ))}
      </nav>
      <div className="wf-pub-header__cta">
        <button className="wf-btn wf-btn--ghost wf-btn--sm" onClick={() => setPage("login")}><LogIn size={15} /> Entrar</button>
        <button className="wf-btn wf-btn--accent wf-btn--sm" onClick={() => setPage("cadastro")}><UserPlus size={15} /> Cadastrar</button>
      </div>
    </header>
  );
}

function PublicFooter() {
  return (
    <footer className="wf-pub-footer">
      <div className="wf-pub-footer__grid">
        <div>
          <div className="wf-pub-brand" style={{ padding: 0, marginBottom: 8 }}><Wrench size={18} /><span>Torque</span></div>
          <p>Manutenção automotiva com transparência, do diagnóstico à entrega.</p>
        </div>
        <div>
          <h4>Contato</h4>
          <p><MapPin size={14} /> {OFICINA_INFO.endereco}</p>
          <p><Phone size={14} /> {OFICINA_INFO.telefone}</p>
          <p><Mail size={14} /> {OFICINA_INFO.email}</p>
        </div>
        <div>
          <h4>Horário</h4>
          <p><Clock size={14} /> {OFICINA_INFO.horario}</p>
        </div>
      </div>
      <div className="wf-pub-footer__bottom">© {new Date().getFullYear()} Torque Gestão de Oficina. Todos os direitos reservados.</div>
    </footer>
  );
}

function HomePage({ servicos, setPage }) {
  return (
    <div>
      <section className="wf-hero">
        <p className="wf-eyebrow" style={{ color: "#F4B400" }}>Oficina multimarcas</p>
        <h1>Seu carro em boas mãos,<br />do diagnóstico à entrega.</h1>
        <p className="wf-hero__lead">Acompanhe cada etapa do serviço: agende, consulte suas ordens de serviço e fale com a equipe sem sair de casa.</p>
        <div className="wf-hero__cta">
          <button className="wf-btn wf-btn--accent" onClick={() => setPage("servicos")}>Ver serviços <ArrowRight size={16} /></button>
          <button className="wf-btn wf-btn--ghost" onClick={() => setPage("cadastro")}>Criar minha conta</button>
        </div>
      </section>

      <section className="wf-section">
        <p className="wf-eyebrow">Por que a Torque</p>
        <h2 className="wf-section__title">Diferenciais da nossa oficina</h2>
        <div className="wf-diff-grid">
          <div className="wf-diff-card"><ShieldCheck size={22} /><h3>Orçamento transparente</h3><p>Você aprova cada item antes de qualquer serviço ser executado.</p></div>
          <div className="wf-diff-card"><Clock size={22} /><h3>Prazo cumprido</h3><p>Acompanhamento de cada ordem de serviço até a entrega do veículo.</p></div>
          <div className="wf-diff-card"><Users size={22} /><h3>Equipe qualificada</h3><p>Mecânicos experientes em manutenção de veículos multimarcas.</p></div>
          <div className="wf-diff-card"><Star size={22} /><h3>Peças de qualidade</h3><p>Componentes de procedência garantida em todo reparo.</p></div>
        </div>
      </section>

      <section className="wf-section">
        <div className="wf-section__head">
          <div><p className="wf-eyebrow">Catálogo</p><h2 className="wf-section__title">Serviços em destaque</h2></div>
          <button className="wf-link" onClick={() => setPage("servicos")}>Ver todos <ChevronRight size={14} /></button>
        </div>
        <ServicosGrid servicos={servicos} limit={3} />
      </section>

      <section className="wf-cta-banner">
        <div><h2>Pronto para agendar?</h2><p>Crie sua conta gratuita e solicite o agendamento do seu veículo em poucos minutos.</p></div>
        <button className="wf-btn wf-btn--accent" onClick={() => setPage("cadastro")}>Criar minha conta <ArrowRight size={16} /></button>
      </section>
    </div>
  );
}

function ServicosPublicPage({ servicos, onSelectServico }) {
  return (
    <div className="wf-section">
      <p className="wf-eyebrow">Catálogo completo</p>
      <h1 className="wf-page-title">Nossos Serviços</h1>
      <p className="wf-page-lead">Conheça os serviços oferecidos pela nossa oficina. Clique em um serviço para ver os detalhes — para agendar, crie sua conta ou faça login.</p>
      <ServicosGrid servicos={servicos} onSelect={onSelectServico} />
    </div>
  );
}

function ServicoDetalhePage({ servico, onVoltar, setPage }) {
  if (!servico) {
    return (
      <div className="wf-section">
        <button className="wf-link" onClick={onVoltar}><ArrowLeft size={14} /> Voltar aos serviços</button>
        <p className="wf-empty-note">Este serviço não está mais disponível.</p>
      </div>
    );
  }
  return (
    <div className="wf-section" style={{ maxWidth: 720 }}>
      <button className="wf-link" onClick={onVoltar}><ArrowLeft size={14} /> Voltar aos serviços</button>
      <p className="wf-eyebrow" style={{ marginTop: 20 }}>{servico.categoria}</p>
      <h1 className="wf-page-title">{servico.nome}</h1>
      <p className="wf-page-lead">{servico.descricao || "Consulte a equipe para mais detalhes sobre este serviço."}</p>
      <div className="wf-panel" style={{ maxWidth: 420, marginBottom: 24 }}>
        <div className="wf-detalhe-row"><span>Preço estimado</span><strong className="wf-mono">{servico.preco ? fmtBRL(servico.preco) : "Sob consulta"}</strong></div>
        <div className="wf-detalhe-row"><span>Duração estimada</span><strong>{servico.duracao || "A combinar"}</strong></div>
      </div>
      <button className="wf-btn wf-btn--accent" onClick={() => setPage("cadastro")}>Agendar este serviço <ArrowRight size={16} /></button>
    </div>
  );
}

function SobrePage() {
  return (
    <div className="wf-section">
      <p className="wf-eyebrow">Institucional</p>
      <h1 className="wf-page-title">Sobre a Torque</h1>
      <p className="wf-page-lead">Cuidamos de veículos com a mesma atenção que teríamos com os nossos. Combinamos experiência mecânica com um jeito organizado de trabalhar: toda ordem de serviço é registrada, todo orçamento é aprovado antes de começar, e você acompanha o andamento de perto.</p>
      <div className="wf-diff-grid">
        <div className="wf-diff-card"><Wrench size={22} /><h3>Estrutura completa</h3><p>Bancadas equipadas para elétrica, suspensão, freios e revisões programadas.</p></div>
        <div className="wf-diff-card"><Users size={22} /><h3>Equipe própria</h3><p>Mecânicos fixos, sem terceirização, para manter o padrão de qualidade em cada serviço.</p></div>
        <div className="wf-diff-card"><ShieldCheck size={22} /><h3>Garantia nos serviços</h3><p>Reparos executados com garantia de mão de obra e peças utilizadas.</p></div>
      </div>
      <div className="wf-panel" style={{ marginTop: 28, maxWidth: 520 }}>
        <h4 style={{ marginTop: 0 }}>Endereço e horário</h4>
        <p className="wf-contact"><MapPin size={14} /> {OFICINA_INFO.endereco}</p>
        <p className="wf-contact"><Clock size={14} /> {OFICINA_INFO.horario}</p>
        <p className="wf-contact"><Phone size={14} /> {OFICINA_INFO.telefone}</p>
      </div>
    </div>
  );
}

function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const pode = nome.trim() && email.trim() && mensagem.trim();

  const enviar = async () => {
    if (!pode) return;
    setErro(""); setEnviando(true);
    try {
      await apiEnviarMensagemContato({ nome, email, telefone, assunto, mensagem });
      setEnviado(true); setNome(""); setEmail(""); setTelefone(""); setAssunto(""); setMensagem("");
    } catch (err) {
      setErro(err.message || "Não foi possível enviar sua mensagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="wf-section">
      <p className="wf-eyebrow">Fale conosco</p>
      <h1 className="wf-page-title">Contato</h1>
      <div className="wf-contato-grid">
        <div className="wf-panel">
          {enviado && <p className="wf-success">Mensagem enviada! Retornaremos em breve.</p>}
          {erro && <p className="wf-error">{erro}</p>}
          <Field label="Nome"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
          <div className="wf-grid2">
            <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
            <Field label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Field>
          </div>
          <Field label="Assunto"><input value={assunto} onChange={(e) => setAssunto(e.target.value)} /></Field>
          <Field label="Mensagem"><textarea rows={4} value={mensagem} onChange={(e) => setMensagem(e.target.value)} /></Field>
          <button className="wf-btn wf-btn--accent" disabled={!pode || enviando} onClick={enviar}>{enviando ? "Enviando..." : "Enviar mensagem"}</button>
        </div>
        <div className="wf-panel">
          <h4 style={{ marginTop: 0 }}>Outros canais</h4>
          <p className="wf-contact"><MapPin size={14} /> {OFICINA_INFO.endereco}</p>
          <p className="wf-contact"><Phone size={14} /> {OFICINA_INFO.telefone}</p>
          <p className="wf-contact"><Mail size={14} /> {OFICINA_INFO.email}</p>
          <p className="wf-contact"><Clock size={14} /> {OFICINA_INFO.horario}</p>
        </div>
      </div>
    </div>
  );
}

function LoginPage({ setPage, onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const entrar = async () => {
    setErro("");
    if (!email.trim() || !senha) { setErro("Informe e-mail e senha."); return; }
    setCarregando(true);
    try {
      const resultado = await apiLogin(email.trim(), senha);
      setToken(resultado.token);
      onLogin({ type: resultado.type, id: resultado.id });
    } catch (err) {
      setErro(err.message || "E-mail ou senha inválidos.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Entrar</h1>
        <p className="wf-muted" style={{ marginBottom: 18 }}>Acesse sua conta ou o painel administrativo.</p>
        <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} /></Field>
        {erro && <p className="wf-error">{erro}</p>}
        <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={entrar} disabled={carregando}>{carregando ? "Entrando..." : "Entrar"}</button>
        <p className="wf-authcard__switch">Não tem conta? <button onClick={() => setPage("cadastro")}>Cadastre-se</button></p>
      </div>
    </div>
  );
}

function CadastroPage({ adicionarClienteLocal, setPage, onLogin }) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const cadastrar = async () => {
    setErro("");
    if (!nome.trim() || !email.trim() || !senha) { setErro("Preencha todos os campos obrigatórios."); return; }
    if (senha !== confirmarSenha) { setErro("As senhas não coincidem."); return; }
    setCarregando(true);
    try {
      const resultado = await apiRegistrarCliente({ nome: nome.trim(), email: email.trim(), telefone, senha });
      setToken(resultado.token);
      adicionarClienteLocal(resultado.cliente);
      onLogin({ type: "cliente", id: resultado.id });
    } catch (err) {
      setErro(err.message || "Não foi possível criar sua conta.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Criar conta</h1>
        <p className="wf-muted" style={{ marginBottom: 18 }}>Cadastre-se para agendar serviços e acompanhar seu veículo.</p>
        <Field label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
        <Field label="E-mail"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Telefone"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} /></Field>
        <div className="wf-grid2">
          <Field label="Senha"><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} /></Field>
          <Field label="Confirmar senha"><input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} /></Field>
        </div>
        {erro && <p className="wf-error">{erro}</p>}
        <button className="wf-btn wf-btn--accent" style={{ width: "100%", justifyContent: "center" }} onClick={cadastrar} disabled={carregando}>{carregando ? "Criando conta..." : "Criar conta"}</button>
        <p className="wf-authcard__switch">Já tem conta? <button onClick={() => setPage("login")}>Entrar</button></p>
      </div>
    </div>
  );
}

function PublicSite({ servicos, adicionarClienteLocal, onLogin }) {
  const [page, setPage] = useState("home");
  const [servicoDetalheId, setServicoDetalheId] = useState(null);
  const abrirDetalheServico = (id) => { setServicoDetalheId(id); setPage("servico-detalhe"); };
  const servicoSelecionado = servicos.find((s) => s.id === servicoDetalheId) || null;

  return (
    <div className="wf-pub">
      <PublicHeader page={page} setPage={setPage} />
      <main className="wf-pub-main">
        {page === "home" && <HomePage servicos={servicos} setPage={setPage} />}
        {page === "servicos" && <ServicosPublicPage servicos={servicos} onSelectServico={abrirDetalheServico} />}
        {page === "servico-detalhe" && <ServicoDetalhePage servico={servicoSelecionado} onVoltar={() => setPage("servicos")} setPage={setPage} />}
        {page === "sobre" && <SobrePage />}
        {page === "contato" && <ContatoPage />}
        {page === "login" && <LoginPage setPage={setPage} onLogin={onLogin} />}
        {page === "cadastro" && <CadastroPage adicionarClienteLocal={adicionarClienteLocal} setPage={setPage} onLogin={onLogin} />}
      </main>
      <PublicFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* App raiz                                                             */
/* ------------------------------------------------------------------ */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [session, setSessionState] = useState(null);
  const [clientes, setClientesState] = useState([]);
  const [veiculos, setVeiculosState] = useState([]);
  const [ordens, setOrdensState] = useState([]);
  const [estoque, setEstoqueState] = useState([]);
  const [servicos, setServicosState] = useState([]);
  const [agendamentos, setAgendamentosState] = useState([]);
  const [mensagens, setMensagensState] = useState([]);
  const [pagamentos, setPagamentosState] = useState([]);
  const [conversas, setConversasState] = useState([]);
  const [avaliacoes, setAvaliacoesState] = useState([]);

  useEffect(() => {
    (async () => {
      const [c, v, o, e, s, ag, m, pg, cv, av, sess] = await Promise.all([
        loadOrSeed("oficina:clientes", []),
        loadOrSeed("oficina:veiculos", []),
        loadOrSeed("oficina:ordens", []),
        loadOrSeed("oficina:estoque", []),
        loadOrSeed("oficina:servicos", []),
        loadOrSeed("oficina:agendamentos", []),
        loadOrSeed("oficina:mensagens", []),
        loadOrSeed("oficina:pagamentos", []),
        loadOrSeed("oficina:conversas", []),
        loadOrSeed("oficina:avaliacoes", []),
        loadSession(),
      ]);
      setClientesState(c); setVeiculosState(v); setOrdensState(o); setEstoqueState(e);
      setServicosState(s); setAgendamentosState(ag); setMensagensState(m);
      setPagamentosState(pg); setConversasState(cv); setAvaliacoesState(av);
      setSessionState(sess);
      setLoading(false);
    })();
  }, []);

  const makeSetter = (key, setState) => (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(key, next);
      return next;
    });
  };
  const setClientes = makeSetter("oficina:clientes", setClientesState);
  const setVeiculos = makeSetter("oficina:veiculos", setVeiculosState);
  const setOrdens = makeSetter("oficina:ordens", setOrdensState);
  const setEstoque = makeSetter("oficina:estoque", setEstoqueState);
  const setServicos = makeSetter("oficina:servicos", setServicosState);
  const setAgendamentos = makeSetter("oficina:agendamentos", setAgendamentosState);
  const setMensagens = makeSetter("oficina:mensagens", setMensagensState);
  const setPagamentos = makeSetter("oficina:pagamentos", setPagamentosState);
  const setConversas = makeSetter("oficina:conversas", setConversasState);
  const setAvaliacoes = makeSetter("oficina:avaliacoes", setAvaliacoesState);

  const handleLogin = (sess) => { setSessionState(sess); };
  const handleLogout = () => { apiLogout(); setToken(null); setSessionState(null); };
  // Usado só pelo autocadastro público: reflete o cliente recém-criado no
  // estado local sem tentar regravar a lista inteira (o PUT /api/clientes
  // agora é exclusivo do admin — o registro já foi salvo pelo endpoint
  // dedicado /api/registrar-cliente).
  const adicionarClienteLocal = (novo) => setClientesState((prev) => [...prev, novo]);

  useEffect(() => { aoPerderSessao = () => { setToken(null); setSessionState(null); }; }, []);

  if (loading) {
    return (
      <div className="wf-root wf-root--loading">
        <Style />
        <Loader2 className="wf-spin" size={28} />
        <p>Abrindo a oficina...</p>
      </div>
    );
  }

  const data = { clientes, veiculos, ordens, estoque, servicos, agendamentos, mensagens, pagamentos, conversas, avaliacoes };
  const setters = { setClientes, setVeiculos, setOrdens, setEstoque, setServicos, setAgendamentos, setMensagens, setPagamentos, setConversas, setAvaliacoes };

  return (
    <>
      <Style />
      {!session && <PublicSite servicos={servicos} adicionarClienteLocal={adicionarClienteLocal} onLogin={handleLogin} />}
      {session?.type === "admin" && <AdminArea data={data} setters={setters} onLogout={handleLogout} />}
      {session?.type === "cliente" && <ClientArea clienteId={session.id} data={data} setters={setters} onLogout={handleLogout} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                              */
/* ------------------------------------------------------------------ */

function Style() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');

      * { box-sizing: border-box; }
      .wf-root, .wf-pub {
        --bg: #EDEBE3; --surface: #FFFFFF; --ink: #17181A; --ink-soft: #5B5A53;
        --accent: #F4B400; --steel: #3C5A6B; --rust: #C4441E; --green: #3F7D57;
        --line: #DAD5C7; --line-strong: #C7C1B0;
        font-family: 'Inter', sans-serif; color: var(--ink); background: var(--bg);
      }
      .wf-root { min-height: 100vh; display: flex; width: 100%; }
      .wf-root--loading { align-items: center; justify-content: center; flex-direction: column; gap: 12px; color: var(--ink-soft); }
      .wf-spin { animation: wf-spin 1s linear infinite; }
      @keyframes wf-spin { to { transform: rotate(360deg); } }
      .wf-mono { font-family: 'IBM Plex Mono', monospace; }
      .wf-muted { color: var(--ink-soft); font-size: 12.5px; }
      .wf-error { color: var(--rust); font-size: 12.5px; margin: -4px 0 12px; }
      .wf-success { color: var(--green); font-size: 12.5px; margin: -4px 0 12px; font-weight: 600; }

      /* Sidebar (admin / cliente) */
      .wf-sidebar { width: 232px; background: var(--ink); color: #EDEBE3; flex-shrink: 0; display: flex; flex-direction: column; padding: 22px 16px; position: sticky; top: 0; height: 100vh; }
      .wf-brand { display: flex; align-items: center; gap: 10px; padding: 0 6px 24px; color: var(--accent); }
      .wf-brand__title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 1px; display: block; line-height: 1; color: #fff; }
      .wf-brand__sub { font-family: 'Oswald', sans-serif; font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #A6A398; display: block; margin-top: 2px; }
      .wf-nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
      .wf-nav__item { display: flex; align-items: center; gap: 11px; padding: 10px 12px; border-radius: 6px; background: transparent; border: none; color: #C7C4B8; font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 0.3px; text-align: left; cursor: pointer; transition: background .15s, color .15s; }
      .wf-nav__item:hover { background: rgba(255,255,255,0.06); color: #fff; }
      .wf-nav__item.active { background: var(--accent); color: var(--ink); font-weight: 600; }
      .wf-sidebar__foot { border-top: 1px solid rgba(255,255,255,0.12); padding-top: 10px; }

      .wf-main { flex: 1; padding: 34px 40px 60px; min-width: 0; }
      .wf-view__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 26px; flex-wrap: wrap; }
      .wf-eyebrow { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 2px; font-size: 11px; color: var(--steel); margin: 0 0 4px; font-weight: 600; }
      .wf-view h1 { font-family: 'Bebas Neue', sans-serif; font-size: 38px; letter-spacing: 0.5px; margin: 0; line-height: 1; }
      .wf-panel h2 { font-family: 'Oswald', sans-serif; font-size: 16px; margin: 0; letter-spacing: 0.2px; }
      .wf-subhead { font-family: 'Oswald', sans-serif; font-size: 15px; margin: 0 0 12px; }

      .wf-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 18px; border-radius: 7px; border: none; font-family: 'Oswald', sans-serif; font-size: 13.5px; font-weight: 600; letter-spacing: 0.4px; cursor: pointer; transition: transform .1s, box-shadow .15s; white-space: nowrap; }
      .wf-btn--accent { background: var(--accent); color: var(--ink); box-shadow: 0 2px 0 #B8860B; }
      .wf-btn--accent:hover { transform: translateY(-1px); }
      .wf-btn--accent:active { transform: translateY(1px); box-shadow: 0 1px 0 #B8860B; }
      .wf-btn--accent:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
      .wf-btn--ghost { background: transparent; border: 1.5px dashed var(--line-strong); color: var(--ink-soft); }
      .wf-btn--ghost:hover { border-color: var(--steel); color: var(--steel); }
      .wf-btn--sm { padding: 7px 12px; font-size: 12.5px; }
      .wf-link { background: none; border: none; color: var(--steel); font-family: 'Oswald', sans-serif; font-size: 12.5px; font-weight: 600; display: flex; align-items: center; gap: 3px; cursor: pointer; }
      .wf-iconbtn { background: transparent; border: none; color: var(--ink-soft); padding: 6px; border-radius: 6px; cursor: pointer; display: inline-flex; }
      .wf-iconbtn:hover { background: rgba(0,0,0,0.06); }
      .wf-iconbtn--danger:hover { background: rgba(196,68,30,0.12); color: var(--rust); }
      .wf-iconbtn--accent { background: var(--accent); color: var(--ink); flex-shrink: 0; }
      .wf-iconbtn--accent:hover { background: var(--accent); opacity: 0.85; }

      .wf-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-bottom: 28px; }
      .wf-stat { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 12px; }
      .wf-stat__icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; }
      .wf-stat__value { font-family: 'Bebas Neue', sans-serif; font-size: 22px; line-height: 1; }
      .wf-stat__label { font-size: 12px; color: var(--ink-soft); margin-top: 3px; }

      .wf-dash-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; }
      .wf-panel { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 18px 20px; }
      .wf-panel__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
      .wf-recent-list { display: flex; flex-direction: column; gap: 2px; }
      .wf-recent-row { display: flex; align-items: center; gap: 10px; padding: 9px 4px; border-bottom: 1px solid var(--line); font-size: 13px; }
      .wf-recent-row:last-child { border-bottom: none; }
      .wf-recent-row__num { color: var(--steel); font-size: 12px; }
      .wf-recent-row__cliente { flex: 1; }
      .wf-empty-note { color: var(--ink-soft); font-size: 13.5px; padding: 20px 4px; }

      .wf-toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
      .wf-search { display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 9px 12px; max-width: 340px; color: var(--ink-soft); }
      .wf-search input { border: none; outline: none; background: transparent; font-size: 13.5px; width: 100%; color: var(--ink); font-family: 'Inter', sans-serif; }
      .wf-pills { display: flex; gap: 8px; flex-wrap: wrap; }
      .wf-pill { --pill-color: var(--steel); background: var(--surface); border: 1.5px solid var(--line); padding: 7px 13px; border-radius: 999px; font-size: 12.5px; font-family: 'Oswald', sans-serif; font-weight: 600; color: var(--ink-soft); cursor: pointer; letter-spacing: 0.2px; }
      .wf-pill.active { border-color: var(--pill-color); color: var(--pill-color); background: color-mix(in srgb, var(--pill-color) 10%, white); }

      .wf-ticket-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
      .wf-ticket { background: var(--surface); border: 1px solid var(--line); border-radius: 4px; padding: 16px 16px 14px; position: relative; box-shadow: 0 1px 0 var(--line-strong); }
      .wf-ticket__perf { display: flex; justify-content: space-between; margin: -16px -16px 12px; padding: 0 14px; height: 8px; border-bottom: 1.5px dashed var(--line-strong); }
      .wf-ticket__hole { width: 8px; height: 8px; border-radius: 50%; background: var(--bg); border: 1px solid var(--line-strong); transform: translateY(-50%); margin-top: 4px; }
      .wf-ticket__top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
      .wf-ticket__num { font-size: 13px; font-weight: 600; color: var(--ink-soft); }
      .wf-ticket__cliente { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
      .wf-ticket__veiculo { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--ink-soft); margin-bottom: 10px; }
      .wf-ticket__desc { font-size: 13px; color: var(--ink-soft); margin: 0 0 12px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px; }
      .wf-ticket__meta { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: var(--ink-soft); border-top: 1px dashed var(--line); padding-top: 10px; margin-bottom: 10px; }
      .wf-ticket__meta span { display: flex; align-items: center; gap: 6px; }
      .wf-ticket__footer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
      .wf-ticket__total { margin-left: auto; font-weight: 600; font-size: 14px; }
      .wf-select--ticket { flex: 1; min-width: 0; font-size: 11.5px; padding: 6px 8px; }

      .wf-stamp { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; font-size: 10px; padding: 4px 8px; border: 1.5px solid; border-radius: 3px; transform: rotate(-3deg); white-space: nowrap; background: rgba(255,255,255,0.6); }
      .wf-stamp--sm { font-size: 9.5px; padding: 3px 6px; }
      .wf-plate { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 12px; letter-spacing: 1px; border: 1.5px solid var(--ink); border-radius: 3px; padding: 2px 7px; background: #fff; display: inline-block; }
      .wf-badge { font-family: 'Oswald', sans-serif; font-size: 10.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: var(--bg); border: 1px solid var(--line-strong); color: var(--ink-soft); padding: 4px 9px; border-radius: 999px; display: inline-block; }
      .wf-badge--accent { background: var(--accent); color: var(--ink); border-color: var(--accent); }

      .wf-modal-veil { position: fixed; inset: 0; background: rgba(23,24,26,0.55); display: flex; align-items: flex-start; justify-content: center; padding: 40px 20px; overflow-y: auto; z-index: 50; }
      .wf-modal { background: var(--surface); border-radius: 12px; width: 100%; max-width: 520px; max-height: calc(100vh - 80px); display: flex; flex-direction: column; }
      .wf-modal__head { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; border-bottom: 1px solid var(--line); }
      .wf-modal__head h3 { font-family: 'Oswald', sans-serif; font-size: 17px; margin: 0; }
      .wf-modal__body { padding: 20px 22px; overflow-y: auto; flex: 1; min-height: 0; }
      .wf-modal__foot { display: flex; align-items: center; justify-content: flex-end; gap: 16px; margin-top: 6px; padding-top: 16px; border-top: 1px solid var(--line); }
      .wf-modal__total { font-weight: 600; font-size: 14.5px; margin-right: auto; }

      .wf-form-section { margin-bottom: 20px; padding-bottom: 18px; border-bottom: 1px dashed var(--line); }
      .wf-form-section:last-of-type { border-bottom: none; }
      .wf-form-section__head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; margin-top: 4px; }
      .wf-form-section__head > span { font-family: 'Oswald', sans-serif; font-size: 12.5px; text-transform: uppercase; letter-spacing: 1px; color: var(--steel); font-weight: 600; }
      .wf-toggle { display: flex; background: var(--bg); border-radius: 6px; padding: 2px; }
      .wf-toggle button { border: none; background: transparent; font-family: 'Oswald', sans-serif; font-size: 11.5px; font-weight: 600; padding: 5px 10px; border-radius: 5px; cursor: pointer; color: var(--ink-soft); }
      .wf-toggle button.active { background: var(--surface); color: var(--ink); box-shadow: 0 1px 2px rgba(0,0,0,0.1); }

      .wf-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; font-size: 12.5px; color: var(--ink-soft); font-family: 'Oswald', sans-serif; font-weight: 500; }
      .wf-field input, .wf-field textarea, .wf-field select { font-family: 'Inter', sans-serif; }
      .wf-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .wf-grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

      input, textarea, select { border: 1.5px solid var(--line); border-radius: 7px; padding: 9px 11px; font-size: 13.5px; color: var(--ink); background: var(--surface); outline: none; width: 100%; transition: border-color .15s; }
      input:focus, textarea:focus, select:focus { border-color: var(--steel); }
      textarea { resize: vertical; font-family: 'Inter', sans-serif; }
      .wf-select { cursor: pointer; }

      .wf-itens { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
      .wf-item-row { display: grid; grid-template-columns: 1fr 110px auto; gap: 8px; align-items: center; }
      .wf-item-row-block { border: 1px solid var(--line); border-radius: 8px; padding: 10px; margin-bottom: 8px; background: var(--bg); }
      .wf-item-row-block .wf-item-row { grid-template-columns: 1fr 90px 100px auto; background: transparent; border: none; padding: 0; margin: 0; }
      .wf-item-row-block__tipo { display: flex; gap: 6px; margin-bottom: 8px; }
      .wf-item-row-block__tipo button { border: 1px solid var(--line); background: var(--surface); font-size: 11px; font-weight: 600; padding: 4px 9px; border-radius: 5px; cursor: pointer; color: var(--ink-soft); font-family: 'Oswald', sans-serif; }
      .wf-item-row-block__tipo button.active { background: var(--accent); color: var(--ink); border-color: var(--accent); }
      .wf-item-row__qtd { text-align: center; }
      .wf-item-row__subtotal { text-align: right; font-weight: 600; }
      .wf-warn-note { display: flex; align-items: center; gap: 5px; color: var(--rust); font-size: 11.5px; margin: 6px 0 0; }

      .wf-chatbubble-wrap { position: fixed; right: 24px; bottom: 24px; z-index: 60; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
      .wf-chatbubble { width: 54px; height: 54px; border-radius: 50%; background: var(--accent); color: var(--ink); border: none; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,0.25); cursor: pointer; position: relative; }
      .wf-chatbubble__badge { position: absolute; top: -4px; right: -4px; background: var(--rust); color: #fff; font-size: 10.5px; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
      .wf-chatpanel { width: 300px; max-width: calc(100vw - 48px); height: 380px; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); display: flex; flex-direction: column; overflow: hidden; }
      .wf-chatpanel__head { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--ink); color: #fff; font-family: 'Oswald', sans-serif; font-size: 13px; }
      .wf-chatpanel__head span { display: flex; align-items: center; gap: 6px; }
      .wf-chatpanel__head .wf-iconbtn { color: #fff; }
      .wf-chatpanel__body { flex: 1; overflow-y: auto; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
      .wf-chatpanel__foot { display: flex; gap: 8px; padding: 10px; border-top: 1px solid var(--line); }
      .wf-chatpanel__foot input { flex: 1; border: 1px solid var(--line); border-radius: 6px; padding: 8px 10px; font-size: 13px; }

      .wf-chat-msg { max-width: 82%; background: var(--bg); border-radius: 10px; padding: 8px 11px; align-self: flex-start; }
      .wf-chat-msg p { margin: 0 0 3px; font-size: 13px; line-height: 1.4; }
      .wf-chat-msg span { font-size: 10px; color: var(--ink-soft); }
      .wf-chat-msg--mine { align-self: flex-end; background: var(--accent); }

      .wf-chat-wrap { display: flex; gap: 18px; height: 560px; }
      .wf-chat-list { width: 260px; flex-shrink: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
      .wf-chat-list__item { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; text-align: left; background: var(--surface); border: 1px solid var(--line); border-radius: 8px; padding: 10px 12px; cursor: pointer; position: relative; }
      .wf-chat-list__item.active { border-color: var(--accent); background: #FFF8E8; }
      .wf-chat-list__nome { font-weight: 600; font-size: 13.5px; }
      .wf-chat-list__preview { font-size: 12px; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
      .wf-chat-list__badge { position: absolute; top: 8px; right: 10px; background: var(--rust); color: #fff; font-size: 10px; font-weight: 700; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; }
      .wf-chat-thread { flex: 1; background: var(--surface); border: 1px solid var(--line); border-radius: 10px; display: flex; flex-direction: column; overflow: hidden; }
      .wf-chat-thread__head { padding: 12px 16px; border-bottom: 1px solid var(--line); font-family: 'Oswald', sans-serif; font-weight: 600; }
      .wf-chat-thread__body { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 8px; }


      .wf-table-wrap { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; overflow-x: auto; }
      .wf-table { width: 100%; min-width: 620px; border-collapse: collapse; font-size: 13.5px; }
      .wf-table th { text-align: left; font-family: 'Oswald', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ink-soft); background: var(--bg); padding: 11px 16px; border-bottom: 1px solid var(--line); white-space: nowrap; }
      .wf-table td { padding: 12px 16px; border-bottom: 1px solid var(--line); vertical-align: middle; }
      .wf-table tr:last-child td { border-bottom: none; }
      .wf-table__strong { font-weight: 600; }
      .wf-contact { display: flex; align-items: center; gap: 6px; font-size: 12.5px; color: var(--ink-soft); }
      .wf-critico { color: var(--rust); display: inline-flex; align-items: center; gap: 4px; font-weight: 600; }
      .wf-qty { display: inline-flex; align-items: center; gap: 8px; }
      .wf-qty button { width: 22px; height: 22px; border-radius: 5px; border: 1px solid var(--line-strong); background: var(--bg); cursor: pointer; font-size: 14px; line-height: 1; display: flex; align-items: center; justify-content: center; padding: 0; }

      .wf-msg-list { display: flex; flex-direction: column; gap: 8px; }
      .wf-msg-row { background: var(--surface); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
      .wf-msg-row.unread { border-color: var(--accent); }
      .wf-msg-row__head { display: flex; align-items: center; gap: 10px; padding: 13px 16px; cursor: pointer; }
      .wf-msg-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--rust); flex-shrink: 0; }
      .wf-msg-row__info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
      .wf-msg-row__nome { font-weight: 600; font-size: 13.5px; }
      .wf-msg-row.unread .wf-msg-row__nome { font-weight: 700; }
      .wf-msg-row__assunto { font-size: 12.5px; color: var(--ink-soft); }
      .wf-msg-row__body { padding: 0 16px 16px 16px; font-size: 13.5px; color: var(--ink-soft); border-top: 1px dashed var(--line); }
      .wf-msg-row__body p { margin: 12px 0; line-height: 1.5; }
      .wf-msg-row__contact { display: flex; align-items: center; gap: 6px; font-size: 12px; }

      .wf-servicos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
      .wf-servico-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 18px; display: flex; flex-direction: column; gap: 8px; }
      .wf-servico-card h3 { font-family: 'Oswald', sans-serif; font-size: 16px; margin: 2px 0 0; }
      .wf-servico-card p { font-size: 13px; color: var(--ink-soft); line-height: 1.5; margin: 0; flex: 1; }
      .wf-servico-card__foot { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; border-top: 1px dashed var(--line); padding-top: 10px; margin-top: 4px; }
      .wf-servico-card--clickable { cursor: pointer; transition: border-color .15s, transform .1s; }
      .wf-servico-card--clickable:hover { border-color: var(--steel); transform: translateY(-2px); }

      .wf-peca-thumb { width: 34px; height: 34px; border-radius: 6px; background: var(--bg); border: 1px solid var(--line); display: flex; align-items: center; justify-content: center; overflow: hidden; color: var(--ink-soft); }
      .wf-peca-thumb img { width: 100%; height: 100%; object-fit: cover; }
      .wf-peca-preview { width: 100%; height: 140px; border-radius: 8px; border: 1px solid var(--line); background: var(--bg); overflow: hidden; margin: -4px 0 12px; }
      .wf-peca-preview img { width: 100%; height: 100%; object-fit: cover; }

      .wf-peca-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
      .wf-peca-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; overflow: hidden; display: flex; flex-direction: column; }
      .wf-peca-card__img { height: 130px; background: var(--bg); display: flex; align-items: center; justify-content: center; color: var(--ink-soft); }
      .wf-peca-card__img img { width: 100%; height: 100%; object-fit: cover; }
      .wf-peca-card__img--empty img { display: none; }
      .wf-peca-card__body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 4px; }
      .wf-peca-card__codigo { font-size: 11px; color: var(--ink-soft); }
      .wf-peca-card__body h3 { font-family: 'Oswald', sans-serif; font-size: 15px; margin: 0 0 4px; }
      .wf-peca-card__foot { display: flex; justify-content: space-between; align-items: center; font-size: 13.5px; font-weight: 600; border-top: 1px dashed var(--line); padding-top: 10px; margin-top: 6px; }

      .wf-mobilenav { display: none; }

      /* ---------------- Área pública ---------------- */
      .wf-pub { min-height: 100vh; display: flex; flex-direction: column; }
      .wf-pub-main { flex: 1; }
      .wf-pub-header { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 20px; padding: 14px 40px; background: var(--ink); }
      .wf-pub-brand { display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; color: var(--accent); font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 1px; padding: 4px 0; flex-shrink: 0; }
      .wf-pub-brand span { color: #fff; }
      .wf-pub-nav { display: flex; gap: 8px; flex: 1; min-width: 0; overflow-x: auto; padding: 4px 4px 4px 8px; }
      .wf-pub-nav__item { background: none; border: none; color: #C7C4B8; font-family: 'Oswald', sans-serif; font-size: 13.5px; letter-spacing: 0.3px; padding: 9px 14px; border-radius: 6px; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
      .wf-pub-nav__item:hover { color: #fff; }
      .wf-pub-nav__item.active { color: var(--accent); font-weight: 600; }
      .wf-pub-header__cta { display: flex; gap: 8px; flex-shrink: 0; }

      .wf-hero { padding: 74px 40px 60px; max-width: 760px; margin: 0 auto; text-align: center; }
      .wf-hero h1 { font-family: 'Bebas Neue', sans-serif; font-size: 48px; line-height: 1.05; margin: 8px 0 18px; letter-spacing: 0.5px; }
      .wf-hero__lead { font-size: 16px; color: var(--ink-soft); max-width: 540px; margin: 0 auto 26px; line-height: 1.55; }
      .wf-hero__cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

      .wf-section { max-width: 1080px; margin: 0 auto; padding: 50px 40px; }
      .wf-section__title { font-family: 'Bebas Neue', sans-serif; font-size: 32px; margin: 4px 0 24px; letter-spacing: 0.4px; }
      .wf-section__head { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
      .wf-page-title { font-family: 'Bebas Neue', sans-serif; font-size: 40px; margin: 4px 0 12px; letter-spacing: 0.4px; }
      .wf-page-lead { font-size: 15px; color: var(--ink-soft); max-width: 620px; line-height: 1.55; margin: 0 0 28px; }
      .wf-detalhe-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed var(--line); font-size: 13.5px; }
      .wf-detalhe-row:last-child { border-bottom: none; }
      .wf-detalhe-row span { color: var(--ink-soft); }

      .wf-diff-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
      .wf-diff-card { background: var(--surface); border: 1px solid var(--line); border-radius: 10px; padding: 20px; color: var(--steel); }
      .wf-diff-card h3 { font-family: 'Oswald', sans-serif; font-size: 15px; color: var(--ink); margin: 10px 0 6px; }
      .wf-diff-card p { font-size: 13px; color: var(--ink-soft); line-height: 1.5; margin: 0; }

      .wf-cta-banner { background: var(--ink); color: #fff; margin: 20px 0 0; padding: 46px 40px; display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap; }
      .wf-cta-banner h2 { font-family: 'Bebas Neue', sans-serif; font-size: 28px; margin: 0 0 6px; letter-spacing: 0.4px; }
      .wf-cta-banner p { color: #C7C4B8; margin: 0; font-size: 14px; max-width: 420px; }

      .wf-contato-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 18px; }

      .wf-pub-footer { background: var(--ink); color: #C7C4B8; padding: 40px 40px 20px; margin-top: auto; }
      .wf-pub-footer__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; max-width: 1080px; margin: 0 auto; }
      .wf-pub-footer h4 { font-family: 'Oswald', sans-serif; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #fff; margin: 0 0 10px; }
      .wf-pub-footer p { display: flex; align-items: center; gap: 7px; font-size: 13px; margin: 6px 0; }
      .wf-pub-footer__bottom { max-width: 1080px; margin: 28px auto 0; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.12); font-size: 12px; color: #8B897F; }

      .wf-authwrap { display: flex; align-items: center; justify-content: center; padding: 60px 20px; min-height: 60vh; }
      .wf-authcard { background: var(--surface); border: 1px solid var(--line); border-radius: 12px; padding: 32px 30px; width: 100%; max-width: 400px; }
      .wf-authcard h1 { font-family: 'Bebas Neue', sans-serif; font-size: 30px; margin: 0 0 4px; }
      .wf-authcard__switch { text-align: center; font-size: 13px; color: var(--ink-soft); margin: 16px 0 0; }
      .wf-authcard__switch button { background: none; border: none; color: var(--steel); font-weight: 600; cursor: pointer; padding: 0; font-size: 13px; }
      .wf-authcard__hint { text-align: center; font-size: 11px; color: var(--ink-soft); margin: 14px 0 0; padding-top: 14px; border-top: 1px dashed var(--line); }

      @media (max-width: 860px) {
        .wf-contato-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 720px) {
        .wf-sidebar { display: none; }
        .wf-main { padding: 20px 16px 90px; }
        .wf-mobilenav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: var(--ink); z-index: 40; padding: 8px 4px calc(8px + env(safe-area-inset-bottom)); justify-content: space-around; overflow-x: auto; }
        .wf-mobilenav__item { background: none; border: none; color: #A6A398; display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 10px; font-family: 'Oswald', sans-serif; padding: 4px 6px; flex-shrink: 0; }
        .wf-mobilenav__item.active { color: var(--accent); }
        .wf-grid2, .wf-grid3 { grid-template-columns: 1fr; }
        .wf-item-row { grid-template-columns: 1fr 90px auto; }
        .wf-pub-header { padding: 12px 16px; flex-wrap: wrap; justify-content: space-between; }
        .wf-pub-nav { order: 3; flex: 1 1 100%; margin-top: 6px; padding-left: 0; }
        .wf-hero { padding: 50px 20px 40px; }
        .wf-hero h1 { font-size: 34px; }
        .wf-section, .wf-cta-banner, .wf-pub-footer { padding-left: 20px; padding-right: 20px; }
      }

      /* Comprovante de OS (tela) */
      .wf-recibo-modal { max-width: 640px; }
      .wf-recibo { font-size: 13.5px; color: var(--ink); }
      .wf-recibo__cabecalho { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 16px; border-bottom: 2px solid var(--ink); margin-bottom: 18px; flex-wrap: wrap; }
      .wf-recibo__marca { display: flex; align-items: center; gap: 8px; font-family: 'Bebas Neue', sans-serif; font-size: 24px; letter-spacing: 0.5px; margin-bottom: 4px; }
      .wf-recibo__cabecalho p { margin: 2px 0; color: var(--ink-soft); font-size: 12.5px; }
      .wf-recibo__doc { text-align: right; }
      .wf-recibo__numero { font-size: 16px; font-weight: 700; margin: 2px 0; }
      .wf-recibo__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 18px; }
      .wf-recibo__label { font-family: 'Oswald', sans-serif; font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--steel); display: block; margin-bottom: 3px; }
      .wf-recibo__grid p, .wf-recibo__desc p { margin: 0; }
      .wf-recibo__desc { margin-bottom: 18px; padding: 12px; background: var(--bg); border-radius: 8px; }
      .wf-recibo__tabela { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
      .wf-recibo__tabela th { text-align: left; font-family: 'Oswald', sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.8px; color: var(--ink-soft); border-bottom: 1.5px solid var(--line-strong); padding: 6px 4px; }
      .wf-recibo__tabela td { padding: 8px 4px; border-bottom: 1px dashed var(--line); }
      .wf-recibo__tabela td:last-child, .wf-recibo__tabela th:last-child { text-align: right; }
      .wf-recibo__tabela tfoot td { border-bottom: none; border-top: 1.5px solid var(--line-strong); font-weight: 600; padding-top: 10px; }
      .wf-recibo__rodape { text-align: center; color: var(--ink-soft); font-size: 12px; margin-top: 8px; }

      /* Avaliação (estrelas) */
      .wf-ticket__avaliacao { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-soft); border-top: 1px dashed var(--line); padding-top: 10px; margin-bottom: 10px; flex-wrap: wrap; }
      .wf-ticket__avaliacao-comentario { font-style: italic; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; }
      .wf-estrelas-exibir { display: inline-flex; gap: 1px; color: var(--accent); flex-shrink: 0; }
      .wf-estrelas-input { display: flex; gap: 6px; }
      .wf-estrela-btn { background: none; border: none; padding: 2px; cursor: pointer; color: var(--accent); display: inline-flex; }
      .wf-estrela-btn:hover { transform: scale(1.1); }

      /* Impressão / "salvar como PDF": mostra só o comprovante, some com o resto da página */
      @media print {
        body * { visibility: hidden; }
        .wf-recibo, .wf-recibo * { visibility: visible; }
        .wf-recibo { position: absolute; top: 0; left: 0; width: 100%; padding: 24px; }
        .wf-recibo-veil, .wf-recibo-modal { position: static !important; background: none !important; box-shadow: none !important; max-height: none !important; overflow: visible !important; }
        .wf-recibo-noimprimir { display: none !important; }
      }
    `}</style>
  );
}
