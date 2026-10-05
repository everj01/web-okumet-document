import { cn } from '@/lib/utils'

interface Props {
  titulo: string
  descripcion?: React.ReactNode
  acciones?: React.ReactNode
  className?: string
}

export function PageHeader({ titulo, descripcion, acciones, className }: Props) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{titulo}</h1>
        {descripcion ? <p className="text-sm text-muted-foreground">{descripcion}</p> : null}
      </div>
      {acciones ? <div className="flex items-center gap-2">{acciones}</div> : null}
    </div>
  )
}
