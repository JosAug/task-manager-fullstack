import { Router } from "express";
import db from "../db.js";
import { authRequired } from "../middleware/auth.js";
import { validateBody, validateParams, validateRequest } from "../middleware/validate.js";
import {
  taskCreateBodySchema,
  taskIdParamSchema,
  taskPatchBodySchema,
  taskPutBodySchema,
} from "../validation/schemas.js";

const router = Router();
router.use(authRequired);

router.get("/", (_req, res) => {
  const tasks = db
    .prepare(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM tasks WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(_req.userId);
  res.json({ tasks: tasks.map(mapTask) });
});

router.post("/", validateBody(taskCreateBodySchema), (req, res) => {
  const { title, description } = req.validatedBody;
  const stmt = db.prepare(
    `INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)`
  );
  const result = stmt.run(req.userId, title, description ?? null);
  const task = db
    .prepare(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM tasks WHERE id = ? AND user_id = ?`
    )
    .get(result.lastInsertRowid, req.userId);
  return res.status(201).json({ task: mapTask(task) });
});

router.get("/:id", validateParams(taskIdParamSchema), (req, res) => {
  const { id } = req.validatedParams;
  const task = db
    .prepare(
      `SELECT id, title, description, completed, created_at, updated_at
       FROM tasks WHERE id = ? AND user_id = ?`
    )
    .get(id, req.userId);
  if (!task) return res.status(404).json({ error: "Tarefa não encontrada" });
  return res.json({ task: mapTask(task) });
});

router.put(
  "/:id",
  validateRequest({ params: taskIdParamSchema, body: taskPutBodySchema }),
  (req, res) => {
    const { id } = req.validatedParams;
    const { title, description, completed } = req.validatedBody;

    const existing = db
      .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, req.userId);
    if (!existing) return res.status(404).json({ error: "Tarefa não encontrada" });

    db.prepare(
      `UPDATE tasks SET title = ?, description = ?, completed = ?,
       updated_at = datetime('now') WHERE id = ? AND user_id = ?`
    ).run(title, description ?? null, completed ? 1 : 0, id, req.userId);

    const task = db
      .prepare(
        `SELECT id, title, description, completed, created_at, updated_at
         FROM tasks WHERE id = ? AND user_id = ?`
      )
      .get(id, req.userId);
    return res.json({ task: mapTask(task) });
  }
);

router.patch(
  "/:id",
  validateRequest({ params: taskIdParamSchema, body: taskPatchBodySchema }),
  (req, res) => {
    const { id } = req.validatedParams;
    const patch = req.validatedBody;

    const existing = db
      .prepare("SELECT * FROM tasks WHERE id = ? AND user_id = ?")
      .get(id, req.userId);
    if (!existing) return res.status(404).json({ error: "Tarefa não encontrada" });

    const nextTitle = patch.title !== undefined ? patch.title : existing.title;
    const nextDesc =
      patch.description !== undefined ? patch.description : existing.description;
    const nextCompleted =
      patch.completed !== undefined ? (patch.completed ? 1 : 0) : existing.completed;

    db.prepare(
      `UPDATE tasks SET title = ?, description = ?, completed = ?,
       updated_at = datetime('now') WHERE id = ? AND user_id = ?`
    ).run(nextTitle, nextDesc, nextCompleted, id, req.userId);

    const task = db
      .prepare(
        `SELECT id, title, description, completed, created_at, updated_at
         FROM tasks WHERE id = ? AND user_id = ?`
      )
      .get(id, req.userId);
    return res.json({ task: mapTask(task) });
  }
);

router.delete("/:id", validateParams(taskIdParamSchema), (req, res) => {
  const { id } = req.validatedParams;
  const result = db
    .prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?")
    .run(id, req.userId);
  if (result.changes === 0) return res.status(404).json({ error: "Tarefa não encontrada" });
  return res.status(204).send();
});

function mapTask(row) {
  if (!row) return null;
  return {
    ...row,
    completed: Boolean(row.completed),
  };
}

export default router;
