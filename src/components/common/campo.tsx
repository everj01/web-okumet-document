import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  etiqueta: string
  error?: string
  ayuda?: string
  obligatorio?: boolean
  className?: string
  children: React.ReactNode
  // algo corto al otro extremo de la etiqueta, ej. un link "¿Olvidaste tu contraseña?"
  extra?: React.ReactNode
}

export function Campo({ etiqueta, error, ayuda, obligatorio, className, children, extra }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm">
          {etiqueta}
          {obligatorio ? <span className="text-destructive">*</span> : null}
        </Label>
        {extra}
      </div>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-muted-foreground">{ayuda}</p>
      ) : null}
    </div>
  )
}
