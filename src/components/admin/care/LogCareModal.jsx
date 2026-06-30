/**
 * LogCareModal.jsx
 * Va en: src/components/admin/care/LogCareModal.jsx
 */
import { useState } from 'react'
import Modal from '../Modal'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function LogCareModal({ schedule, onConfirm, onClose }) {
  const process = schedule?.care_processes

  const [notes, setNotes]     = useState('')
  const [doneAt, setDoneAt]   = useState(todayISO())
  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState(null)

  async function handleConfirm() {
    setSaving(true)
    setError(null)
    try {
      await onConfirm({
        process_id: process.id,
        notes,
        done_at: new Date(doneAt).toISOString(),
        confirmed_via: 'app',
      })
      setSuccess(true)
      setTimeout(onClose, 900)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Modal
      title={(process?.icon ? process.icon + ' ' : '') + (process?.name ?? 'Cuidado')}
      onClose={onClose}
      maxWidth={400}
    >
      {success ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
          <p style={{ fontWeight: 600, color: 'var(--green-700)' }}>Cuidado registrado</p>
          <p className="text-muted" style={{ marginTop: 4 }}>
            El proximo recordatorio se actualizo automaticamente.
          </p>
        </div>
      ) : (
        <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>

          <div className="field">
            <label>Cuando se hizo?</label>
            <input
              type="date"
              value={doneAt}
              max={todayISO()}
              onChange={(e) => setDoneAt(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: use fertilizante liquido, tierra muy seca..."
              rows={3}
            />
          </div>

          {error && <span className="error-msg">{error}</span>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleConfirm}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Confirmar cuidado'}
            </button>
          </div>

        </div>
      )}
    </Modal>
  )
}
