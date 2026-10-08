import { api } from '@/lib/api'
import type { Usuario } from '@/types'

export const verificacionApi = {
  reenviar: () => api<void>('/verificacion/reenviar', { method: 'POST' }),

  confirmar: (codigo: string) =>
    api<{ data: Usuario }>('/verificacion/confirmar', { method: 'POST', body: { codigo } }).then((r) => r.data),
}
