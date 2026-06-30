import { useState } from 'react'

// Colores de la paleta SucuMariela
const STATUS_CONFIG = {
  vencido:      { label: 'Vencido',     bg: '#4a6741', text: '#fff',     dot: '#c0392b' },
  hoy:          { label: 'Hoy',         bg: '#6b8f5e', text: '#fff',     dot: '#f39c12' },
  proximo:      { label: 'Próximo',     bg: '#8aad7a', text: '#fff',     dot: '#f1c40f' },
  al_dia:       { label: 'Al día',      bg: '#b5ccaa', text: '#2d4a24',  dot: '#6b8f5e' },
  sin_programar:{ label: 'Sin fecha',   bg: '#d0ddc9', text: '#4a6741',  dot: '#aaa'    },
}

function DaysLabel({ nextDueAt, status }) {
  if (!nextDueAt) return <span style={{ color: '#888', fontSize: 13 }}>Sin fecha</span>

  const days = Math.ceil((new Date(nextDueAt) - new Date()) / 86400000)
  if (days < 0)  return <span style={{ color: '#c0392b', fontWeight: 600, fontSize: 13 }}>Hace {Math.abs(days)}d</span>
  if (days === 0) return <span style={{ color: '#e67e22', fontWeight: 600, fontSize: 13 }}>Hoy</span>
  return <span style={{ color: '#4a6741', fontSize: 13 }}>En {days}d</span>
}

