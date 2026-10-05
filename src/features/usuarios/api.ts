import { api } from '@/lib/api'
import type { Paginado, Usuario, UsuarioPayload } from '@/types'

export interface FiltroUsuarios {
  pagina: number
  buscar: string
}

export const usuariosApi = {
  listar: ({ pagina, buscar }: FiltroUsuarios) =>
    api<Paginado<Usuario>>('/usuarios', { params: { page: pagina, buscar } }),

  crear: (datos: UsuarioPayload) =>
    api<{ data: Usuario }>('/usuarios', { method: 'POST', body: datos }).then((r) => r.data),

  actualizar: (uuid: string, datos: UsuarioPayload) =>
    api<{ data: Usuario }>(`/usuarios/${uuid}`, { method: 'PUT', body: datos }).then((r) => r.data),

  eliminar: (uuid: string) => api<void>(`/usuarios/${uuid}`, { method: 'DELETE' }),
}

export const usuariosKeys = {
  lista: (filtro: FiltroUsuarios) => ['usuarios', 'lista', filtro] as const,
}
