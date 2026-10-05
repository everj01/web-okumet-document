import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { conectarEcho } from '@/lib/echo'

export function useCanalExpediente(expedienteId: number | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!expedienteId) return

    const echo = conectarEcho()

    if (!echo) return

    const canal = `expediente.${expedienteId}`
    // se invalida por prefijo porque el canal solo da el id, no el uuid de la query en caché
    const refrescarExpediente = () => queryClient.invalidateQueries({ queryKey: ['expedientes', 'detalle'] })
    const refrescarListas = () => {
      queryClient.invalidateQueries({ queryKey: ['expedientes', 'lista'] })
      queryClient.invalidateQueries({ queryKey: ['panel'] })
    }

    echo
      .private(canal)
      .listen('.expediente.actualizado', () => {
        refrescarExpediente()
        refrescarListas()
      })
      .listen('.documento.actualizado', () => {
        refrescarExpediente()
        queryClient.invalidateQueries({ queryKey: ['documentos'] })
      })
      .listen('.evento.actualizado', () => {
        refrescarExpediente()
        queryClient.invalidateQueries({ queryKey: ['eventos'] })
        queryClient.invalidateQueries({ queryKey: ['panel'] })
      })

    return () => {
      echo.leave(canal)
    }
  }, [expedienteId, queryClient])
}
