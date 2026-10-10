import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/features/auth/auth-context'
import { conectarEcho } from '@/lib/echo'
import type { ClaudeUso, Notificacion, ResumenNotificaciones } from '@/types'
import { notificacionesKeys } from './api'

// Canal personal del usuario: notificaciones nuevas y el contador de créditos de IA llegan en vivo, sin polling.
export function useCanalUsuario() {
  const { usuario } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!usuario) return

    const echo = conectarEcho()

    if (!echo) return

    const canal = `usuario.${usuario.id}`

    echo
      .private(canal)
      .listen('.notificacion.creada', (notificacion: Notificacion) => {
        queryClient.setQueryData(notificacionesKeys.resumen(), (actual?: ResumenNotificaciones) => ({
          no_leidas: (actual?.no_leidas ?? 0) + 1,
        }))
        queryClient.invalidateQueries({ queryKey: ['notificaciones', 'lista'] })
        toast.info(notificacion.titulo, { description: notificacion.mensaje })
      })
      .listen('.claude-uso.actualizado', (uso: ClaudeUso) => {
        queryClient.setQueryData(['claude-uso'], uso)
      })

    return () => {
      echo.leave(canal)
    }
  }, [usuario, queryClient])
}
