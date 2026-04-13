/** Lista de origens permitidas (CORS + Socket.IO). Várias URLs separadas por vírgula. */
export function clientOrigins() {
  const raw = process.env.CLIENT_ORIGIN || process.env.CORS_ORIGIN;
  if (!raw?.trim()) {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[CORS/Socket.IO] Defina CLIENT_ORIGIN no painel do host (Render/Railway) com a URL do front. " +
          "Ex.: https://seu-front.vercel.app ou https://seu-app.onrender.com — sem isso só funciona origem localhost."
      );
    }
    return ["http://localhost:5173"];
  }
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
