import type { EstadoEvento, EstadoExpediente, TipoEvento } from '@/types'
import { AlarmClock, FileSearch, Gavel, Hourglass, NotebookPen, Scale, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Variante = 'default' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'outline'

export const ESTADOS_EXPEDIENTE: Record<EstadoExpediente, { texto: string; variante: Variante }> = {
  abierto: { texto: 'Abierto', variante: 'info' },
  en_tramite: { texto: 'En trámite', variante: 'warning' },
  archivado: { texto: 'Archivado', variante: 'neutral' },
  cerrado: { texto: 'Cerrado', variante: 'success' },
}

export const TIPOS_EVENTO: Record<TipoEvento, { texto: string; variante: Variante; icono: LucideIcon }> = {
  audiencia: { texto: 'Audiencia', variante: 'info', icono: Gavel },
  vencimiento: { texto: 'Vencimiento', variante: 'danger', icono: AlarmClock },
  reunion: { texto: 'Reunión', variante: 'warning', icono: Users },
  otro: { texto: 'Otro', variante: 'neutral', icono: NotebookPen },
  plazo_absolver: { texto: 'Plazo para absolver', variante: 'danger', icono: Hourglass },
  plazo_apelar: { texto: 'Plazo para apelar', variante: 'danger', icono: Hourglass },
  actuacion_prueba: { texto: 'Actuación de prueba', variante: 'info', icono: FileSearch },
  sentencia_1_instancia: { texto: 'Sentencia 1.ª instancia', variante: 'success', icono: Scale },
  sentencia_2_instancia: { texto: 'Sentencia 2.ª instancia', variante: 'success', icono: Scale },
}

export const ESTADOS_EVENTO: Record<EstadoEvento, { texto: string; variante: Variante }> = {
  pendiente: { texto: 'Pendiente', variante: 'warning' },
  realizado: { texto: 'Realizado', variante: 'success' },
  cancelado: { texto: 'Cancelado', variante: 'neutral' },
}

export const TIPOS_PERSONA = [
  { valor: 'natural', texto: 'Persona natural' },
  { valor: 'juridica', texto: 'Persona jurídica' },
] as const

export const TIPOS_DOCUMENTO = ['DNI', 'RUC', 'CE', 'PASAPORTE'] as const

// orden sugerido por la abogada para la línea de tiempo de un proceso típico
export const TITULOS_MOVIMIENTO = [
  'Notificación de demanda',
  'Audiencia',
  'Actuación de medios de prueba',
  'Alegatos',
  'Sentencia (1.ª instancia)',
  'Apelación',
  'Audiencia de vista de la causa',
  'Sentencia (2.ª instancia)',
  'Proceso de ejecución',
  'Casación',
] as const

export const OTRO_TITULO_MOVIMIENTO = 'Otros'

// los movimientos que registra el propio sistema (no una persona) llegan con este valor
export const REGISTRADO_POR_SISTEMA = 'Sistema'

export const opciones = <T extends string>(mapa: Record<T, { texto: string }>) =>
  (Object.keys(mapa) as T[]).map((valor) => ({ valor, texto: mapa[valor].texto }))

// paleta fija para que las etiquetas de documentos se vean consistentes aunque el color lo elija el usuario
export const COLORES_ETIQUETA = [
  { valor: '#FBCFE8', texto: 'Rosa' },
  { valor: '#FDE68A', texto: 'Ámbar' },
  { valor: '#BBF7D0', texto: 'Verde' },
  { valor: '#BFDBFE', texto: 'Azul' },
  { valor: '#DDD6FE', texto: 'Lila' },
  { valor: '#FED7AA', texto: 'Naranja' },
  { valor: '#A5F3FC', texto: 'Celeste' },
  { valor: '#E5E7EB', texto: 'Gris' },
] as const
