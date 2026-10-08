import { api } from '@/lib/api'
import type { RucResultado, Usuario } from '@/types'

export const verificacionApi = {
  reenviar: () => api<void>('/verificacion/reenviar', { method: 'POST' }),

  confirmar: (codigo: string) =>
    api<{ data: Usuario }>('/verificacion/confirmar', { method: 'POST', body: { codigo } }).then((r) => r.data),
}

export const registroApi = {
  buscarRuc: (numero: string) => api<{ data: RucResultado }>(`/registro/ruc/${numero}`).then((r) => r.data),
}
