import { Bell, CalendarClock, CalendarX, Download, Sparkles, XCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface EstiloTipo {
  icono: LucideIcon
  // círculo del ícono + franja lateral del card
  clase: string
}

// Un color/ícono fijo por tipo para que el usuario distinga de un vistazo qué notificación es cuál.
const ESTILOS: Record<string, EstiloTipo> = {
  exportacion_completada: { icono: Download, clase: 'text-success bg-success/10' },
  reporte_completado: { icono: Download, clase: 'text-success bg-success/10' },
  exportacion_fallida: { icono: XCircle, clase: 'text-destructive bg-destructive/10' },
  reporte_fallido: { icono: XCircle, clase: 'text-destructive bg-destructive/10' },
  ia_credito_advertencia: { icono: Sparkles, clase: 'text-warning bg-warning/10' },
  ia_credito_agotado: { icono: Sparkles, clase: 'text-destructive bg-destructive/10' },
  evento_proximo: { icono: CalendarClock, clase: 'text-sky-600 bg-sky-500/10 dark:text-sky-400' },
  evento_vencido: { icono: CalendarX, clase: 'text-destructive bg-destructive/10' },
}

const ESTILO_DEFECTO: EstiloTipo = { icono: Bell, clase: 'text-muted-foreground bg-secondary' }

export function estiloNotificacion(tipo: string): EstiloTipo {
  return ESTILOS[tipo] ?? ESTILO_DEFECTO
}
