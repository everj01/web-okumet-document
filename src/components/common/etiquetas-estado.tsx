import { Badge } from '@/components/ui/badge'
import { ESTADOS_EVENTO, ESTADOS_EXPEDIENTE, TIPOS_EVENTO } from '@/lib/etiquetas'
import type { EstadoEvento, EstadoExpediente, TipoEvento } from '@/types'

export function EstadoExpedienteBadge({ estado }: { estado: EstadoExpediente }) {
  const dato = ESTADOS_EXPEDIENTE[estado]

  return <Badge variant={dato?.variante ?? 'neutral'}>{dato?.texto ?? estado}</Badge>
}

export function TipoEventoBadge({ tipo }: { tipo: TipoEvento }) {
  const dato = TIPOS_EVENTO[tipo]
  const Icono = dato?.icono

  return (
    <Badge variant={dato?.variante ?? 'neutral'}>
      {Icono ? <Icono /> : null}
      {dato?.texto ?? tipo}
    </Badge>
  )
}

export function EstadoEventoBadge({ estado }: { estado: EstadoEvento }) {
  const dato = ESTADOS_EVENTO[estado]

  return <Badge variant={dato?.variante ?? 'neutral'}>{dato?.texto ?? estado}</Badge>
}

export function ActivoBadge({ activo }: { activo: boolean }) {
  return <Badge variant={activo ? 'success' : 'neutral'}>{activo ? 'Activo' : 'Inactivo'}</Badge>
}
