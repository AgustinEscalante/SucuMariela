import { supabase } from '../lib/supabase'

export const getSettings = async () => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')

  if (error) throw error

  return data.reduce((acc, { key, value }) => {
    acc[key] = value
    return acc
  }, {})
}

export const updateSetting = async (key, value) => {
  const { error } = await supabase
    .from('settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('key', key)

  if (error) throw error
}