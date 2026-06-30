/**
 * CareHistory
 * Muestra el historial de cuidados de una planta en formato timeline.
 *
 * Props:
 * - history: array de care_logs con care_processes embebido
 * - onDelete(logId): async, elimina un registro (solo para correcciones)
 */
export function CareHistory({ history, onDelete }) {
  if (history.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '32px 0',
        color: '#8aad7a',
      }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
        <p style={{ fontSize: 14, color: '#6b8f5e', margin: 0 }}>
          Aún no hay cuidados registrados para esta planta.
        </p>
        <p style={{ fontSize: 13, color: '#aaa', marginTop: 4 }}>
          Usá el botón "✓ Hecho" en un proceso para empezar.
        </p>
      </div>
    )
  }

  // Agrupamos por mes para separar visualmente
  const grouped = groupByMonth(history)

  return (
    <div>
      {grouped.map(({ monthLabel, entries }) => (
        <div key={monthLabel}>
          {/* Separador de mes */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            margin: '16px 0 10px',
          }}>
            <span style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#6b8f5e',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {monthLabel}
            </span>
            <div style={{ flex: 1, height: 1, background: '#e0e8da' }} />
          </div>

          {entries.map((log) => (
            <HistoryRow key={log.id} log={log} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  )
}

function HistoryRow({ log, onDelete }) {
  const process = log.care_processes
  const date = new Date(log.done_at)
  const dateStr = date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '10px 0',
      borderBottom: '1px solid #f0f5ed',
    }}>
      {/* Ícono */}
      <div style={{
        width: 36, height: 36,
        borderRadius: '50%',
        background: '#e8f0e4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18,
        flexShrink: 0,
        marginTop: 2,
      }}>
        {process?.icon || '🌿'}
      </div>

      {/* Contenido */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: '#2d4a24' }}>
          {process?.name || '—'}
        </div>
        {log.notes && (
          <div style={{
            fontSize: 13,
            color: '#5a7a50',
            marginTop: 2,
            fontStyle: 'italic',
            wordBreak: 'break-word',
          }}>
            "{log.notes}"
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{ fontSize: 12, color: '#8aad7a' }}>
            {dateStr} · {timeStr}
          </span>
          {log.confirmed_via && log.confirmed_via !== 'app' && (
            <span style={{
              fontSize: 11,
              background: '#e8f0e4',
              color: '#4a6741',
              borderRadius: 4,
              padding: '1px 6px',
            }}>
              {log.confirmed_via}
            </span>
          )}
        </div>
      </div>

      {/* Borrar (solo corrección) */}
      {onDelete && (
        <button
          onClick={() => {
            if (window.confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) {
              onDelete(log.id)
            }
          }}
          title="Eliminar registro"
          style={{
            background: 'none',
            border: 'none',
            color: '#ccc',
            fontSize: 16,
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: 6,
            flexShrink: 0,
            lineHeight: 1,
          }}
          onMouseEnter={(e) => (e.target.style.color = '#c0392b')}
          onMouseLeave={(e) => (e.target.style.color = '#ccc')}
        >
          ✕
        </button>
      )}
    </div>
  )
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function groupByMonth(logs) {
  const map = new Map()
  for (const log of logs) {
    const d = new Date(log.done_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
    if (!map.has(key)) map.set(key, { monthLabel: capitalize(label), entries: [] })
    map.get(key).entries.push(log)
  }
  return [...map.values()]
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
