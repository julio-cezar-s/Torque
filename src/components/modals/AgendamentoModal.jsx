import { Modal } from "../common/Modal.jsx";
import { AgendamentoFields } from "./AgendamentoFields.jsx";

export function AgendamentoModal({ clientes, veiculos, servicos, initial, onClose, onSave }) {
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
