/** Monta mensagem legível a partir de `error` + `details` da API (ex.: Zod). */
export function formatApiError(err) {
  const base = err?.message || "Erro";
  const details = err?.data?.details;
  if (!Array.isArray(details) || details.length === 0) return base;
  const lines = details.map((d) => `${d.path}: ${d.message}`);
  return `${base}\n${lines.join("\n")}`;
}
