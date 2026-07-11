export default function ConfirmModal({ show, title, message, confirmLabel, confirmClass, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onCancel} />
      <div className="modal fade show d-block" tabIndex="-1" onClick={onCancel}>
        <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{title || 'Confirm'}</h5>
              <button type="button" className="btn-close" onClick={onCancel} />
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
              <button className={`btn ${confirmClass || 'btn-danger'}`} onClick={onConfirm}>
                {confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
