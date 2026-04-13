import "dotenv/config";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";
import { openApiSpec } from "./openapi.js";
import { verifyAccessToken } from "./middleware/auth.js";
import { clientOrigins } from "./config/origins.js";
import { registerChatHandlers } from "./realtime/chat.js";
import { assertProductionConfig } from "./config/production.js";
import db from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const HOST = process.env.HOST || "0.0.0.0";
const origins = clientOrigins();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    service: "todo-api",
    health: "/api/health",
    docs: "/api/docs",
    openapi: "/api/openapi.json",
    socket: "/socket.io",
  });
});

app.get("/api/health", (_, res) => res.json({ ok: true }));

app.get("/api/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "API Tarefas — Swagger",
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno" });
});

const server = http.createServer(app);

const io = new Server(server, {
  path: "/socket.io",
  cors: {
    origin: origins,
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const v = verifyAccessToken(token);
  if (!v) {
    return next(new Error("unauthorized"));
  }
  const user = db.prepare("SELECT id, name FROM users WHERE id = ?").get(v.userId);
  if (!user) {
    return next(new Error("unauthorized"));
  }
  socket.userId = user.id;
  socket.userName = user.name;
  next();
});

registerChatHandlers(io);

assertProductionConfig();

server.listen(PORT, HOST, () => {
  const prod = process.env.NODE_ENV === "production";
  console.log(
    `API em http://${HOST}:${PORT}${prod ? " (URL pública do host)" : " — http://localhost:" + PORT}`
  );
  console.log(`Swagger: /api/docs`);
  console.log(`Socket.IO /socket.io (chat) — origens: ${origins.join(", ")}`);
});
