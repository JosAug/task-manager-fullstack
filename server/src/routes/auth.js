import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../db.js";
import { authRequired, JWT_SECRET } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import {
  deleteAccountBodySchema,
  loginBodySchema,
  registerBodySchema,
} from "../validation/schemas.js";

const router = Router();
const JWT_EXPIRES = "7d";

router.post("/register", validateBody(registerBodySchema), (req, res) => {
  const { email, password, name } = req.validatedBody;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare(
      "INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)"
    );
    const result = stmt.run(email, hash, name);
    const user = db
      .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
      .get(result.lastInsertRowid);
    const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    return res.status(201).json({ user, token });
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    console.error(e);
    return res.status(500).json({ error: "Erro ao registrar" });
  }
});

router.post("/login", validateBody(loginBodySchema), (req, res) => {
  const { email, password } = req.validatedBody;
  const row = db
    .prepare("SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?")
    .get(email);
  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: "E-mail ou senha incorretos" });
  }
  const user = {
    id: row.id,
    email: row.email,
    name: row.name,
    created_at: row.created_at,
  };
  const token = jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  return res.json({ user, token });
});

router.get("/me", authRequired, (req, res) => {
  const user = db
    .prepare("SELECT id, email, name, created_at FROM users WHERE id = ?")
    .get(req.userId);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  return res.json({ user });
});

router.post(
  "/delete-account",
  authRequired,
  validateBody(deleteAccountBodySchema),
  (req, res) => {
    const { password } = req.validatedBody;
    const row = db
      .prepare("SELECT id, password_hash FROM users WHERE id = ?")
      .get(req.userId);
    if (!row) return res.status(404).json({ error: "Usuário não encontrado" });
    if (!bcrypt.compareSync(password, row.password_hash)) {
      return res.status(401).json({ error: "Senha incorreta" });
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(req.userId);
    return res.status(204).send();
  }
);

export default router;
