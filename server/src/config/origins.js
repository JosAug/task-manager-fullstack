/** Lista de origens permitidas (CORS + Socket.IO). `CLIENT_ORIGIN` pode ter várias separadas por vírgula. */
export function clientOrigins() {
  const raw = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}
