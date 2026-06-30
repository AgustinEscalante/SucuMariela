/**
 * Modal.jsx — componente reutilizable centrado en desktop, fullscreen en mobile.
 * Va en: src/components/admin/Modal.jsx
 *
 * Uso:
 *   <Modal title="Cuidados de Echeveria" onClose={() => setOpen(false)}>
 *     contenido
 *   </Modal>
 */
export default function Modal({ title, onClose, children, maxWidth = 540 }) {
  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-box" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
