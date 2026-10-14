import { api, apiBlob } from '@/lib/api'
import type { Consulta, Documento, Etiqueta, EtiquetaPayload, Extraccion, ExtraccionPrevia, Paginado } from '@/types'

export interface FiltroDocumentos {
  pagina: number
  buscar: string
  expedienteId?: number | null
  etiquetaId?: number | null
  soloHuerfanos?: boolean
}

export const documentosApi = {
  listar: ({ pagina, buscar, expedienteId, etiquetaId, soloHuerfanos }: FiltroDocumentos) =>
    api<Paginado<Documento>>('/documentos', {
      params: {
        page: pagina,
        buscar,
        expediente_id: expedienteId,
        etiqueta_id: etiquetaId,
        solo_huerfanos: soloHuerfanos ? 1 : undefined,
      },
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

  // Sube uno o varios PDFs sin ligarlos a ningún expediente todavía; no corre IA.
  subirSinExpediente: (archivos: File[]) => {
    const cuerpo = new FormData()
    archivos.forEach((archivo) => cuerpo.append('archivos[]', archivo))

    return api<{ data: Documento[] }>('/documentos', { method: 'POST', body: cuerpo }).then((r) => r.data)
  },

  // Convierte un documento huérfano en documento del expediente indicado (ya creado con /expedientes).
  asignarExpediente: (uuid: string, expedienteId: number) =>
    api<{ data: Documento }>(`/documentos/${uuid}/asignar-expediente`, {
      method: 'POST',
      body: { expediente_id: expedienteId },
    }).then((r) => r.data),

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

  sincronizarEtiquetas: (uuid: string, etiquetaIds: number[]) =>
    api<{ data: Documento }>(`/documentos/${uuid}/etiquetas`, {
      method: 'PUT',
      body: { etiqueta_ids: etiquetaIds },
    }).then((r) => r.data),

  // Analiza un PDF que todavía no se subió a ningún expediente; no persiste nada.
  extraerPrevia: (archivo: File) => {
    const cuerpo = new FormData()
    cuerpo.append('archivo', archivo)

    return api<{ data: ExtraccionPrevia }>('/documentos/extraer-previa', { method: 'POST', body: cuerpo }).then(
      (r) => r.data,
    )
  },
}

export const documentosKeys = {
  lista: (filtro: FiltroDocumentos) => ['documentos', 'lista', filtro] as const,
  detalle: (uuid: string) => ['documentos', 'detalle', uuid] as const,
  archivo: (uuid: string) => ['documentos', 'archivo', uuid] as const,
  extraccion: (uuid: string) => ['documentos', 'extraccion', uuid] as const,
}

export const etiquetasApi = {
  listar: () => api<{ data: Etiqueta[] }>('/etiquetas').then((r) => r.data),

  crear: (datos: EtiquetaPayload) =>
    api<{ data: Etiqueta }>('/etiquetas', { method: 'POST', body: datos }).then((r) => r.data),

  actualizar: (uuid: string, datos: EtiquetaPayload) =>
    api<{ data: Etiqueta }>(`/etiquetas/${uuid}`, { method: 'PUT', body: datos }).then((r) => r.data),

  eliminar: (uuid: string) => api<void>(`/etiquetas/${uuid}`, { method: 'DELETE' }),
}
