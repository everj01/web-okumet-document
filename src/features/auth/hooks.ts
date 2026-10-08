import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import { verificacionApi } from './api'
import { useAuth } from './auth-context'

export function useReenviarCodigo() {
  return useMutation({
    mutationFn: verificacionApi.reenviar,
    onSuccess: () => toast.success('Código reenviado', { description: 'Revisa tu correo.' }),
    onError: (error) => toast.error('No se pudo reenviar', { description: mensajeDeError(error) }),
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
