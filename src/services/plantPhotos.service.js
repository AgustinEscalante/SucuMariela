// src/services/plantPhotos.service.js
import { supabase } from '../lib/supabase'
import { compressImage } from '../utils/imageCompression'

export const getPlantPhotos = async (plantId) => {
  const { data, error } = await supabase
    .from('plant_photos')
    .select('*')
    .eq('plant_id', plantId)
    .order('order_index')

  if (error) throw error
  return data
}

export const uploadPlantPhoto = async (plantId, file, orderIndex = 0) => {
  const compressed = await compressImage(file)
  const ext      = file.name.split('.').pop()
  const fileName = Date.now() + '-' + Math.random().toString(36).slice(2) + '.' + ext
  const path     = 'plants/' + plantId + '/' + fileName

  const { error: uploadError } = await supabase.storage
    .from('plant-photos')
    .upload(path, compressed)

  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage
    .from('plant-photos')
    .getPublicUrl(path)

  const { data, error } = await supabase
    .from('plant_photos')
    .insert([{
      plant_id:    plantId,
      url:         urlData.publicUrl,
      order_index: orderIndex,
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export const deletePlantPhoto = async (photo) => {
  // Extraer el path del storage desde la URL publica
  const url      = new URL(photo.url)
  const pathParts = url.pathname.split('/plant-photos/')
  const storagePath = pathParts[1]

  if (storagePath) {
    await supabase.storage.from('plant-photos').remove([storagePath])
  }

  const { error } = await supabase
    .from('plant_photos')
    .delete()
    .eq('id', photo.id)

  if (error) throw error
}

export const reorderPlantPhotos = async (photos) => {
  // photos: array de { id, order_index }
  const updates = photos.map((p, i) =>
    supabase
      .from('plant_photos')
      .update({ order_index: i })
      .eq('id', p.id)
  )

  await Promise.all(updates)
}
