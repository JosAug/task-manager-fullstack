import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getApiBase } from "../config.js";

export default function ChatPanel({ user }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [socketError, setSocketError] = useState("");
  const [connected, setConnected] = useState(false);
  const listRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;

    const token = localStorage.getItem("token");
    if (!token) return undefined;

    const base = getApiBase();
    const socket = base
      ? io(base, { path: "/socket.io", auth: { token }, transports: ["websocket", "polling"] })
      : io({ path: "/socket.io", auth: { token }, transports: ["websocket", "polling"] });

    socketRef.current = socket;
    setSocketError("");
    setConnected(false);

    socket.on("connect", () => {
      setConnected(true);
      setSocketError("");
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => {
      setConnected(false);
      setSocketError("Não foi possível conectar ao chat. Verifique se a API está no ar.");
    });

    socket.on("chat:history", ({ messages: list }) => {
      setMessages(Array.isArray(list) ? list : []);
    });

    socket.on("chat:message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  function send(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t || !socketRef.current?.connected) return;
    setSending(true);
    socketRef.current.emit("chat:message", { text: t }, (res) => {
      setSending(false);
      if (res?.ok) {
        setText("");
      } else if (res?.error) {
        setSocketError(res.error);
      }
    });
  }

  if (!user) return null;

  return (
    <div className={`chat-fab ${open ? "chat-fab--open" : ""}`}>
      <button
        type="button"
        className="chat-fab__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="chat-panel-body"
        title={open ? "Fechar chat" : "Abrir chat"}
      >
        {open ? "✕" : "💬"}
      </button>

      {open ? (
        <div id="chat-panel-body" className="chat-panel" role="dialog" aria-label="Chat em tempo real">
          <div className="chat-panel__head">
            <div>
              <strong>Chat</strong>
              <span className="chat-panel__sub">Usuários logados · tempo real</span>
            </div>
          </div>

          {socketError ? <div className="chat-panel__banner">{socketError}</div> : null}
          {!connected && !socketError ? (
            <div className="chat-panel__hint">Conectando ao chat…</div>
          ) : null}

          <ul className="chat-panel__list" ref={listRef}>
            {messages.length === 0 ? (
              <li className="chat-panel__empty">Nenhuma mensagem ainda. Diga oi!</li>
            ) : (
              messages.map((m) => {
                const mine = Number(m.userId) === Number(user.id);
                return (
                  <li key={m.id} className={`chat-msg ${mine ? "chat-msg--mine" : ""}`}>
                    <span className="chat-msg__who">{mine ? "Você" : m.userName}</span>
                    <p className="chat-msg__text">{m.text}</p>
                    <time className="chat-msg__time" dateTime={m.createdAt}>
                      {formatTime(m.createdAt)}
                    </time>
                  </li>
                );
              })
            )}
          </ul>

          <form className="chat-panel__form" onSubmit={send}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Mensagem…"
              maxLength={500}
              autoComplete="off"
              disabled={!connected}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={sending || !text.trim()}>
              {sending ? "…" : "Enviar"}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function formatTime(iso) {
  if (!iso) return "";
  const m = String(iso).match(/(\d{2}:\d{2})/);
  return m ? m[1] : iso;
}
