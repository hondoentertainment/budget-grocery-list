export default function Toast({ message, visible }) {
  if (!visible) return null
  return (
    <div className="toast toast-success" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span>
      {message}
    </div>
  )
}
