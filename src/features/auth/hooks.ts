import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ApiError, mensajeDeError } from '@/lib/api'
import { recuperacionApi, registroApi, verificacionApi, type RestablecerPasswordPayload } from './api'
import { useAuth } from './auth-context'

export function useBuscarRuc() {
  return useMutation({
    mutationFn: (numero: string) => registroApi.buscarRuc(numero),
    onError: (error) => {
      const noEncontrado = error instanceof ApiError && error.status === 404
      toast.error(noEncontrado ? 'No se encontró ese RUC' : 'No se pudo buscar', {
        description: noEncontrado ? 'Revisa el número o complétalo a mano.' : mensajeDeError(error),
      })
    },
  })
}

export function useReenviarCodigo() {
  return useMutation({
    mutationFn: verificacionApi.reenviar,
    onSuccess: () => toast.success('Código reenviado', { description: 'Revisa tu correo.' }),
    onError: (error) => toast.error('No se pudo reenviar', { description: mensajeDeError(error) }),
  })
}

export function useSolicitarRecuperacion() {
  return useMutation({
    mutationFn: (email: string) => recuperacionApi.solicitar(email),
    onError: (error) => toast.error('No se pudo enviar la solicitud', { description: mensajeDeError(error) }),
  })
}

export function useRestablecerPassword() {
  return useMutation({
    mutationFn: (datos: RestablecerPasswordPayload) => recuperacionApi.restablecer(datos),
    onError: (error) => toast.error('No se pudo restablecer', { description: mensajeDeError(error) }),
  })
}

export function useConfirmarCodigo() {
  const { actualizarUsuario } = useAuth()

  return useMutation({
    mutationFn: (codigo: string) => verificacionApi.confirmar(codigo),
    onSuccess: (usuario) => {
      actualizarUsuario(usuario)
      toast.success('Correo verificado')
    },
    onError: (error) => toast.error('Código incorrecto', { description: mensajeDeError(error) }),
  })
}
