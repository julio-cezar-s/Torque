import { useCallback, useRef, useState } from "react";
import { persistirDiferencas } from "../dados/persistirDiferencas.jsx";

// Estado de uma tabela com a mesma API de sempre (setX(valor | fn(prev))),
// mas gravando no Supabase só as linhas que mudaram. O ref garante que várias
// chamadas seguidas (ex.: criar cliente + veículo + OS) partam do estado mais recente.
export function useTabela(nome) {
  const [lista, setLista] = useState([]);
  const ref = useRef([]);

  const definir = useCallback((atualizador) => {
    const antes = ref.current;
    const depois = typeof atualizador === "function" ? atualizador(antes) : atualizador;
    ref.current = depois;
    setLista(depois);
    persistirDiferencas(nome, antes, depois);
  }, [nome]);

  const substituir = useCallback((dados) => { ref.current = dados; setLista(dados); }, []);

  return [lista, definir, substituir];
}
