/** Validações antes de subir em produção (evita JWT fraco e surpresas no deploy). */

const WEAK_JWT_SECRETS = new Set([
  "dev-only-change-me",
  "altere-para-uma-string-longa-e-aleatoria-em-producao",
]);

export function assertProductionConfig() {
  if (process.env.NODE_ENV !== "production") return;

  const secret = process.env.JWT_SECRET;
  if (!secret || WEAK_JWT_SECRETS.has(secret) || secret.length < 24) {
    console.error(
      "[FATAL] Em produção defina JWT_SECRET no painel do host (24+ caracteres, valor aleatório único)."
    );
    process.exit(1);
  }
}
