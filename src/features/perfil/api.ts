import { api } from '@/lib/api'
import type { Usuario } from '@/types'

export interface DatosPerfilPayload {
  dni: string | null
  colegiatura: string | null
}

export const perfilApi = {
  subirFoto: (archivo: File) => {
    const cuerpo = new FormData()
    cuerpo.append('foto', archivo)

    return api<{ foto_url: string }>('/perfil/foto', { method: 'POST', body: cuerpo })
  },

  quitarFoto: () => api<void>('/perfil/foto', { method: 'DELETE' }),

  actualizarDatos: (datos: DatosPerfilPayload) =>
    api<{ usuario: Usuario }>('/perfil', { method: 'PUT', body: datos }).then((r) => r.usuario),
}
