import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import type { ExportacionPayload } from '@/types'
import { exportacionesApi, exportacionesKeys } from './api'

export function useCrearExportacion() {
  return useMutation({
    mutationFn: (datos: ExportacionPayload) => exportacionesApi.crear(datos),
    onError: (error) => toast.error('No se pudo iniciar la exportación', { description: mensajeDeError(error) }),
  })
}

// Mientras está pendiente/procesando se consulta cada 3s; al terminar (o fallar) se detiene sola.
export function useExportacion(uuid: string | undefined) {
  return useQuery({
    queryKey: exportacionesKeys.detalle(uuid ?? ''),
    queryFn: () => exportacionesApi.obtener(uuid!),
    enabled: Boolean(uuid),
    refetchInterval: (query) => {
      const estado = query.state.data?.estado
      return estado === 'completado' || estado === 'fallido' ? false : 3000
    },
    // el backup puede tardar minutos: sigue consultando aunque el usuario cambie de pestaña
    refetchIntervalInBackground: true,
  })
}

export function useDescargarExportacion() {
  return useMutation({
    mutationFn: async (uuid: string) => {
      const blob = await exportacionesApi.descargar(uuid)
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `backup-${uuid}.zip`
      enlace.click()
      URL.revokeObjectURL(url)
    },
    onError: (error) => toast.error('No se pudo descargar el backup', { description: mensajeDeError(error) }),
  })
}
