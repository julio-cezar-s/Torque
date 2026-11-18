// Arredonda o maior valor para cima num número "redondo" (para o eixo do gráfico).
export function valorMaximoArredondado(maximo) {
  if (maximo <= 0) return 1;
  const potencia = 10 ** Math.floor(Math.log10(maximo));
  const passos = [1, 2, 2.5, 5, 10];
  const base = passos.find((p) => p * potencia >= maximo) ?? 10;
  return base * potencia;
}
