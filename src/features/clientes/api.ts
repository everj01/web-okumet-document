import { api } from '@/lib/api'
import type { Cliente, ClientePayload, Paginado } from '@/types'

export interface FiltroClientes {
  pagina: number
  buscar: string
}

export const clientesApi = {
  listar: ({ pagina, buscar }: FiltroClientes) =>
    api<Paginado<Cliente>>('/clientes', { params: { page: pagina, buscar } }),

  obtener: (uuid: string) => api<{ data: Cliente }>(`/clientes/${uuid}`).then((r) => r.data),

  crear: (datos: ClientePayload) =>
    api<{ data: Cliente }>('/clientes', { method: 'POST', body: datos }).then((r) => r.data),

  actualizar: (uuid: string, datos: ClientePayload) =>
    api<{ data: Cliente }>(`/clientes/${uuid}`, { method: 'PUT', body: datos }).then((r) => r.data),

  eliminar: (uuid: string) => api<void>(`/clientes/${uuid}`, { method: 'DELETE' }),
}

export const clientesKeys = {
  lista: (filtro: FiltroClientes) => ['clientes', 'lista', filtro] as const,
  detalle: (uuid: string) => ['clientes', 'detalle', uuid] as const,
}
