import { api } from '@/lib/api'
import type { Evento, EventoPayload, Paginado } from '@/types'

export interface FiltroEventos {
  desde: string
  hasta: string
  estado: string | null
  tipo: string | null
}

export const eventosApi = {
  listar: (filtro: FiltroEventos) =>
    api<Paginado<Evento>>('/eventos', { params: { ...filtro } }).then((r) => r.data),

  crear: (datos: EventoPayload) =>
    api<{ data: Evento }>('/eventos', { method: 'POST', body: datos }).then((r) => r.data),

  actualizar: (uuid: string, datos: EventoPayload) =>
    api<{ data: Evento }>(`/eventos/${uuid}`, { method: 'PUT', body: datos }).then((r) => r.data),

  eliminar: (uuid: string) => api<void>(`/eventos/${uuid}`, { method: 'DELETE' }),
}

export const eventosKeys = {
  lista: (filtro: FiltroEventos) => ['eventos', 'lista', filtro] as const,
}
