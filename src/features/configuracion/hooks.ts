import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import type { Configuracion } from '@/types'
import { configuracionApi, configuracionKeys } from './api'

export function useConfiguracion() {
  return useQuery({
    queryKey: configuracionKeys.detalle(),
    queryFn: configuracionApi.obtener,
  })
}

export function useGuardarConfiguracion() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: Configuracion) => configuracionApi.actualizar(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configuracionKeys.detalle() })
      toast.success('Configuración actualizada')
    },
    onError: (error) => toast.error('No se pudo guardar', { description: mensajeDeError(error) }),
  })
}
