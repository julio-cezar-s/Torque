import { z } from "zod";

// Schema para validação de Cliente ou Cadastro
export const clienteSchema = z.object({
  nome: z
    .string()
    .min(3, "O nome completo é obrigatório (mínimo 3 caracteres)"),
  email: z.string().email("Digite um e-mail válido"),
  telefone: z.string().min(10, "O telefone deve conter o DDD e número válido"),
  placa: z
    .string()
    .length(7, "A placa do veículo deve ter exatamente 7 caracteres"),
});
