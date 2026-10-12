import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/auth-context'
import { mensajeDeError } from '@/lib/api'
import { perfilApi, type DatosPerfilPayload } from './api'

export function useSubirFotoPerfil() {
  const { usuario, actualizarUsuario } = useAuth()

  return useMutation({
    mutationFn: (archivo: File) => perfilApi.subirFoto(archivo),
    onSuccess: ({ foto_url }) => {
      if (usuario) actualizarUsuario({ ...usuario, foto_url })
      toast.success('Foto actualizada')
    },
    onError: (error) => toast.error('No se pudo subir la foto', { description: mensajeDeError(error) }),
  })
}

export function useActualizarDatosPerfil() {
  const { usuario, actualizarUsuario } = useAuth()

  return useMutation({
    mutationFn: (datos: DatosPerfilPayload) => perfilApi.actualizarDatos(datos),
    onSuccess: (usuarioActualizado) => {
      if (usuario) actualizarUsuario(usuarioActualizado)
      toast.success('Datos actualizados')
    },
    onError: (error) => toast.error('No se pudo actualizar', { description: mensajeDeError(error) }),
  })
}

export function useQuitarFotoPerfil() {
  const { usuario, actualizarUsuario } = useAuth()

  return useMutation({
    mutationFn: perfilApi.quitarFoto,
    onSuccess: () => {
      if (usuario) actualizarUsuario({ ...usuario, foto_url: null })
      toast.success('Foto eliminada')
    },
    onError: (error) => toast.error('No se pudo quitar la foto', { description: mensajeDeError(error) }),
  })
}
