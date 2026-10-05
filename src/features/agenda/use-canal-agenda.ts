import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { conectarEcho } from '@/lib/echo'

interface PayloadEvento {
  accion: 'creado' | 'actualizado' | 'eliminado'
}

// Eventos de agenda sueltos (sin expediente) de cualquier abogado del estudio.
export function useCanalAgenda() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // conectarEcho() es idempotente, por si auth-context aún no abrió la conexión
    const echo = conectarEcho()

    if (!echo) return

    const refrescar = (_payload: PayloadEvento) => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] })
      queryClient.invalidateQueries({ queryKey: ['panel'] })
    }

    echo.private('agenda').listen('.evento.actualizado', refrescar)

    return () => {
      echo.leave('agenda')
    }
  }, [queryClient])
}
