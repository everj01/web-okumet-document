import {
  Building2,
  CalendarClock,
  FileSpreadsheet,
  Folder,
  LayoutDashboard,
  ScrollText,
  UserRound,
  Users,
  Wifi,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ItemNavSA {
  etiqueta: string
  ruta: string
  icono: LucideIcon
}

// rutas relativas a /sistema_admin/panel
export const NAV_SA: ItemNavSA[] = [
  { etiqueta: 'Dashboard', ruta: '', icono: LayoutDashboard },
  { etiqueta: 'Negocios', ruta: 'tenants', icono: Building2 },
  { etiqueta: 'Usuarios', ruta: 'usuarios', icono: UserRound },
  { etiqueta: 'Clientes', ruta: 'clientes', icono: Users },
  { etiqueta: 'Expedientes', ruta: 'expedientes', icono: Folder },
  { etiqueta: 'Agenda', ruta: 'eventos', icono: CalendarClock },
  { etiqueta: 'Usuarios en línea', ruta: 'en-linea', icono: Wifi },
  { etiqueta: 'Auditoría', ruta: 'auditoria', icono: ScrollText },
  { etiqueta: 'Reportes', ruta: 'reportes', icono: FileSpreadsheet },
]
