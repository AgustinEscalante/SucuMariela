import { supabase } from '../lib/supabase'

// ─── CARE PROCESSES ───────────────────────────────────────────────────────────

export const getCareProcesses = async () => {
  const { data, error } = await supabase
    .from('care_processes')
    .select('*')
    .order('name')

  if (error) throw error
  return data
}

export const createCareProcess = async (processData) => {
  const { data, error } = await supabase
    .from('care_processes')
    .insert([{ ...processData, is_custom: true }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCareProcess = async (id, processData) => {
  const { data, error } = await supabase
    .from('care_processes')
    .update(processData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCareProcess = async (id) => {
  const { error } = await supabase
    .from('care_processes')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── SCHEDULES ────────────────────────────────────────────────────────────────

export const getPlantCareSchedules = async (plantId) => {
  const { data, error } = await supabase
    .from('plant_care_schedules')
    .select('*, care_processes(id, name, icon, description, default_frequency_days)')
    .eq('plant_id', plantId)
    .order('next_due_at')

  if (error) throw error
  return data
}

export const addSchedule = async ({ plant_id, process_id, frequency_days, notify_enabled = true }) => {
  const days = parseInt(frequency_days, 10)
  const nextDueAt = new Date()
  nextDueAt.setDate(nextDueAt.getDate() + days)

  const { data, error } = await supabase
    .from('plant_care_schedules')
    .insert([{
      plant_id,
      process_id,
      frequency_days: days,
      notify_enabled,
      next_due_at: nextDueAt.toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateSchedule = async (id, { frequency_days, notify_enabled }) => {
  const updates = {}
  if (frequency_days !== undefined) updates.frequency_days = frequency_days
  if (notify_enabled !== undefined) updates.notify_enabled = notify_enabled

  const { data, error } = await supabase
    .from('plant_care_schedules')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const removeSchedule = async (id) => {
  const { error } = await supabase
    .from('plant_care_schedules')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getPendingCareAlerts = async () => {
  const { data, error } = await supabase
    .from('plant_care_schedules')
    .select('*, plants!inner(id, name, photo_url, active), care_processes(id, name, icon)')
    .lte('next_due_at', new Date().toISOString())
    .eq('notify_enabled', true)
    .eq('plants.active', true)
    .order('next_due_at')

  if (error) throw error
  return data
}

// ─── CARE LOGS ────────────────────────────────────────────────────────────────

export const getCareLogs = async (plantId) => {
  const { data, error } = await supabase
    .from('care_logs')
    .select('*, care_processes(id, name, icon)')
    .eq('plant_id', plantId)
    .order('done_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

export const logCare = async ({ plant_id, process_id, notes, done_at, confirmed_via = 'app' }) => {
  const { data, error } = await supabase
    .from('care_logs')
    .insert([{
      plant_id,
      process_id,
      notes,
      confirmed_via,
      done_at: done_at || new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteCareLog = async (id) => {
  const { error } = await supabase
    .from('care_logs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export const getCareStatus = (nextDueAt) => {
  if (!nextDueAt) return 'sin_programar'
  const days = Math.ceil((new Date(nextDueAt) - new Date()) / (1000 * 60 * 60 * 24))
  if (days < 0) return 'vencido'
  if (days === 0) return 'hoy'
  if (days <= 2) return 'proximo'
  return 'al_dia'
}