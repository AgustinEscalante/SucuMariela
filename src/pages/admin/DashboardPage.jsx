import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { usePlants } from '../../hooks/usePlants'
import { useOrders } from '../../hooks/useOrders'
import { usePendingCareAlerts } from '../../hooks/useCare'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUSES } from '../../constants'

export default function DashboardPage() {
  const navigate = useNavigate()

  const { data: plants  = [] } = usePlants({ onlyActive: true })
  const { data: orders  = [] } = useOrders()
  const { data: alerts  = [] } = usePendingCareAlerts()

  const pendingOrders = orders.filter((o) =>
    ['nuevo', 'preparando', 'listo'].includes(o.status)
  )
  const readyOrders = orders.filter((o) => o.status === 'listo')
  const lowStock    = plants.filter((p) => p.stock <= 2 && p.active)
  const totalStock  = plants.reduce((acc, p) => acc + p.stock, 0)

  // Separamos vencidos (next_due_at < hoy) de los que vencen hoy
  const now      = new Date()
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
  const overdue  = alerts.filter((a) => new Date(a.next_due_at) < now)
  const dueToday = alerts.filter((a) => {
    const d = new Date(a.next_due_at)
    return d >= now && d <= todayEnd
  })

  const getStatusLabel = (value) =>
    ORDER_STATUSES.find((s) => s.value === value)?.label ?? value

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Inicio</h2>
      </div>

      {/* ── Alertas ── */}
      {readyOrders.length > 0 && (
        <div className="notif-bar">
          <strong>
            {readyOrders.length === 1
              ? '1 pedido listo para retirar'
              : `${readyOrders.length} pedidos listos para retirar`}
          </strong>
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="notif-bar" style={{ borderColor: '#fca5a5', background: 'var(--danger-light)' }}>
          <strong>
            {lowStock.length === 1
              ? `Stock bajo: ${lowStock[0].name}`
              : `Stock bajo en ${lowStock.length} plantas`}
          </strong>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="notif-bar" style={{ borderColor: '#fca5a5', background: 'var(--danger-light)' }}>
          <strong>
            {overdue.length === 1
              ? '1 cuidado vencido sin registrar'
              : `${overdue.length} cuidados vencidos sin registrar`}
          </strong>
          <button
            className="btn-secondary"
            style={{ fontSize: 12, marginLeft: 12, padding: '4px 10px' }}
            onClick={() => navigate('/admin/cuidados')}
          >
            Ver
          </button>
        </div>
      )}

      {dueToday.length > 0 && (
        <div className="notif-bar" style={{ borderColor: '#fde68a', background: 'var(--warning-light)', color: 'var(--warning)' }}>
          <strong>
            {dueToday.length === 1
              ? '1 cuidado programado para hoy'
              : `${dueToday.length} cuidados programados para hoy`}
          </strong>
          <button
            className="btn-secondary"
            style={{ fontSize: 12, marginLeft: 12, padding: '4px 10px' }}
            onClick={() => navigate('/admin/cuidados')}
          >
            Ver
          </button>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__value">{plants.length}</div>
          <div className="stat-card__label">Variedades</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{totalStock}</div>
          <div className="stat-card__label">Unidades en stock</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{pendingOrders.length}</div>
          <div className="stat-card__label">Pedidos pendientes</div>
        </div>
        <div className="stat-card" style={{ position: 'relative' }}>
          <div className="stat-card__value" style={{ color: overdue.length > 0 ? 'var(--danger)' : 'inherit' }}>
            {overdue.length + dueToday.length}
          </div>
          <div className="stat-card__label">Cuidados urgentes</div>
        </div>
      </div>

      {/* ── Cuidados pendientes ── */}
      {alerts.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12, marginTop: 28 }}>Cuidados pendientes</h3>
          <div className="table-wrapper" style={{ marginBottom: 32 }}>
            <table>
              <thead>
                <tr>
                  <th>Planta</th>
                  <th>Cuidado</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => {
                  const daysAgo = Math.ceil(
                    (now - new Date(alert.next_due_at)) / (1000 * 60 * 60 * 24)
                  )
                  const isOverdue = new Date(alert.next_due_at) < now

                  return (
                    <tr key={alert.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {alert.plants?.photo_url ? (
                            <img
                              src={alert.plants.photo_url}
                              alt={alert.plants.name}
                              style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{
                              width: 32, height: 32, borderRadius: 6,
                              background: 'var(--green-100)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 14,
                            }}>
                              ?
                            </div>
                          )}
                          <span style={{ fontWeight: 500 }}>{alert.plants?.name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{alert.care_processes?.icon}</span>
                          <span>{alert.care_processes?.name}</span>
                        </div>
                      </td>
                      <td className="text-muted">
                        {new Date(alert.next_due_at).toLocaleDateString('es-AR', {
                          day: 'numeric', month: 'short'
                        })}
                      </td>
                      <td>
                        <span className={'pill ' + (isOverdue ? 'pill--danger' : 'pill--warn')}>
                          {isOverdue
                            ? (daysAgo === 0 ? 'Hoy' : `Hace ${daysAgo}d`)
                            : 'Hoy'}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── Pedidos activos ── */}
      {pendingOrders.length > 0 && (
        <>
          <h3 style={{ marginBottom: 12 }}>Pedidos activos</h3>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Plantas</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                    <td className="text-muted">
                      {order.order_items?.map((item) =>
                        `${item.plants?.name} x${item.quantity}`
                      ).join(', ')}
                    </td>
                    <td style={{ fontWeight: 500 }}>{formatPrice(order.total)}</td>
                    <td>
                      <span className={'pill ' + (
                        order.status === 'listo'     ? 'pill--ok'   :
                        order.status === 'nuevo'     ? 'pill--info' : 'pill--warn'
                      )}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="text-muted">{formatDateTime(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {pendingOrders.length === 0 && alerts.length === 0 && (
        <p className="text-muted" style={{ marginTop: 8 }}>
          Todo al dia. No hay pedidos ni cuidados pendientes.
        </p>
      )}
    </AdminLayout>
  )
}