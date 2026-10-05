import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import type { UsuarioPayload } from '@/types'
import { usuariosApi, usuariosKeys, type FiltroUsuarios } from './api'

export function useUsuarios(filtro: FiltroUsuarios) {
  return useQuery({
    queryKey: usuariosKeys.lista(filtro),
    queryFn: () => usuariosApi.listar(filtro),
    placeholderData: keepPreviousData,
  })
}

export function useGuardarUsuario(uuid?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: UsuarioPayload) => (uuid ? usuariosApi.actualizar(uuid, datos) : usuariosApi.crear(datos)),
    onSuccess: (usuario) => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos'] })
      toast.success(uuid ? 'Usuario actualizado' : 'Usuario creado', { description: usuario.name })
    },
    onError: (error) => toast.error('No se pudo guardar', { description: mensajeDeError(error) }),
  })
}

export function useEliminarUsuario() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => usuariosApi.eliminar(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
      queryClient.invalidateQueries({ queryKey: ['catalogos'] })
      toast.success('Usuario eliminado')
    },
    onError: (error) => toast.error('No se pudo eliminar', { description: mensajeDeError(error) }),
  })
}
