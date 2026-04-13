import { Link } from "react-router-dom";

export default function AuthLayout({
  title,
  subtitle,
  children,
  footerTo,
  footerLabel,
}) {
  return (
    <div className="auth-page">
      <div className="auth-grid">
        <aside className="auth-aside" aria-hidden="true">
          <div className="auth-aside__mesh" />
          <div className="auth-aside__content">
            <span className="auth-logo">
              <span className="auth-logo__mark" />
              Fluxo
            </span>
            <p className="auth-aside__tagline">
              Organize tarefas com uma API própria, JWT e interface pensada para uso diário.
            </p>
            <ul className="auth-aside__bullets">
              <li>CRUD completo</li>
              <li>Validação e Swagger</li>
              <li>Experiência responsiva</li>
            </ul>
          </div>
        </aside>

        <main className="auth-main">
          <div className="auth-mobile-brand">
            <span className="auth-logo__mark auth-logo__mark--sm" />
            Fluxo
          </div>
          <div className="auth-card card card--glass">
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__sub">{subtitle}</p>
            {children}
            <p className="auth-card__footer">
              <Link className="link-arrow" to={footerTo}>
                {footerLabel}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
