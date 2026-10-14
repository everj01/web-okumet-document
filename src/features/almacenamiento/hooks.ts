import { useQuery } from '@tanstack/react-query'
import { almacenamientoApi } from './api'

export function useAlmacenamientoUso() {
  return useQuery({
    queryKey: ['almacenamiento-uso'],
    queryFn: almacenamientoApi.obtener,
    staleTime: 60_000,
  })
}
