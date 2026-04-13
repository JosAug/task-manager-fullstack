import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-only-change-me";

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "Token ausente" });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

/** Retorna `{ userId }` se o JWT for válido; caso contrário `null`. */
export function verifyAccessToken(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const id = payload.sub;
    if (typeof id !== "number" && typeof id !== "string") return null;
    const userId = Number(id);
    if (!Number.isInteger(userId) || userId < 1) return null;
    return { userId };
  } catch {
    return null;
  }
}

export { JWT_SECRET };
