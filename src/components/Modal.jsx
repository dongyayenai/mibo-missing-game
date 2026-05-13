export default function Modal({
  open,
  title,
  message,
  rewardIcon,
  variant,
  children,
  actions = [{ label: '好', onClick: undefined }],
  onClose,
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(event) => {
        event.stopPropagation();
        onClose?.();
      }}
    >
      <section
        className={[
          'modal',
          rewardIcon ? 'modal--win' : '',
          variant === 'final-win' ? 'modal--final-win' : '',
        ].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {variant === 'final-win' && (
          <div className="final-celebration" aria-hidden="true">
            <span>★</span>
            <span>🐾</span>
            <span>✦</span>
            <span>🐾</span>
            <span>★</span>
          </div>
        )}
        {rewardIcon && (
          <div className="modal__reward">
            <img src={`/images/tiles/${encodeURIComponent(rewardIcon)}`} alt="" draggable="false" />
          </div>
        )}
        <h2 id="modal-title">{title}</h2>
        <p>{message}</p>
        {children}
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
