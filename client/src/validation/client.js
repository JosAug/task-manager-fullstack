const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginClient({ email, password }) {
  const e = String(email || "").trim();
  if (!e) return "Informe o e-mail.";
  if (!EMAIL_RE.test(e)) return "E-mail inválido.";
  if (!password) return "Informe a senha.";
  return null;
}

export function validateRegisterClient({ name, email, password }) {
  const n = String(name || "").trim();
  if (!n) return "Informe o nome.";
  if (n.length > 100) return "Nome muito longo (máx. 100).";
  const e = String(email || "").trim();
  if (!e) return "Informe o e-mail.";
  if (!EMAIL_RE.test(e)) return "E-mail inválido.";
  if (e.length > 255) return "E-mail muito longo.";
  const p = String(password || "");
  if (p.length < 6) return "Senha deve ter pelo menos 6 caracteres.";
  if (p.length > 128) return "Senha muito longa (máx. 128).";
  return null;
}

export function validateTaskCreateClient({ title, description }) {
  const t = String(title || "").trim();
  if (!t) return "Título é obrigatório.";
  if (t.length > 200) return "Título muito longo (máx. 200).";
  const d = description != null ? String(description).trim() : "";
  if (d.length > 2000) return "Descrição muito longa (máx. 2000).";
  return null;
}

export function validateTaskPutClient({ title, description, completed }) {
  const t = String(title || "").trim();
  if (!t) return "Título é obrigatório.";
  if (t.length > 200) return "Título muito longo (máx. 200).";
  const d = description != null ? String(description).trim() : "";
  if (d.length > 2000) return "Descrição muito longa (máx. 2000).";
  if (typeof completed !== "boolean") return "Marque se a tarefa está concluída.";
  return null;
}
