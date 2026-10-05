import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Props {
  etiqueta: string
  error?: string
  ayuda?: string
  obligatorio?: boolean
  className?: string
  children: React.ReactNode
}

export function Campo({ etiqueta, error, ayuda, obligatorio, className, children }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm">
        {etiqueta}
        {obligatorio ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : ayuda ? (
        <p className="text-xs text-muted-foreground">{ayuda}</p>
      ) : null}
    </div>
  )
}
