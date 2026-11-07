import { useCallback, useRef, useState } from "react";
import { persistirDiferencas } from "../dados/persistirDiferencas.jsx";
import { mesclarListas } from "../dados/mesclarListas.jsx";

// Estado de uma tabela com a mesma API de sempre (setX(valor | fn(prev))),
// mas gravando no Supabase só as linhas que mudaram. O ref garante que várias
// chamadas seguidas (ex.: criar cliente + veículo + OS) partam do estado mais recente.
//
// Devolve: [lista, definir, substituir, atualizacaoRemota]
//  - substituir: troca a lista inteira sem gravar (usado ao carregar do banco)
//  - atualizacaoRemota: { versao(), mesclar(dadosDoBanco, versao) } usado pelo tempo real
export function useTabela(nome) {
  const [lista, setLista] = useState([]);
  const ref = useRef([]);
  const versaoRef = useRef(0); // sobe a cada alteração feita nesta tela

  const definir = useCallback((atualizador) => {
    const antes = ref.current;
    const depois = typeof atualizador === "function" ? atualizador(antes) : atualizador;
    versaoRef.current += 1;
    ref.current = depois;
    setLista(depois);
    persistirDiferencas(nome, antes, depois);
  }, [nome]);

  const substituir = useCallback((dados) => { ref.current = dados; setLista(dados); }, []);

  const atualizacaoRemota = useRef({
    versao: () => versaoRef.current,
    // Se o usuário alterou algo enquanto a busca estava em andamento, descarta:
    // essa alteração gera o próprio evento e uma nova busca logo em seguida.
    mesclar: (dados, versaoDaBusca) => {
      if (versaoDaBusca !== versaoRef.current) return;
      const resultado = mesclarListas(ref.current, dados);
      if (resultado !== ref.current) { ref.current = resultado; setLista(resultado); }
    },
  }).current;

  return [lista, definir, substituir, atualizacaoRemota];
}
