import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Las vistas se revisitan mucho: con esto no se repite la misma petición al volver
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (intentos, error) => !(error instanceof ApiError && error.status < 500) && intentos < 2,
    },
  },
})
