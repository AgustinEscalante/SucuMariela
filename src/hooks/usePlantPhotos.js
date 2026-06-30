// src/hooks/usePlantPhotos.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlantPhotos,
  uploadPlantPhoto,
  deletePlantPhoto,
  reorderPlantPhotos,
} from '../services/plantPhotos.service'

export const usePlantPhotos = (plantId) => {
  return useQuery({
    queryKey: ['plant-photos', plantId],
    queryFn:  () => getPlantPhotos(plantId),
    enabled:  !!plantId,
  })
}

export const useUploadPlantPhoto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ plantId, file, orderIndex }) =>
      uploadPlantPhoto(plantId, file, orderIndex),
    onSuccess: (_, { plantId }) => {
      queryClient.invalidateQueries({ queryKey: ['plant-photos', plantId] })
    },
  })
}

export const useDeletePlantPhoto = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ photo }) => deletePlantPhoto(photo),
    onSuccess: (_, { plantId }) => {
      queryClient.invalidateQueries({ queryKey: ['plant-photos', plantId] })
    },
  })
}

export const useReorderPlantPhotos = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ photos }) => reorderPlantPhotos(photos),
    onSuccess: (_, { plantId }) => {
      queryClient.invalidateQueries({ queryKey: ['plant-photos', plantId] })
    },
  })
}
