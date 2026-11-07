import { Janela } from "../../../compartilhado/componentes/Janela.jsx";
import { CamposAgendamento } from "./CamposAgendamento.jsx";

export function JanelaAgendamento({ clientes, veiculos, servicos, initial, onClose, onSave }) {
  return (
    <Janela title={initial ? "Editar Agendamento" : "Novo Agendamento"} onClose={onClose} width="560px">
      <CamposAgendamento
        clientes={clientes} veiculos={veiculos} servicos={servicos} initial={initial} showStatus={!!initial}
        submitLabel={initial ? "Salvar alterações" : "Criar agendamento"}
        onSubmit={(payload) => onSave(payload, initial)}
      />
    </Janela>
  );
}
