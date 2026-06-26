import { supabase } from '../lib/supabase'

export const getOrders = async ({ status } = {}) => {
  let query = supabase
    .from('orders')
    .select(`*, order_items(id, quantity, unit_price, plants(id, name, photo_url))`)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const createOrder = async (orderData, items) => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()

  if (orderError) throw orderError

  const orderItems = items.map((item) => ({
    order_id: order.id,
    plant_id: item.plant_id,
    quantity: item.quantity,
    unit_price: item.unit_price,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) throw itemsError
  return order
}

export const updateOrderStatus = async (id, status) => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      ...(status === 'entregado' ? { delivered_at: new Date().toISOString() } : {}),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}