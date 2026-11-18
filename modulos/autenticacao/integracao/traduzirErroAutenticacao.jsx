// Converte mensagens técnicas (em inglês) do Supabase em textos claros para o usuário.
export const traduzirErroAutenticacao = (err, padrao) => {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("network request failed") || msg.includes("load failed") || msg.includes("retryable"))
    return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
  if (msg.includes("invalid login")) return "E-mail ou senha inválidos.";
  if (msg.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  if (msg.includes("already registered") || msg.includes("already been registered")) return "Já existe uma conta com este e-mail. Tente entrar ou use \"Esqueci minha senha\".";
  if (msg.includes("password should be at least") || msg.includes("weak password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("rate limit") || msg.includes("too many")) return "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.";
  if (msg.includes("different from the old")) return "A nova senha precisa ser diferente da anterior.";
  if (msg.includes("session missing") || msg.includes("expired") || msg.includes("invalid token")) return "O link expirou ou já foi usado. Peça um novo e-mail de recuperação.";
  if (msg.includes("unable to validate email") || msg.includes("invalid format") || msg.includes("email address") && msg.includes("invalid")) return "Informe um e-mail válido, como nome@email.com.";
  if (msg.includes("signups not allowed") || msg.includes("signup is disabled")) return "Novos cadastros estão desativados no momento. Fale com a oficina.";
  return padrao;
};
