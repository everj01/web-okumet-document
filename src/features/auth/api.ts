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

export interface RestablecerPasswordPayload {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export const recuperacionApi = {
  // el backend responde igual exista o no la cuenta, así que esto nunca revela si un correo está registrado
  solicitar: (email: string) => api<{ message: string }>('/password/olvide', { method: 'POST', body: { email } }),

  restablecer: (datos: RestablecerPasswordPayload) =>
    api<{ message: string }>('/password/restablecer', { method: 'POST', body: datos }),
}
