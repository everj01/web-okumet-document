import { api, apiBlob } from '@/lib/api'
import type { Exportacion, ExportacionPayload } from '@/types'

export const exportacionesApi = {
  crear: (datos: ExportacionPayload) =>
    api<{ data: Exportacion }>('/exportaciones', { method: 'POST', body: datos }).then((r) => r.data),

  obtener: (uuid: string) => api<{ data: Exportacion }>(`/exportaciones/${uuid}`).then((r) => r.data),

  descargar: (uuid: string) => apiBlob(`/exportaciones/${uuid}/descargar`),
}

export const exportacionesKeys = {
  detalle: (uuid: string) => ['exportaciones', 'detalle', uuid] as const,
}
