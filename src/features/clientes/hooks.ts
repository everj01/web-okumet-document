import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import type { ClientePayload } from '@/types'
import { clientesApi, clientesKeys, type FiltroClientes } from './api'

export function useClientes(filtro: FiltroClientes) {
  return useQuery({
    queryKey: clientesKeys.lista(filtro),
    queryFn: () => clientesApi.listar(filtro),
    placeholderData: keepPreviousData,
  })
}

export function useCliente(uuid: string | undefined) {
  return useQuery({
    queryKey: clientesKeys.detalle(uuid ?? ''),
    queryFn: () => clientesApi.obtener(uuid!),
    enabled: Boolean(uuid),
  })
}

export function useGuardarCliente(uuid?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: ClientePayload) => (uuid ? clientesApi.actualizar(uuid, datos) : clientesApi.crear(datos)),
    onSuccess: (cliente) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos'] })
      toast.success(uuid ? 'Cliente actualizado' : 'Cliente registrado', { description: cliente.nombre })
    },
    onError: (error) => toast.error('No se pudo guardar', { description: mensajeDeError(error) }),
  })
}

export function useEliminarCliente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => clientesApi.eliminar(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos'] })
      toast.success('Cliente eliminado')
    },
    onError: (error) => toast.error('No se pudo eliminar', { description: mensajeDeError(error) }),
  })
}
