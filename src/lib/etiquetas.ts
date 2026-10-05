import type { EstadoEvento, EstadoExpediente, TipoEvento } from '@/types'
import { AlarmClock, Gavel, NotebookPen, Users } from 'lucide-react'
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

export const opciones = <T extends string>(mapa: Record<T, { texto: string }>) =>
  (Object.keys(mapa) as T[]).map((valor) => ({ valor, texto: mapa[valor].texto }))
