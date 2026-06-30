import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../../hooks/useNotifications'

const TYPE_CONFIG = {
  cuidado_vencido: { icon: '🌿', label: 'Cuidado' },
  pedido_listo:    { icon: '📦', label: 'Pedido' },
  stock_bajo:      { icon: '⚠️', label: 'Stock' },
}

function timeAgo(dateStr) {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 1000)
  if (diff < 60)   return 'ahora'
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
  return `hace ${Math.floor(diff / 86400)}d`
}

export default function NotificationsPanel({ onClose }) {
  const { data: notifications = [], isLoading } = useNotifications()
  const markAsRead    = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotif   = useDeleteNotification()

  const unread = notifications.filter((n) => !n.read).length

  return (
    <div className="notif-panel">
      <div className="notif-panel__header">
        <span className="notif-panel__title">Notificaciones</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unread > 0 && (
            <button
              className="btn-icon"
              style={{ fontSize: 11 }}
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              Marcar todas leidas
            </button>
          )}
          <button className="notif-panel__close" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="notif-panel__body">
        {isLoading && <p className="text-muted" style={{ padding: 16 }}>Cargando...</p>}

        {!isLoading && notifications.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <p className="text-muted">Todo al dia, no hay notificaciones.</p>
          </div>
        )}

        {notifications.map((n) => {
          const cfg = TYPE_CONFIG[n.type] ?? { icon: '📌', label: n.type }
          return (
            <div
              key={n.id}
              className={'notif-item' + (n.read ? '' : ' notif-item--unread')}
              onClick={() => !n.read && markAsRead.mutate(n.id)}
            >
              <div className="notif-item__icon">{cfg.icon}</div>
              <div className="notif-item__content">
                <div className="notif-item__title">{n.title}</div>
                {n.body && <div className="notif-item__body">{n.body}</div>}
                <div className="notif-item__time">{timeAgo(n.created_at)}</div>
              </div>
              <button
                className="notif-item__delete"
                onClick={(e) => { e.stopPropagation(); deleteNotif.mutate(n.id) }}
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}