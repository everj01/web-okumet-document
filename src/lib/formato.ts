import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

function aFecha(valor: string | Date | null | undefined) {
  if (!valor) return null

  const fecha = valor instanceof Date ? valor : parseISO(valor.replace(' ', 'T'))

  return isValid(fecha) ? fecha : null
}

export function fechaCorta(valor?: string | Date | null) {
  const fecha = aFecha(valor)

  return fecha ? format(fecha, 'dd/MM/yyyy', { locale: es }) : '—'
}

export function fechaHora(valor?: string | Date | null) {
  const fecha = aFecha(valor)

  return fecha ? format(fecha, "dd/MM/yyyy HH:mm", { locale: es }) : '—'
}

export function hora(valor?: string | Date | null) {
  const fecha = aFecha(valor)

  return fecha ? format(fecha, 'HH:mm', { locale: es }) : '—'
}

export function fechaLarga(valor?: string | Date | null) {
  const fecha = aFecha(valor)

  return fecha ? format(fecha, "EEEE d 'de' MMMM", { locale: es }) : '—'
}

export function desdeAhora(valor?: string | Date | null) {
  const fecha = aFecha(valor)

  if (!fecha) return '—'

  const dias = Math.ceil((fecha.getTime() - Date.now()) / 86400000)

  if (dias < 0) return 'Vencido'
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'

  return `En ${formatDistanceToNowStrict(fecha, { locale: es, unit: 'day' })}`
}

export function pesoLegible(bytes: number) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`

  const kb = bytes / 1024

  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`
}

export function mbLegible(mb: number) {
  return mb < 1024 ? `${mb.toFixed(mb < 10 ? 2 : 1)} MB` : `${(mb / 1024).toFixed(2)} GB`
}

// el backend espera Y-m-d / Y-m-d H:i:s en hora local
export function aFechaApi(valor: Date | string) {
  const fecha = valor instanceof Date ? valor : new Date(valor)

  return format(fecha, 'yyyy-MM-dd')
}

export function aFechaHoraApi(valor: Date | string) {
  const fecha = valor instanceof Date ? valor : new Date(valor)

  return format(fecha, "yyyy-MM-dd HH:mm:ss")
}

export function aInputFechaHora(valor?: string | null) {
  const fecha = aFecha(valor)

  return fecha ? format(fecha, "yyyy-MM-dd'T'HH:mm") : ''
}

export function aInputFecha(valor?: string | null) {
  const fecha = aFecha(valor)

  return fecha ? format(fecha, 'yyyy-MM-dd') : ''
}
