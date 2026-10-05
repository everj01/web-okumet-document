import { api } from '@/lib/api'
import type {
  Expediente,
  ExpedientePayload,
  Movimiento,
  MovimientoPayload,
  Paginado,
} from '@/types'

export interface FiltroExpedientes {
  pagina: number
  buscar: string
  estado: string | null
  clienteId?: number | null
}

export const expedientesApi = {
  listar: ({ pagina, buscar, estado, clienteId }: FiltroExpedientes) =>
    api<Paginado<Expediente>>('/expedientes', {
      params: { page: pagina, buscar, estado, cliente_id: clienteId },
    }),

  obtener: (uuid: string) => api<{ data: Expediente }>(`/expedientes/${uuid}`).then((r) => r.data),

  crear: (datos: ExpedientePayload) =>
    api<{ data: Expediente }>('/expedientes', { method: 'POST', body: datos }).then((r) => r.data),

  actualizar: (uuid: string, datos: ExpedientePayload) =>
    api<{ data: Expediente }>(`/expedientes/${uuid}`, { method: 'PUT', body: datos }).then((r) => r.data),

  eliminar: (uuid: string) => api<void>(`/expedientes/${uuid}`, { method: 'DELETE' }),

  crearMovimiento: (expedienteUuid: string, datos: MovimientoPayload) =>
    api<{ data: Movimiento }>(`/expedientes/${expedienteUuid}/movimientos`, { method: 'POST', body: datos }).then(
      (r) => r.data,
    ),

  eliminarMovimiento: (uuid: string) => api<void>(`/movimientos/${uuid}`, { method: 'DELETE' }),
}

export const expedientesKeys = {
  lista: (filtro: FiltroExpedientes) => ['expedientes', 'lista', filtro] as const,
  detalle: (uuid: string) => ['expedientes', 'detalle', uuid] as const,
}
