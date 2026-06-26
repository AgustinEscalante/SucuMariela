import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getOrders,
  createOrder,
  updateOrderStatus,
} from '../services/orders.service'

export const useOrders = (options = {}) => {
  return useQuery({
    queryKey: ['orders', options],
    queryFn: () => getOrders(options),
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ orderData, items }) => createOrder(orderData, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['plants'] })
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['plants'] })
    },
  })
}