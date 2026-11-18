import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { formatarTelefone } from "../../../compartilhado/validacao/formatarTelefone.jsx";
import { registrarCliente } from "../integracao/registrarCliente.jsx";
import { traduzirErroAutenticacao } from "../integracao/traduzirErroAutenticacao.jsx";

// Schema do Zod baseado exatamente nos campos da sua tela
const cadastroSchema = z
  .object({
    nome: z.string().min(3, "Informe seu nome completo."),
    email: z.string().email("Informe um e-mail válido, como nome@email.com."),
    telefone: z
      .string()
      .optional()
      .refine((val) => !val || val.length >= 10, {
        message: "Telefone inválido. Use DDD + número, ex.: (69) 99999-9999.",
      }),
    senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
    confirmarSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: "As senhas não coincidem.",
    path: ["confirmarSenha"],
  });

export function TelaCadastro({ setPage, onLogin }) {
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Configurando o React Hook Form com o Zod
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(cadastroSchema),
    mode: "onSubmit",
  });

  const telefoneValue = watch("telefone", "");

  const cadastrar = async (data) => {
    setErro("");
    setAviso("");
    setCarregando(true);
    try {
      const resultado = await registrarCliente({
        nome: data.nome.trim(),
        email: data.email.trim(),
        telefone: data.telefone,
        senha: data.senha,
      });
      if (resultado.precisaConfirmar) {
        setAviso(
          "Conta criada! Enviamos um e-mail de confirmação — confirme-o e depois entre com sua senha.",
        );
      } else {
        await onLogin(resultado.sessao);
      }
    } catch (err) {
      setErro(
        traduzirErroAutenticacao(
          err,
          err.message || "Não foi possível criar sua conta. Tente novamente.",
        ),
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Criar conta</h1>
        <p className="wf-muted" style={{ marginBottom: 18 }}>
          Cadastre-se para agendar serviços e acompanhar seu veículo.
        </p>

        <form onSubmit={handleSubmit(cadastrar)}>
          <Campo label="Nome completo" erro={errors.nome?.message}>
            <input {...register("nome")} />
          </Campo>

          <Campo label="E-mail" erro={errors.email?.message}>
            <input
              type="email"
              {...register("email")}
              placeholder="nome@email.com"
            />
          </Campo>

          <Campo label="Telefone (opcional)" erro={errors.telefone?.message}>
            <input
              type="tel"
              inputMode="tel"
              value={telefoneValue}
              onChange={(e) => {
                const formatado = formatarTelefone(
                  e.target.value,
                  telefoneValue,
                );
                setValue("telefone", formatado, { shouldValidate: true });
              }}
              placeholder="(69) 99999-9999"
            />
          </Campo>

          <div className="wf-grid2">
            <Campo label="Senha" erro={errors.senha?.message}>
              <input type="password" {...register("senha")} />
            </Campo>

            <Campo
              label="Confirmar senha"
              erro={errors.confirmarSenha?.message}
            >
              <input type="password" {...register("confirmarSenha")} />
            </Campo>
          </div>

          {erro && <p className="wf-error">{erro}</p>}
          {aviso && <p className="wf-success">{aviso}</p>}

          <button
            type="submit"
            className="wf-btn wf-btn--accent"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "12px",
            }}
            disabled={carregando}
          >
            {carregando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p className="wf-authcard__switch">
          Já tem conta?{" "}
          <button type="button" onClick={() => setPage("login")}>
            Entrar
          </button>
        </p>
      </div>
    </div>
  );
}
