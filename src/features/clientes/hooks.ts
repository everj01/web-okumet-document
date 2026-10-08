import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError, mensajeDeError } from '@/lib/api'
import type { ClientePayload, DniResultado, RucResultado } from '@/types'
import { clientesApi, clientesKeys, integracionesApi, type FiltroClientes } from './api'

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

export function useBuscarDniRuc() {
  return useMutation({
    mutationFn: ({ tipo, numero }: { tipo: 'DNI' | 'RUC'; numero: string }): Promise<DniResultado | RucResultado> =>
      tipo === 'DNI' ? integracionesApi.dni(numero) : integracionesApi.ruc(numero),
    onError: (error) => {
      const noEncontrado = error instanceof ApiError && error.status === 404
      toast.error(noEncontrado ? 'No se encontró ese documento' : 'No se pudo buscar', {
        description: noEncontrado ? 'Revisa el número o complétalo a mano.' : mensajeDeError(error),
      })
    },
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
