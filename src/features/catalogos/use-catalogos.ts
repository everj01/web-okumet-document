import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Catalogos } from '@/types'

// Se piden una sola vez y se comparten entre todas las pantallas (staleTime largo).
export function useCatalogos() {
  return useQuery({
    queryKey: ['catalogos'],
    queryFn: () => api<Catalogos>('/catalogos'),
    staleTime: 10 * 60_000,
  })
}
