import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/auth-context'
import { conectarEcho } from '@/lib/echo'

// el canal ya aplica la misma visibilidad que la API REST (admin/asistente ven todos, un abogado solo los suyos)
export function useCanalListaExpedientes() {
  const { usuario, rol } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!usuario) return

    const echo = conectarEcho()

    if (!echo) return

    const canal = rol === 'admin' || rol === 'asistente' ? 'expedientes.todos' : `expedientes.abogado.${usuario.id}`

    const refrescar = () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes', 'lista'] })
      queryClient.invalidateQueries({ queryKey: ['panel'] })
    }

    echo.private(canal).listen('.expediente.actualizado', refrescar)

    return () => {
      echo.leave(canal)
    }
  }, [usuario, rol, queryClient])
}
