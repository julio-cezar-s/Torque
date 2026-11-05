import { supabase } from "../../../nucleo/supabase/supabase.jsx";
import { gerarId } from "../../../compartilhado/utilitarios/gerarId.jsx";

export const BUCKET_PECAS = "pecas";
export const TAMANHO_MAXIMO_MB = 2;
const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];

// Envia a foto da peça para o Supabase Storage e devolve a URL pública.
export async function enviarImagemPeca(arquivo) {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) throw new Error("Use uma imagem JPG, PNG ou WEBP.");
  if (arquivo.size > TAMANHO_MAXIMO_MB * 1024 * 1024) throw new Error(`A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB} MB.`);

  const extensao = arquivo.type === "image/png" ? "png" : arquivo.type === "image/webp" ? "webp" : "jpg";
  const caminho = `${gerarId("p")}.${extensao}`;
  const { error } = await supabase.storage.from(BUCKET_PECAS).upload(caminho, arquivo, { contentType: arquivo.type, cacheControl: "3600" });
  if (error) throw new Error("Não foi possível enviar a imagem. Confira se o bucket 'pecas' foi criado no Supabase.");

  return supabase.storage.from(BUCKET_PECAS).getPublicUrl(caminho).data.publicUrl;
}
