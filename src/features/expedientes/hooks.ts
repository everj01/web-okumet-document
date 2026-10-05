import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import type { ExpedientePayload, MovimientoPayload } from '@/types'
import { expedientesApi, expedientesKeys, type FiltroExpedientes } from './api'

export function useExpedientes(filtro: FiltroExpedientes) {
  return useQuery({
    queryKey: expedientesKeys.lista(filtro),
    queryFn: () => expedientesApi.listar(filtro),
    placeholderData: keepPreviousData,
  })
}

export function useExpediente(uuid: string | undefined) {
  return useQuery({
    queryKey: expedientesKeys.detalle(uuid ?? ''),
    queryFn: () => expedientesApi.obtener(uuid!),
    enabled: Boolean(uuid),
  })
}

export function useGuardarExpediente(uuid?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: ExpedientePayload) =>
      uuid ? expedientesApi.actualizar(uuid, datos) : expedientesApi.crear(datos),
    onSuccess: (expediente) => {
      queryClient.invalidateQueries({ queryKey: ['expedientes'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos'] })
      queryClient.invalidateQueries({ queryKey: ['panel'] })
      toast.success(uuid ? 'Expediente actualizado' : 'Expediente creado', { description: expediente.codigo })
    },
    onError: (error) => toast.error('No se pudo guardar', { description: mensajeDeError(error) }),
  })
}

export function useEliminarExpediente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => expedientesApi.eliminar(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes'] })
      queryClient.invalidateQueries({ queryKey: ['panel'] })
      toast.success('Expediente eliminado')
    },
    onError: (error) => toast.error('No se pudo eliminar', { description: mensajeDeError(error) }),
  })
}

export function useMovimientos(expedienteUuid: string | undefined) {
  const queryClient = useQueryClient()
  const refrescar = () => queryClient.invalidateQueries({ queryKey: expedientesKeys.detalle(expedienteUuid ?? '') })

  const crear = useMutation({
    mutationFn: (datos: MovimientoPayload) => expedientesApi.crearMovimiento(expedienteUuid!, datos),
    onSuccess: (movimiento) => {
      refrescar()
      toast.success('Movimiento registrado', { description: movimiento.titulo })
    },
    onError: (error) => toast.error('No se pudo guardar', { description: mensajeDeError(error) }),
  })

  const eliminar = useMutation({
    mutationFn: (uuid: string) => expedientesApi.eliminarMovimiento(uuid),
    onSuccess: () => {
      refrescar()
      toast.success('Movimiento eliminado')
    },
    onError: (error) => toast.error('No se pudo eliminar', { description: mensajeDeError(error) }),
  })

  return { crear, eliminar }
}
