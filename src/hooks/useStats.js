// src/hooks/useStats.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlantViewsByMonth,
  getPlantSalesSummary,
  getRevenueByMonth,
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/stats.service'

export const usePlantViews    = () => useQuery({ queryKey: ['plant-views'],    queryFn: getPlantViewsByMonth })
export const usePlantSales    = () => useQuery({ queryKey: ['plant-sales'],    queryFn: getPlantSalesSummary })
export const useRevenueByMonth = () => useQuery({ queryKey: ['revenue-month'], queryFn: getRevenueByMonth })
export const useExpenses      = () => useQuery({ queryKey: ['expenses'],       queryFn: getExpenses })

export const useCreateExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export const useUpdateExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }) => updateExpense(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}

export const useDeleteExpense = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  })
}
