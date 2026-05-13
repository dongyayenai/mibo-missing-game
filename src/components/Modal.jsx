export default function Modal({
  open,
  title,
  message,
  rewardIcon,
  actions = [{ label: '好', onClick: undefined }],
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className={rewardIcon ? 'modal modal--win' : 'modal'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {rewardIcon && (
          <div className="modal__reward">
            <img src={`/images/tiles/${encodeURIComponent(rewardIcon)}`} alt="" draggable="false" />
          </div>
        )}
        <h2 id="modal-title">{title}</h2>
        <p>{message}</p>
        <div className="modal__actions">
          {actions.map((action) => (
            <button
              key={action.label}
              className="primary-button"
              type="button"
              onClick={action.onClick ?? onClose}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
