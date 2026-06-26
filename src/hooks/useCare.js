import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCareProcesses,
  getPlantCareSchedules,
  getCareLogs,
  createCareProcess,
  updateCareProcess,
  logCare,
} from '../services/care.service'

export const useCareProcesses = () => {
  return useQuery({
    queryKey: ['care-processes'],
    queryFn: getCareProcesses,
  })
}

export const usePlantCareSchedules = (plantId) => {
  return useQuery({
    queryKey: ['care-schedules', plantId],
    queryFn: () => getPlantCareSchedules(plantId),
    enabled: !!plantId,
  })
}

export const useCareLogs = (plantId) => {
  return useQuery({
    queryKey: ['care-logs', plantId],
    queryFn: () => getCareLogs(plantId),
    enabled: !!plantId,
  })
}

export const useCreateCareProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCareProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-processes'] })
    },
  })
}

export const useLogCare = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logCare,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['care-logs', variables.plant_id] })
      queryClient.invalidateQueries({ queryKey: ['care-schedules', variables.plant_id] })
    },
  })
}

export const useUpdateCareProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateCareProcess(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-processes'] })
    },
  })
}