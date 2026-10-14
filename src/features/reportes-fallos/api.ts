import { api } from '@/lib/api'

export type MotivoReporteFallo =
  | 'error_sistema'
  | 'carga_guardado'
  | 'documentos_archivos'
  | 'ia_datos'
  | 'acceso_permisos'
  | 'informacion_incorrecta'
  | 'sugerencia'
  | 'otro'

export const MOTIVOS_REPORTE_FALLO: { valor: MotivoReporteFallo; texto: string }[] = [
  { valor: 'error_sistema', texto: 'Error o falla del sistema' },
  { valor: 'carga_guardado', texto: 'Problema al cargar o guardar información' },
  { valor: 'documentos_archivos', texto: 'Problema con documentos o archivos' },
  { valor: 'ia_datos', texto: 'Problema con IA / datos extraídos' },
  { valor: 'acceso_permisos', texto: 'Problema de acceso o permisos' },
  { valor: 'informacion_incorrecta', texto: 'La información se muestra incorrectamente' },
  { valor: 'sugerencia', texto: 'Sugerencia o mejora' },
  { valor: 'otro', texto: 'Otro' },
]

export interface ReporteFalloPayload {
  motivo: MotivoReporteFallo
  comentario: string
  ruta: string
  captura: Blob | null
}

export type EstadoReporteFallo = 'pendiente' | 'resuelto'

export interface ReporteFallo {
  id: number
  uuid: string
  motivo: MotivoReporteFallo
  comentario: string | null
  ruta: string | null
  estado: EstadoReporteFallo
  respuesta: string | null
  resuelto_en: string | null
  captura_url: string | null
  usuario: { id: number; name: string; email: string } | null
  tenant: { id: number; nombre_comercial: string } | null
  creado_en: string
}

export const reportesFallosApi = {
  enviar: (datos: ReporteFalloPayload) => {
    const cuerpo = new FormData()
    cuerpo.append('motivo', datos.motivo)
    cuerpo.append('comentario', datos.comentario)
    cuerpo.append('ruta', datos.ruta)
    if (datos.captura) cuerpo.append('captura', datos.captura, 'captura.png')

    return api<{ data: ReporteFallo }>('/reportes-fallos', { method: 'POST', body: cuerpo }).then((r) => r.data)
  },
}
