import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Campo } from "../../../compartilhado/componentes/Campo.jsx";
import { entrar } from "../integracao/entrar.jsx";
import { traduzirErroAutenticacao } from "../integracao/traduzirErroAutenticacao.jsx";

// Schema do Zod para validação de Login
const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido, como nome@email.com."),
  senha: z.string().min(1, "A senha é obrigatória."),
});

export function TelaEntrar({ setPage, onLogin }) {
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  // Configurando o React Hook Form com o Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const aoClicarEntrar = async (data) => {
    setErro("");
    setCarregando(true);
    try {
      const sessao = await entrar(data.email.trim(), data.senha);
      await onLogin(sessao);
    } catch (err) {
      setErro(
        traduzirErroAutenticacao(
          err,
          err.message || "Não foi possível entrar. Tente novamente.",
        ),
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="wf-authwrap">
      <div className="wf-authcard">
        <h1>Entrar</h1>
        <p className="wf-muted" style={{ marginBottom: 18 }}>
          Acesse sua conta ou o painel administrativo.
        </p>

        <form onSubmit={handleSubmit(aoClicarEntrar)}>
          <Campo label="E-mail" erro={errors.email?.message}>
            <input type="email" {...register("email")} />
          </Campo>

          <Campo label="Senha" erro={errors.senha?.message}>
            <input
              type="password"
              {...register("senha")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit(aoClicarEntrar)();
                }
              }}
            />
          </Campo>

          {erro && <p className="wf-error">{erro}</p>}

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
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="wf-authcard__switch">
          <button type="button" onClick={() => setPage("esqueci-senha")}>
            Esqueci minha senha
          </button>
        </p>
        <p className="wf-authcard__switch">
          Não tem conta?{" "}
          <button type="button" onClick={() => setPage("cadastro")}>
            Cadastre-se
          </button>
        </p>
      </div>
    </div>
  );
}
