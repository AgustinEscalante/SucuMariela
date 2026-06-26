import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useOrders, useUpdateOrderStatus } from '../../hooks/useOrders'
import { formatPrice, formatDateTime } from '../../utils/formatters'
import { ORDER_STATUSES } from '../../constants'

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState('')
  const { data: orders = [], isLoading } = useOrders(
    filterStatus ? { status: filterStatus } : {}
  )
  const updateStatus = useUpdateOrderStatus()

  const getStatusLabel = (value) =>
    ORDER_STATUSES.find((s) => s.value === value)?.label ?? value

  const getStatusPill = (status) => {
    const map = {
      nuevo: 'pill--info',
      preparando: 'pill--warn',
      listo: 'pill--ok',
      entregado: 'pill--gray',
      cancelado: 'pill--danger',
    }
    return map[status] ?? 'pill--gray'
  }

  const getNextStatus = (current) => {
    const flow = {
      nuevo: 'preparando',
      preparando: 'listo',
      listo: 'entregado',
    }
    return flow[current] ?? null
  }

  const getNextStatusLabel = (current) => {
    const labels = {
      nuevo: 'Marcar preparando',
      preparando: 'Marcar listo',
      listo: 'Marcar entregado',
    }
    return labels[current] ?? null
  }

  const handleStatusChange = async (id, status) => {
    await updateStatus.mutateAsync({ id, status })
  }

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Pedidos</h2>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          className={filterStatus === '' ? 'btn-primary' : 'btn-secondary'}
          style={{ fontSize: 12, padding: '6px 14px' }}
          onClick={() => setFilterStatus('')}
        >
          Todos
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s.value}
            className={filterStatus === s.value ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={() => setFilterStatus(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-muted">Cargando pedidos...</p>
      ) : orders.length === 0 ? (
        <p className="text-muted">No hay pedidos.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Telefono</th>
                <th>Plantas</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 500 }}>{order.customer_name}</td>
                  <td className="text-muted">{order.customer_phone ?? '-'}</td>
                  <td className="text-muted">
                    {order.order_items?.map((item) =>
                      `${item.plants?.name} x${item.quantity}`
                    ).join(', ')}
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatPrice(order.total)}</td>
                  <td>
                    <span className={`pill ${getStatusPill(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="text-muted">{formatDateTime(order.created_at)}</td>
                  <td>
                    <div className="flex-center gap-8">
                      {getNextStatus(order.status) && (
                        <button
                          className="btn-secondary"
                          style={{ fontSize: 11 }}
                          onClick={() => handleStatusChange(order.id, getNextStatus(order.status))}
                          disabled={updateStatus.isPending}
                        >
                          {getNextStatusLabel(order.status)}
                        </button>
                      )}
                      {order.status !== 'cancelado' && order.status !== 'entregado' && (
                        <button
                          className="btn-icon"
                          style={{ color: 'var(--danger)', fontSize: 11 }}
                          onClick={() => {
                            if (confirm('Seguro que queres cancelar este pedido?')) {
                              handleStatusChange(order.id, 'cancelado')
                            }
                          }}
                          disabled={updateStatus.isPending}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}