import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Digite um e-mail válido"),
  telefone: z.string().min(10, "O telefone deve conter pelo menos 10 dígitos"),
  placa: z
    .string()
    .length(7, "A placa do veículo deve ter exatamente 7 caracteres"),
});
