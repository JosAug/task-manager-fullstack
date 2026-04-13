import { z } from "zod";
import db from "../db.js";

const messageTextSchema = z
  .string()
  .trim()
  .min(1, "mensagem vazia")
  .max(500, "máximo 500 caracteres");

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name,
    text: row.body,
    createdAt: row.created_at,
  };
}

export function registerChatHandlers(io) {
  io.on("connection", (socket) => {
    socket.join("lobby");

    const history = db
      .prepare(
        `SELECT id, user_id, user_name, body, created_at
         FROM chat_messages ORDER BY id DESC LIMIT 80`
      )
      .all()
      .reverse()
      .map(mapRow);

    socket.emit("chat:history", { messages: history });

    socket.on("chat:message", (payload, ack) => {
      const raw = payload != null && typeof payload === "object" ? payload.text : payload;
      const parsed = messageTextSchema.safeParse(raw ?? "");
      if (!parsed.success) {
        const msg = parsed.error.errors[0]?.message || "mensagem inválida";
        if (typeof ack === "function") ack({ ok: false, error: msg });
        return;
      }
      const text = parsed.data;
      try {
        const stmt = db.prepare(
          `INSERT INTO chat_messages (user_id, user_name, body) VALUES (?, ?, ?)`
        );
        const result = stmt.run(socket.userId, socket.userName, text);
        const row = db
          .prepare(
            `SELECT id, user_id, user_name, body, created_at FROM chat_messages WHERE id = ?`
          )
          .get(result.lastInsertRowid);
        const out = mapRow(row);
        io.to("lobby").emit("chat:message", out);
        if (typeof ack === "function") ack({ ok: true });
      } catch (e) {
        console.error(e);
        if (typeof ack === "function") ack({ ok: false, error: "não foi possível enviar" });
      }
    });
  });
}
