import { api } from '@/lib/api'
import type { Configuracion } from '@/types'

export const configuracionApi = {
  obtener: () => api<{ data: Configuracion }>('/configuracion').then((r) => r.data),

  actualizar: (datos: Configuracion) =>
    api<{ data: Configuracion }>('/configuracion', { method: 'PUT', body: datos }).then((r) => r.data),
}

export const configuracionKeys = {
  detalle: () => ['configuracion'] as const,
}
