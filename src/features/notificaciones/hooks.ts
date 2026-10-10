import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Paginado, ResumenNotificaciones } from '@/types'
import { notificacionesApi, notificacionesKeys } from './api'

export function useNotificaciones(pagina: number) {
  return useQuery({
    queryKey: notificacionesKeys.lista(pagina),
    queryFn: () => notificacionesApi.listar(pagina),
  })
}

// se actualiza en tiempo real por el canal del usuario; esto es solo la carga inicial
export function useResumenNotificaciones() {
  return useQuery({
    queryKey: notificacionesKeys.resumen(),
    queryFn: notificacionesApi.resumen,
    staleTime: 60_000,
  })
}

export function useMarcarLeida() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => notificacionesApi.marcarLeida(uuid),
    onSuccess: (_datos, uuid) => {
      queryClient.setQueryData(notificacionesKeys.resumen(), (actual?: ResumenNotificaciones) =>
        actual ? { no_leidas: Math.max(0, actual.no_leidas - 1) } : actual,
      )
      queryClient.setQueriesData(
        { queryKey: ['notificaciones', 'lista'] },
        (actual?: Paginado<{ uuid: string; leida: boolean }>) =>
          actual
            ? { ...actual, data: actual.data.map((n) => (n.uuid === uuid ? { ...n, leida: true } : n)) }
            : actual,
      )
    },
  })
}

export function useMarcarTodasLeidas() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: notificacionesApi.marcarTodasLeidas,
    onSuccess: () => {
      queryClient.setQueryData(notificacionesKeys.resumen(), { no_leidas: 0 })
      queryClient.invalidateQueries({ queryKey: ['notificaciones', 'lista'] })
    },
  })
}
