export const traduzirErroAutenticacao = (err, padrao) => {
  const msg = (err?.message || "").toLowerCase();
  if (msg.includes("invalid login")) return "E-mail ou senha inválidos.";
  if (msg.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar (veja sua caixa de entrada).";
  if (msg.includes("already registered")) return "Já existe uma conta com este e-mail.";
  if (msg.includes("password should be at least")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("rate limit")) return "Muitas tentativas. Aguarde um pouco e tente de novo.";
  if (msg.includes("different from the old")) return "A nova senha precisa ser diferente da anterior.";
  if (msg.includes("session missing") || msg.includes("expired") || msg.includes("invalid token")) return "O link expirou ou já foi usado. Peça um novo e-mail de recuperação.";
  return padrao;
};
