/** Monta mensagem legível a partir de `error` + `details` da API (ex.: Zod). */
export function formatApiError(err) {
  const base = err?.message || "Erro";
  if (base === "Failed to fetch") {
    const api = String(import.meta.env.VITE_API_URL || "").trim();
    if (!api) {
      return (
        "Sem conexão com a API. No Vercel, defina VITE_API_URL (URL https da API, sem / no final) " +
        "em Settings → Environment Variables e faça Redeploy. No Render, defina CLIENT_ORIGIN com a URL exata do front."
      );
    }
    return (
      "Não foi possível falar com a API (" +
      api +
      "). Confira se a API no Render está no ar (/api/health), se CLIENT_ORIGIN no Render inclui a URL deste site " +
      "e se não há bloqueio de rede/CORS."
    );
  }
  const details = err?.data?.details;
  if (!Array.isArray(details) || details.length === 0) return base;
  const lines = details.map((d) => `${d.path}: ${d.message}`);
  return `${base}\n${lines.join("\n")}`;
}
