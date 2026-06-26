import { supabase } from '../lib/supabase'

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

export const getPlantCareSchedules = async (plantId) => {
  const { data, error } = await supabase
    .from('plant_care_schedules')
    .select(`*, care_processes(id, name, icon)`)
    .eq('plant_id', plantId)
    .order('next_due_at')

  if (error) throw error
  return data
}

export const createCareSchedule = async (scheduleData) => {
  const { data, error } = await supabase
    .from('plant_care_schedules')
    .insert([scheduleData])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getCareLogs = async (plantId) => {
  const { data, error } = await supabase
    .from('care_logs')
    .select(`*, care_processes(id, name, icon)`)
    .eq('plant_id', plantId)
    .order('done_at', { ascending: false })
    .limit(50)

  if (error) throw error
  return data
}

export const logCare = async ({ plant_id, process_id, notes, confirmed_via = 'app' }) => {
  const { data, error } = await supabase
    .from('care_logs')
    .insert([{ plant_id, process_id, notes, confirmed_via, done_at: new Date().toISOString() }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const getPendingCareAlerts = async () => {
  const { data, error } = await supabase
    .from('plant_care_schedules')
    .select(`*, plants(id, name, photo_url), care_processes(id, name, icon)`)
    .lte('next_due_at', new Date().toISOString())
    .eq('notify_enabled', true)
    .order('next_due_at')

  if (error) throw error
  return data
}