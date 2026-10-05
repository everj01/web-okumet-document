import { api, apiBlob } from '@/lib/api'
import type { Consulta, Documento, Extraccion, Paginado } from '@/types'

export interface FiltroDocumentos {
  pagina: number
  buscar: string
  expedienteId?: number | null
}

export const documentosApi = {
  listar: ({ pagina, buscar, expedienteId }: FiltroDocumentos) =>
    api<Paginado<Documento>>('/documentos', {
      params: { page: pagina, buscar, expediente_id: expedienteId },
    }),

  obtener: (uuid: string) => api<{ data: Documento }>(`/documentos/${uuid}`).then((r) => r.data),

  subir: (expedienteUuid: string, archivo: File, nombre: string) => {
    const cuerpo = new FormData()
    cuerpo.append('archivo', archivo)
    cuerpo.append('nombre', nombre)

    return api<{ data: Documento }>(`/expedientes/${expedienteUuid}/documentos`, {
      method: 'POST',
      body: cuerpo,
    }).then((r) => r.data)
  },

  eliminar: (uuid: string) => api<void>(`/documentos/${uuid}`, { method: 'DELETE' }),

  archivo: (uuid: string) => apiBlob(`/documentos/${uuid}/archivo`),

  resumen: (uuid: string) =>
    api<{ resumen: string }>(`/documentos/${uuid}/resumen`, { method: 'POST' }).then((r) => r.resumen),

  preguntar: (uuid: string, pregunta: string) =>
    api<{ data: Consulta }>(`/documentos/${uuid}/preguntas`, { method: 'POST', body: { pregunta } }).then(
      (r) => r.data,
    ),

  // El backend guarda la extracción; `refrescar` fuerza volver a analizar y vuelve a costar.
  extraccion: (uuid: string, refrescar = false) =>
    api<{ data: Extraccion }>(`/documentos/${uuid}/extraccion`, {
      method: 'POST',
      params: refrescar ? { refrescar: 1 } : undefined,
    }).then((r) => r.data),
}

export const documentosKeys = {
  lista: (filtro: FiltroDocumentos) => ['documentos', 'lista', filtro] as const,
  detalle: (uuid: string) => ['documentos', 'detalle', uuid] as const,
  archivo: (uuid: string) => ['documentos', 'archivo', uuid] as const,
  extraccion: (uuid: string) => ['documentos', 'extraccion', uuid] as const,
}
