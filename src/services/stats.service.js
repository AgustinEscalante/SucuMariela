// src/services/stats.service.js
import { supabase } from '../lib/supabase'

// ─── VISTAS ──────────────────────────────────────────────────────────────────

export const trackPlantView = async (plantId, source = 'catalogo') => {
  await supabase.from('plant_views').insert([{ plant_id: plantId, source }])
}

export const getPlantViewsByMonth = async () => {
  const { data, error } = await supabase
    .from('plant_views')
    .select('plant_id, viewed_at, plants(name)')
    .gte('viewed_at', new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString())
    .order('viewed_at')

  if (error) throw error
  return data
}

// ─── VENTAS ──────────────────────────────────────────────────────────────────

export const getPlantSalesSummary = async () => {
  const { data, error } = await supabase
    .from('plant_sales_summary')
    .select('*')

  if (error) throw error
  return data
}

export const getRevenueByMonth = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select('total, delivered_at')
    .eq('status', 'entregado')
    .gte('delivered_at', new Date(new Date().setMonth(new Date().getMonth() - 5)).toISOString())
    .order('delivered_at')

  if (error) throw error
  return data
}

// ─── GASTOS ──────────────────────────────────────────────────────────────────

export const getExpenses = async () => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })

  if (error) throw error
  return data
}

export const createExpense = async (expense) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expense])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteExpense = async (id) => {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Agrupa array de { date, value } por mes → [{ month: 'Ene', value: 0 }, ...]
export const groupByMonth = (items, dateField, valueField) => {
  const months = {}
  const now = new Date()

  // Inicializar ultimos 6 meses en 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
    months[key] = 0
  }

  for (const item of items) {
    const d = new Date(item[dateField])
    const key = d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })
    if (key in months) {
      months[key] += Number(item[valueField] || 0)
    }
  }

  return Object.entries(months).map(([month, value]) => ({ month, value }))
}
