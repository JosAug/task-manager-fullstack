import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import AuthLayout from "../components/AuthLayout.jsx";
import { formatApiError } from "../formatApiError.js";
import { validateRegisterClient } from "../validation/client.js";
import "../App.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const clientErr = validateRegisterClient({ name, email, password });
    if (clientErr) {
      setError(clientErr);
      return;
    }
    setBusy(true);
    try {
      await register(email.trim(), password, name.trim());
      navigate("/", { replace: true });
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthLayout
      title="Crie sua conta"
      subtitle="Grátis, rápido e alinhado à validação da API."
      footerTo="/login"
      footerLabel="Já tem conta? Entrar →"
    >
      {error ? (
        <div className={`error${error.includes("\n") ? " pre" : ""}`}>{error}</div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Nome</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Como podemos te chamar?"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            required
            minLength={6}
          />
        </div>
        <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
          {busy ? "Criando conta…" : "Cadastrar"}
        </button>
      </form>
    </AuthLayout>
  );
}
