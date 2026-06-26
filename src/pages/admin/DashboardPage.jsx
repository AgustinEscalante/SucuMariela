import AdminLayout from '../../components/admin/AdminLayout'
import { usePlants } from '../../hooks/usePlants'
import { useOrders } from '../../hooks/useOrders'
import { useCareProcesses } from '../../hooks/useCare'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUSES } from '../../constants'

export default function DashboardPage() {
  const { data: plants = [] } = usePlants({ onlyActive: true })
  const { data: orders = [] } = useOrders()
  const { data: careProcesses = [] } = useCareProcesses()

  const pendingOrders = orders.filter((o) =>
    ['nuevo', 'preparando', 'listo'].includes(o.status)
  )
  const readyOrders = orders.filter((o) => o.status === 'listo')
  const lowStock = plants.filter((p) => p.stock <= 2 && p.active)
  const totalStock = plants.reduce((acc, p) => acc + p.stock, 0)

  const getStatusLabel = (value) =>
    ORDER_STATUSES.find((s) => s.value === value)?.label ?? value

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Inicio</h2>
      </div>

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
        <div className="stat-card">
          <div className="stat-card__value">{careProcesses.length}</div>
          <div className="stat-card__label">Tipos de cuidado</div>
        </div>
      </div>

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
                      <span className={`pill ${
                        order.status === 'listo' ? 'pill--ok' :
                        order.status === 'nuevo' ? 'pill--info' : 'pill--warn'
                      }`}>
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

      {pendingOrders.length === 0 && (
        <p className="text-muted" style={{ marginTop: 8 }}>
          No hay pedidos pendientes.
        </p>
      )}
    </AdminLayout>
  )
}