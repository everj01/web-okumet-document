import { api } from '@/lib/api'
import type { AlmacenamientoUso } from '@/types'

export const almacenamientoApi = {
  obtener: () => api<AlmacenamientoUso>('/almacenamiento-usage'),
}
