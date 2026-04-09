export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  isLoading = false,
  onCancel,
  onConfirm,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <div className="danger-icon">!</div>
        <div>
          <p className="eyebrow">Please Confirm</p>
          <h2 id="confirm-title">{title}</h2>
          <p className="muted">{description}</p>
        </div>
        <div className="actions-row">
          <button type="button" className="secondary" disabled={isLoading} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="danger-button" disabled={isLoading} onClick={onConfirm}>
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
