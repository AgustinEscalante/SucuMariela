// src/pages/admin/StatsPage.jsx — version corregida
import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import {
  usePlantSales,
  useRevenueByMonth,
  useExpenses,
  useCreateExpense,
  useDeleteExpense,
} from '../../hooks/useStats'
import { groupByMonth } from '../../services/stats.service'
import { formatPrice } from '../../utils/formatters'

const EXPENSE_CATEGORIES = [
  { value: 'insumos',      label: 'Insumos' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'envios',       label: 'Envios' },
  { value: 'publicidad',   label: 'Publicidad' },
  { value: 'general',      label: 'General' },
  { value: 'otro',         label: 'Otro' },
]

function BarChart({ data, color = 'var(--green-500)', label = '' }) {
  const max = Math.max(...data.map((d) => d.value), 1)

  return (
    <div>
      {label && <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-700)', marginBottom: 12 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
        {data.map(({ month, value }) => (
          <div key={month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, color: 'var(--gray-500)', fontWeight: 500 }}>
              {value > 0 ? formatPrice(value) : ''}
            </div>
            <div style={{
              width: '100%',
              height: Math.max((value / max) * 90, value > 0 ? 4 : 0),
              background: color,
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s',
              minHeight: value > 0 ? 4 : 0,
            }} />
            <div style={{ fontSize: 10, color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{month}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ExpenseForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    description: '',
    amount:      '',
    category:    'general',
    date:        new Date().toISOString().split('T')[0],
    notes:       '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ fontWeight: 600, color: 'var(--green-700)', marginBottom: 12 }}>Nuevo gasto</div>
      <div className="form-grid">
        <div className="field">
          <label>Descripcion</label>
          <input value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Ej: Tierra para macetas" />
        </div>
        <div className="field">
          <label>Monto</label>
          <input type="number" min="0" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" />
        </div>
        <div className="field">
          <label>Categoria</label>
          <select value={form.category} onChange={(e) => set('category', e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Fecha</label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div className="field field--full">
          <label>Notas (opcional)</label>
          <input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Detalle adicional..." />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'flex-end' }}>
        <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
        <button
          className="btn-primary"
          onClick={() => {
            if (!form.description || !form.amount) return
            onSave({ ...form, amount: Number(form.amount) })
          }}
        >
          Guardar gasto
        </button>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const { data: sales    = [] } = usePlantSales()
  const { data: revenue  = [] } = useRevenueByMonth()
  const { data: expenses = [] } = useExpenses()
  const createExpense = useCreateExpense()
  const deleteExpense = useDeleteExpense()

  const revenueByMonth  = groupByMonth(revenue,  'delivered_at', 'total')
  const expensesByMonth = groupByMonth(expenses, 'date',         'amount')

  const totalRevenue  = revenue.reduce((a, o) => a + Number(o.total), 0)
  const totalExpenses = expenses.reduce((a, e) => a + Number(e.amount), 0)
  const netProfit     = totalRevenue - totalExpenses

  const now       = new Date()
  const thisMonth = (item) => {
    const d = new Date(item.delivered_at || item.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  const monthRevenue  = revenue.filter(thisMonth).reduce((a, o) => a + Number(o.total), 0)
  const monthExpenses = expenses.filter(thisMonth).reduce((a, e) => a + Number(e.amount), 0)

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Estadisticas</h2>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--green-600)' }}>{formatPrice(monthRevenue)}</div>
          <div className="stat-card__label">Ingresos este mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: 'var(--danger)' }}>{formatPrice(monthExpenses)}</div>
          <div className="stat-card__label">Gastos este mes</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value" style={{ color: netProfit >= 0 ? 'var(--green-600)' : 'var(--danger)' }}>
            {formatPrice(netProfit)}
          </div>
          <div className="stat-card__label">Ganancia neta (6m)</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{sales.filter((s) => s.total_units_sold > 0).length}</div>
          <div className="stat-card__label">Plantas vendidas</div>
        </div>
      </div>

      {/* Graficos — clase en vez de inline style para poder sobreescribir en mobile */}
      <div className="stats-charts-grid" style={{ marginBottom: 24 }}>
        <div className="card">
          <BarChart data={revenueByMonth}  color="var(--green-500)" label="Ingresos por mes" />
        </div>
        <div className="card">
          <BarChart data={expensesByMonth} color="var(--danger)"    label="Gastos por mes" />
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 14 }}>Ventas por planta</h3>
        {sales.length === 0 ? (
          <p className="text-muted">No hay ventas registradas todavia.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Planta</th>
                  <th>Unidades vendidas</th>
                  <th>Ingresos</th>
                  <th>Pedidos</th>
                  <th>Ultima venta</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.plant_id}>
                    <td style={{ fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {s.photo_url ? (
                          <img src={s.photo_url} alt={s.plant_name}
                            style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'var(--green-100)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>?</div>
                        )}
                        {s.plant_name}
                      </div>
                    </td>
                    <td>{s.total_units_sold}</td>
                    <td style={{ fontWeight: 600, color: 'var(--green-700)' }}>{formatPrice(s.total_revenue)}</td>
                    <td>{s.total_orders}</td>
                    <td className="text-muted">
                      {s.last_sale_at
                        ? new Date(s.last_sale_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3>Gastos</h3>
        <button className="btn-primary" onClick={() => setShowExpenseForm((v) => !v)}>
          {showExpenseForm ? 'Cancelar' : '+ Nuevo gasto'}
        </button>
      </div>

      {showExpenseForm && (
        <ExpenseForm
          onSave={async (data) => {
            await createExpense.mutateAsync(data)
            setShowExpenseForm(false)
          }}
          onCancel={() => setShowExpenseForm(false)}
        />
      )}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Descripcion</th>
              <th>Categoria</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Notas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr><td colSpan={6} className="text-muted" style={{ textAlign: 'center', padding: 24 }}>
                No hay gastos registrados todavia.
              </td></tr>
            ) : expenses.map((e) => (
              <tr key={e.id}>
                <td style={{ fontWeight: 500 }}>{e.description}</td>
                <td>
                  <span className="pill pill--info">
                    {EXPENSE_CATEGORIES.find((c) => c.value === e.category)?.label ?? e.category}
                  </span>
                </td>
                <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{formatPrice(e.amount)}</td>
                <td className="text-muted">
                  {new Date(e.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: '2-digit' })}
                </td>
                <td className="text-muted">{e.notes || '—'}</td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ fontSize: 12 }}
                    onClick={() => {
                      if (window.confirm('Eliminar este gasto?')) deleteExpense.mutate(e.id)
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}