import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/imageCompression'

export const getPlants = async ({ onlyActive = true } = {}) => {
  let query = supabase
    .from('plants')
    .select(`*, suppliers(id, name)`)
    .order('name')

  if (onlyActive) query = query.eq('active', true)

  const { data, error } = await query
  if (error) throw error
  return data
}

export const getPlantById = async (id) => {
  const { data, error } = await supabase
    .from('plants')
    .select(`*, suppliers(id, name)`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export const createPlant = async (plantData, photoFile) => {
  let photo_url = null

  if (photoFile) {
    photo_url = await uploadPlantPhoto(photoFile)
  }

  const { data, error } = await supabase
    .from('plants')
    .insert([{ ...plantData, photo_url }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const updatePlant = async (id, plantData, photoFile) => {
  let updates = { ...plantData }

  if (photoFile) {
    updates.photo_url = await uploadPlantPhoto(photoFile)
  }

  const { data, error } = await supabase
    .from('plants')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deletePlant = async (id) => {
  const { error } = await supabase
    .from('plants')
    .update({ active: false })
    .eq('id', id)

  if (error) throw error
}

const uploadPlantPhoto = async (file) => {
  const compressed = await compressImage(file)
  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const path = `plants/${fileName}`

  const { error } = await supabase.storage
    .from('plant-photos')
    .upload(path, compressed)

  if (error) throw error

  const { data } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(path)

  return data.publicUrl
}