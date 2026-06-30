import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCareProcesses,
  getPlantCareSchedules,
  getCareLogs,
  createCareProcess,
  updateCareProcess,
  deleteCareProcess,
  logCare,
  deleteCareLog,
  addSchedule,
  updateSchedule,
  removeSchedule,
   getPendingCareAlerts,
} from '../services/care.service'

// ─── CARE PROCESSES ───────────────────────────────────────────────────────────

export const useCareProcesses = () => {
  return useQuery({
    queryKey: ['care-processes'],
    queryFn: getCareProcesses,
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

export const useUpdateCareProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }) => updateCareProcess(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-processes'] })
    },
  })
}

export const useDeleteCareProcess = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteCareProcess,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['care-processes'] })
    },
  })
}

// ─── SCHEDULES ────────────────────────────────────────────────────────────────

export const usePlantCareSchedules = (plantId) => {
  return useQuery({
    queryKey: ['care-schedules', plantId],
    queryFn: () => getPlantCareSchedules(plantId),
    enabled: !!plantId,
  })
}

export const useAddSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addSchedule,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules', variables.plant_id] })
    },
  })
}

export const useUpdateSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, plant_id, ...data }) => updateSchedule(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules', variables.plant_id] })
    },
  })
}

export const useRemoveSchedule = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }) => removeSchedule(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['care-schedules', variables.plant_id] })
    },
  })
}

// ─── CARE LOGS ────────────────────────────────────────────────────────────────

export const useCareLogs = (plantId) => {
  return useQuery({
    queryKey: ['care-logs', plantId],
    queryFn: () => getCareLogs(plantId),
    enabled: !!plantId,
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

export const useDeleteCareLog = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id }) => deleteCareLog(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['care-logs', variables.plant_id] })
    },
  })
}

export const usePendingCareAlerts = () => {
  return useQuery({
    queryKey: ['care-alerts'],
    queryFn: getPendingCareAlerts,
    refetchInterval: 1000 * 60 * 5, // refresca cada 5 minutos
  })
}