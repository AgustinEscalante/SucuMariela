import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
} from '../services/plants.service'

export const usePlants = (options = {}) => {
  return useQuery({
    queryKey: ['plants', options],
    queryFn: () => getPlants(options),
  })
}

export const usePlant = (id) => {
  return useQuery({
    queryKey: ['plants', id],
    queryFn: () => getPlantById(id),
    enabled: !!id,
  })
}

export const useCreatePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ plantData, photoFile }) => createPlant(plantData, photoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
    },
  })
}

export const useUpdatePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, plantData, photoFile }) => updatePlant(id, plantData, photoFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
    },
  })
}

export const useDeletePlant = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => deletePlant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
    },
  })
}