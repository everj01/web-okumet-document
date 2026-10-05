import { Building2, CalendarClock, FileText, FolderOpen, LayoutDashboard, Users, UserCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ItemNavegacion {
  etiqueta: string
  ruta: string
  icono: LucideIcon
  soloAdmin?: boolean
}

export const GRUPOS: { titulo: string; items: ItemNavegacion[] }[] = [
  {
    titulo: 'Estudio',
    items: [
      { etiqueta: 'Panel', ruta: '/panel', icono: LayoutDashboard },
      { etiqueta: 'Agenda', ruta: '/agenda', icono: CalendarClock },
    ],
  },
  {
    titulo: 'Casos',
    items: [
      { etiqueta: 'Clientes', ruta: '/clientes', icono: Users },
      { etiqueta: 'Expedientes', ruta: '/expedientes', icono: FolderOpen },
      { etiqueta: 'Documentos', ruta: '/documentos', icono: FileText },
    ],
  },
  {
    titulo: 'Administración',
    items: [
      { etiqueta: 'Usuarios', ruta: '/usuarios', icono: UserCog, soloAdmin: true },
      { etiqueta: 'Mi negocio', ruta: '/negocio', icono: Building2, soloAdmin: true },
    ],
  },
]
