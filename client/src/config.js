/** Base da API em produção (`VITE_API_URL`), sem barra no final. Em dev vazio = mesmo host + proxy. */
export function getApiBase() {
  return String(import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
}
