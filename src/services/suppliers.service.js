import { supabase } from '../lib/supabase'

export const getSuppliers = async () => {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export const createSupplier = async (supplierData) => {
  const { data, error } = await supabase
    .from('suppliers')
    .insert([supplierData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateSupplier = async (id, supplierData) => {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplierData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}