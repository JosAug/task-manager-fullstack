export default function Spinner({ label = "Carregando" }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="spinner-wrap__text">{label}</span>
    </div>
  );
}
