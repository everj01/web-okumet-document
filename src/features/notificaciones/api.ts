import { api } from '@/lib/api'
import type { Notificacion, Paginado, ResumenNotificaciones } from '@/types'

export const notificacionesApi = {
  // el popover de la campana no pagina: siempre trae como máximo `porPagina` (tope 30)
  listar: (pagina: number, porPagina = 30) =>
    api<Paginado<Notificacion>>('/notificaciones', { params: { page: pagina, por_pagina: porPagina } }),

  resumen: () => api<ResumenNotificaciones>('/notificaciones/resumen'),

  marcarLeida: (uuid: string) => api<void>(`/notificaciones/${uuid}/leer`, { method: 'PATCH' }),

  marcarTodasLeidas: () => api<void>('/notificaciones/leer-todas', { method: 'POST' }),
}

export const notificacionesKeys = {
  lista: (pagina: number) => ['notificaciones', 'lista', pagina] as const,
  resumen: () => ['notificaciones', 'resumen'] as const,
}