function ScheduleRow({ schedule, onLog, onEdit, onRemove }) {
  const process = schedule.care_processes
  const cfg = STATUS_CONFIG[schedule.status] || STATUS_CONFIG.al_dia

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 16px',
      borderRadius: 10,
      background: '#f7f9f6',
      border: '1px solid #e0e8da',
      marginBottom: 8,
    }}>
      {/* Dot de estado */}
      <span style={{
        width: 10, height: 10,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
      }} />

      {/* Ícono + nombre */}
      <span style={{ fontSize: 20 }}>{process?.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#2d4a24', lineHeight: 1.2 }}>
          {process?.name}
        </div>
        <div style={{ fontSize: 12, color: '#6b8f5e', marginTop: 2 }}>
          Cada {schedule.frequency_days} días ·{' '}
          <DaysLabel nextDueAt={schedule.next_due_at} status={schedule.status} />
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button
          onClick={() => onLog(schedule)}
          title="Registrar cuidado"
          style={{
            background: '#6b8f5e',
            color: '#fff',
            border: 'none',
            borderRadius: 7,
            padding: '5px 10px',
            fontSize: 13,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ✓ Hecho
        </button>
        <button
          onClick={() => onEdit(schedule)}
          title="Editar frecuencia"
          style={{
            background: '#e8f0e4',
            color: '#4a6741',
            border: 'none',
            borderRadius: 7,
            padding: '5px 8px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ✏️
        </button>
        <button
          onClick={() => onRemove(schedule)}
          title="Quitar proceso"
          style={{
            background: '#fce8e8',
            color: '#c0392b',
            border: 'none',
            borderRadius: 7,
            padding: '5px 8px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}

function AddScheduleForm({ availableProcesses, onAdd, onClose }) {
  const [processId, setProcessId] = useState(availableProcesses[0]?.id || '')
  const [frequencyDays, setFrequencyDays] = useState(7)
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const selectedProcess = availableProcesses.find((p) => p.id === processId)

  async function handleSubmit() {
    if (!processId) return
    setSaving(true)
    setError(null)
    try {
      await onAdd({ processId, frequencyDays, notifyEnabled })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (availableProcesses.length === 0) {
    return (
      <div style={{ padding: 16, color: '#6b8f5e', fontSize: 14, textAlign: 'center' }}>
        Todos los procesos ya están asignados a esta planta.
        <br />
        <button onClick={onClose} style={{ marginTop: 10, color: '#4a6741', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
          Cerrar
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 0 0' }}>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Proceso de cuidado</label>
        <select
          value={processId}
          onChange={(e) => {
            setProcessId(e.target.value)
            const p = availableProcesses.find((p) => p.id === e.target.value)
            if (p) setFrequencyDays(p.default_frequency_days)
          }}
          style={selectStyle}
        >
          {availableProcesses.map((p) => (
            <option key={p.id} value={p.id}>
              {p.icon} {p.name}
            </option>
          ))}
        </select>
        {selectedProcess?.description && (
          <p style={{ fontSize: 12, color: '#6b8f5e', margin: '4px 0 0' }}>
            {selectedProcess.description}
          </p>
        )}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Frecuencia (días)</label>
        <input
          type="number"
          min={1}
          max={365}
          value={frequencyDays}
          onChange={(e) => setFrequencyDays(Number(e.target.value))}
          style={inputStyle}
        />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#4a6741', cursor: 'pointer', marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={notifyEnabled}
          onChange={(e) => setNotifyEnabled(e.target.checked)}
          style={{ width: 16, height: 16 }}
        />
        Activar recordatorio
      </label>

      {error && <p style={{ color: '#c0392b', fontSize: 13, marginBottom: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{
            flex: 1,
            background: '#6b8f5e',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 0',
            fontSize: 14,
            fontWeight: 600,
            cursor: saving ? 'default' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? 'Guardando...' : 'Asignar proceso'}
        </button>
        <button
          onClick={onClose}
          style={{
            background: '#e8f0e4',
            color: '#4a6741',
            border: 'none',
            borderRadius: 8,
            padding: '10px 16px',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

function EditFrequencyForm({ schedule, onSave, onClose }) {
  const [frequencyDays, setFrequencyDays] = useState(schedule.frequency_days)
  const [notifyEnabled, setNotifyEnabled] = useState(schedule.notify_enabled)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit() {
    setSaving(true)
    setError(null)
    try {
      await onSave(schedule.id, { frequencyDays, notifyEnabled })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '8px 0 0' }}>
      <div style={{ fontWeight: 600, color: '#2d4a24', marginBottom: 12, fontSize: 15 }}>
        {schedule.care_processes?.icon} {schedule.care_processes?.name}
      </div>
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Frecuencia (días)</label>
        <input
          type="number"
          min={1}
          max={365}
          value={frequencyDays}
          onChange={(e) => setFrequencyDays(Number(e.target.value))}
          style={inputStyle}
        />
      </div>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#4a6741', cursor: 'pointer', marginBottom: 16 }}>
        <input
          type="checkbox"
          checked={notifyEnabled}
          onChange={(e) => setNotifyEnabled(e.target.checked)}
          style={{ width: 16, height: 16 }}
        />
        Activar recordatorio
      </label>
      {error && <p style={{ color: '#c0392b', fontSize: 13 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimary, flex: 1 }}>
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button onClick={onClose} style={btnSecondary}>Cancelar</button>
      </div>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────

export function CareScheduleManager({ schedules, availableProcesses, onAdd, onUpdate, onRemove, onLog }) {
  const [mode, setMode] = useState(null) // null | 'add' | { type: 'edit', schedule }
  const [confirmRemove, setConfirmRemove] = useState(null)
  const [removing, setRemoving] = useState(false)

  async function handleConfirmRemove() {
    if (!confirmRemove) return
    setRemoving(true)
    try {
      await onRemove(confirmRemove.id)
      setConfirmRemove(null)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div>
      {/* Lista de schedules */}
      {schedules.length === 0 && mode !== 'add' && (
        <p style={{ color: '#6b8f5e', fontSize: 14, margin: '0 0 12px' }}>
          Esta planta no tiene procesos de cuidado asignados aún.
        </p>
      )}

      {schedules.map((s) => (
        <ScheduleRow
          key={s.id}
          schedule={s}
          onLog={onLog}
          onEdit={(sch) => setMode({ type: 'edit', schedule: sch })}
          onRemove={(sch) => setConfirmRemove(sch)}
        />
      ))}

      {/* Formulario inline para agregar */}
      {mode === 'add' ? (
        <div style={{ background: '#f0f5ed', borderRadius: 10, padding: 16, marginTop: 8, border: '1px solid #c5d9bb' }}>
          <div style={{ fontWeight: 700, color: '#2d4a24', marginBottom: 4, fontSize: 15 }}>Asignar proceso de cuidado</div>
          <AddScheduleForm
            availableProcesses={availableProcesses}
            onAdd={onAdd}
            onClose={() => setMode(null)}
          />
        </div>
      ) : mode?.type === 'edit' ? (
        <div style={{ background: '#f0f5ed', borderRadius: 10, padding: 16, marginTop: 8, border: '1px solid #c5d9bb' }}>
          <div style={{ fontWeight: 700, color: '#2d4a24', marginBottom: 4, fontSize: 15 }}>Editar frecuencia</div>
          <EditFrequencyForm
            schedule={mode.schedule}
            onSave={onUpdate}
            onClose={() => setMode(null)}
          />
        </div>
      ) : (
        <button
          onClick={() => setMode('add')}
          disabled={availableProcesses.length === 0}
          style={{
            marginTop: 8,
            background: 'none',
            border: '2px dashed #8aad7a',
            borderRadius: 10,
            color: '#4a6741',
            fontSize: 14,
            fontWeight: 600,
            padding: '10px 16px',
            cursor: availableProcesses.length === 0 ? 'default' : 'pointer',
            width: '100%',
            opacity: availableProcesses.length === 0 ? 0.5 : 1,
          }}
        >
          + Asignar proceso de cuidado
        </button>
      )}

      {/* Confirm remove */}
      {confirmRemove && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 24, maxWidth: 320, width: '90%', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🗑️</div>
            <p style={{ fontWeight: 600, color: '#2d4a24', marginBottom: 8 }}>
              ¿Quitar "{confirmRemove.care_processes?.name}" de esta planta?
            </p>
            <p style={{ color: '#6b8f5e', fontSize: 13, marginBottom: 20 }}>
              El historial de cuidados se conserva. Solo se borra la programación futura.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleConfirmRemove}
                disabled={removing}
                style={{ ...btnDanger, flex: 1 }}
              >
                {removing ? 'Quitando...' : 'Sí, quitar'}
              </button>
              <button onClick={() => setConfirmRemove(null)} style={{ ...btnSecondary, flex: 1 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#4a6741',
  marginBottom: 6,
}

const inputStyle = {
  width: '100%',
  border: '1.5px solid #c5d9bb',
  borderRadius: 8,
  padding: '8px 10px',
  fontSize: 14,
  color: '#2d4a24',
  background: '#fff',
  boxSizing: 'border-box',
  outline: 'none',
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
}

const btnPrimary = {
  background: '#6b8f5e',
  color: '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}

const btnSecondary = {
  background: '#e8f0e4',
  color: '#4a6741',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontSize: 14,
  cursor: 'pointer',
}

const btnDanger = {
  background: '#fce8e8',
  color: '#c0392b',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}
