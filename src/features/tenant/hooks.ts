import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import type { TenantPayload } from '@/types'
import { tenantApi, tenantKeys } from './api'

export function useTenant() {
  return useQuery({
    queryKey: tenantKeys.detalle(),
    queryFn: tenantApi.obtener,
  })
}

export function useGuardarTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: TenantPayload) => tenantApi.actualizar(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detalle() })
      toast.success('Datos del negocio actualizados')
    },
    onError: (error) => toast.error('No se pudo guardar', { description: mensajeDeError(error) }),
  })
}

export function useSubirLogoTenant() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (archivo: File) => tenantApi.subirLogo(archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantKeys.detalle() })
      toast.success('Logo actualizado')
    },
    onError: (error) => toast.error('No se pudo subir el logo', { description: mensajeDeError(error) }),
  })
}
