import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { formatApiError } from "../formatApiError.js";
import { validateTaskCreateClient, validateTaskPutClient } from "../validation/client.js";
import ChatPanel from "../components/ChatPanel.jsx";
import "../App.css";

function IconPencil() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCompleted, setEditCompleted] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [accountDangerOpen, setAccountDangerOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const { tasks: list } = await api("/api/tasks");
      setTasks(list || []);
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { pending, doneCount } = useMemo(() => {
    const p = tasks.filter((t) => !t.completed).length;
    const d = tasks.filter((t) => t.completed).length;
    return { pending: p, doneCount: d };
  }, [tasks]);

  function startEdit(task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setEditCompleted(Boolean(task.completed));
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditCompleted(false);
  }

  async function addTask(e) {
    e.preventDefault();
    setError("");
    const clientErr = validateTaskCreateClient({ title, description });
    if (clientErr) {
      setError(clientErr);
      return;
    }
    setSaving(true);
    try {
      const descTrim = description.trim();
      const { task } = await api("/api/tasks", {
        method: "POST",
        body: { title: title.trim(), description: descTrim ? descTrim : null },
      });
      setTasks((prev) => [task, ...prev]);
      setTitle("");
      setDescription("");
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setSaving(false);
    }
  }

  async function saveEdit(id) {
    setError("");
    const descTrim = editDescription.trim();
    const clientErr = validateTaskPutClient({
      title: editTitle,
      description: descTrim,
      completed: editCompleted,
    });
    if (clientErr) {
      setError(clientErr);
      return;
    }
    setEditSaving(true);
    try {
      const { task: updated } = await api(`/api/tasks/${id}`, {
        method: "PUT",
        body: {
          title: editTitle.trim(),
          description: descTrim ? descTrim : null,
          completed: editCompleted,
        },
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      cancelEdit();
    } catch (e) {
      setError(formatApiError(e));
    } finally {
      setEditSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      const { task: updated } = await api(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: { completed: !task.completed },
      });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function removeTask(id) {
    try {
      await api(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== id));
      if (editingId === id) cancelEdit();
    } catch (e) {
      setError(formatApiError(e));
    }
  }

  async function handleDeleteAccount(e) {
    e.preventDefault();
    if (
      !window.confirm(
        "Sua conta e todas as tarefas serão apagadas. Esta ação não pode ser desfeita. Deseja continuar?"
      )
    ) {
      return;
    }
    setError("");
    setDeleteBusy(true);
    try {
      await deleteAccount(deletePassword);
      setDeletePassword("");
      setAccountDangerOpen(false);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setDeleteBusy(false);
    }
  }

  const errorClass = error.includes("\n") ? "error pre" : "error";

  return (
    <div className="shell">
      <header className="dash-header">
        <div>
          <h1 className="dash-title">Minhas tarefas</h1>
          <p className="dash-greeting">
            Olá, <strong>{user?.name}</strong>
            <span className="dash-greeting__email"> · {user?.email}</span>
          </p>
          <p className="dash-meta">
            <a href="/api/docs" target="_blank" rel="noreferrer">
              Swagger
            </a>
            {" · "}
            <a href="/api/openapi.json" target="_blank" rel="noreferrer">
              OpenAPI JSON
            </a>
          </p>
        </div>
        <div className="dash-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => logout()}>
            Sair
          </button>
        </div>
      </header>

      {error ? <div className={`${errorClass} banner-error`}>{error}</div> : null}

      {!loading && tasks.length > 0 ? (
        <div className="stats-row" role="status" aria-live="polite">
          <span className="stat-pill stat-pill--accent">
            <span className="stat-pill__dot" />
            {pending} pendente{pending !== 1 ? "s" : ""}
          </span>
          <span className="stat-pill stat-pill--muted">
            <span className="stat-pill__dot" />
            {doneCount} concluída{doneCount !== 1 ? "s" : ""}
          </span>
        </div>
      ) : null}

      <div className="card new-task">
        <div className="card__head">
          <h2>Nova tarefa</h2>
          <span className="card__badge">Create</span>
        </div>
        <form onSubmit={addTask}>
          <div className="field">
            <label htmlFor="t-title">Título</label>
            <input
              id="t-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="O que você precisa fazer?"
              maxLength={200}
            />
          </div>
          <div className="field">
            <label htmlFor="t-desc">Descrição (opcional)</label>
            <textarea
              id="t-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contexto, links ou subtarefas…"
              maxLength={2000}
            />
          </div>
          <div className="actions">
            <button className="btn btn-primary" type="submit" disabled={saving || !title.trim()}>
              {saving ? "Adicionando…" : "Adicionar tarefa"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card__head">
          <h2>Suas tarefas</h2>
          <span className="card__badge">Read · Update · Delete</span>
        </div>

        {loading ? (
          <div className="skeleton-list" aria-hidden>
            <div className="skeleton-line" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">
              <IconClipboard />
            </div>
            <h3 className="empty-state__title">Nada por aqui ainda</h3>
            <p className="empty-state__text">
              Crie sua primeira tarefa acima. O checklist e a edição completa (PUT) estão prontos para
              você testar o fluxo.
            </p>
          </div>
        ) : (
          <ul className="task-list">
            {tasks.map((t) => (
              <li key={t.id} className={`task-item ${t.completed ? "done" : ""}`}>
                {editingId === t.id ? (
                  <div
                    className="task-item__inner"
                    style={{ flexDirection: "column", alignItems: "stretch", width: "100%" }}
                  >
                    <div className="field">
                      <label htmlFor={`e-title-${t.id}`}>Título</label>
                      <input
                        id={`e-title-${t.id}`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        maxLength={200}
                      />
                    </div>
                    <div className="field">
                      <label htmlFor={`e-desc-${t.id}`}>Descrição</label>
                      <textarea
                        id={`e-desc-${t.id}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        maxLength={2000}
                      />
                    </div>
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={editCompleted}
                        onChange={(e) => setEditCompleted(e.target.checked)}
                      />
                      Marcar como concluída
                    </label>
                    <div className="task-edit-actions row-between" style={{ width: "100%", marginTop: "0.5rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={editSaving}
                          onClick={() => saveEdit(t.id)}
                        >
                          {editSaving ? "Salvando…" : "Salvar alterações"}
                        </button>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                          Cancelar
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeTask(t.id)}
                      >
                        <IconTrash /> Excluir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="task-item__inner">
                    <input
                      type="checkbox"
                      className="task-check"
                      checked={t.completed}
                      onChange={() => toggleTask(t)}
                      aria-label={t.completed ? "Marcar como pendente" : "Marcar como concluída"}
                    />
                    <div className="task-body">
                      <p className="task-title">{t.title}</p>
                      {t.description ? <p className="task-desc">{t.description}</p> : null}
                    </div>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        title="Editar tarefa"
                        aria-label="Editar tarefa"
                        onClick={() => startEdit(t)}
                      >
                        <IconPencil />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon"
                        title="Excluir tarefa"
                        aria-label="Excluir tarefa"
                        onClick={() => removeTask(t.id)}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card card--account-danger">
        <div className="card__head">
          <h2>Conta</h2>
          <span className="card__badge card__badge--danger">Irreversível</span>
        </div>
        {!accountDangerOpen ? (
          <>
            <p className="account-danger-lead">
              Para remover o cadastro que você criou, use a opção abaixo. Suas tarefas serão apagadas
              junto.
            </p>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                setAccountDangerOpen(true);
                setError("");
              }}
            >
              Excluir minha conta…
            </button>
          </>
        ) : (
          <form onSubmit={handleDeleteAccount}>
            <p className="account-danger-warning">
              Digite sua senha para confirmar. O e-mail <strong>{user?.email}</strong> poderá ser usado
              de novo em um novo cadastro.
            </p>
            <div className="field">
              <label htmlFor="delete-password">Senha atual</label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Confirme com sua senha"
                required
              />
            </div>
            <div className="account-danger-actions">
              <button type="submit" className="btn btn-danger" disabled={deleteBusy || !deletePassword}>
                {deleteBusy ? "Excluindo…" : "Excluir conta permanentemente"}
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={deleteBusy}
                onClick={() => {
                  setAccountDangerOpen(false);
                  setDeletePassword("");
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>

      <ChatPanel user={user} />
    </div>
  );
}
