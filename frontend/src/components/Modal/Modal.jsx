import './Modal.css'

function Modal({
  title,
  description,
  isOpen = false,
  onSubmit,
  onCancel,
  submitLabel = 'Confirm',
  cancelLabel = 'Cancel',
  submitVariant = 'primary',
  cancelVariant = 'secondary',
  children,
}) {
  if (!isOpen) return null

  return (
    <div className="modalOverlay" role="dialog" aria-modal="true">
      <div className="modalCard">
        <div className="modalContent">
          {title && <h3 className="modalTitle">{title}</h3>}
          {description && <p className="modalDescription">{description}</p>}
          {children && <div className="modalBody">{children}</div>}
        </div>
        <div className="modalActions">
          {onCancel && (
            <button
              className={`btn btn--${cancelVariant}`}
              type="button"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          {onSubmit && (
            <button
              className={`btn btn--${submitVariant}`}
              type="button"
              onClick={onSubmit}
            >
              {submitLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Modal
