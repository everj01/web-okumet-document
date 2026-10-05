import { AlertTriangle, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function EstadoVacio({
  icono: Icono,
  titulo,
  descripcion,
  accion,
  className,
}: {
  icono: LucideIcon
  titulo: string
  descripcion?: string
  accion?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-14 text-center', className)}>
      <div className="grid size-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <Icono className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">{titulo}</p>
        {descripcion ? <p className="max-w-sm text-sm text-muted-foreground">{descripcion}</p> : null}
      </div>
      {accion}
    </div>
  )
}

export function EstadoError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="font-medium">No pudimos cargar la información</p>
        <p className="max-w-sm text-sm text-muted-foreground">{mensaje}</p>
      </div>
      {onReintentar ? (
        <Button variant="outline" size="sm" onClick={onReintentar}>
          <RefreshCw className="size-4" />
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}

export function FilasCargando({ filas = 5, columnas = 4 }: { filas?: number; columnas?: number }) {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: filas }).map((_, fila) => (
        <div key={fila} className="flex gap-4">
          {Array.from({ length: columnas }).map((_, columna) => (
            <Skeleton key={columna} className={cn('h-8 flex-1', columna === 0 && 'flex-[2]')} />
          ))}
        </div>
      ))}
    </div>
  )
}
