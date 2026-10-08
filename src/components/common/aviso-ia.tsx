import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  texto?: string
  className?: string
}

// Tono suave e informativo a propósito: no es un error, solo un recordatorio de revisar lo generado.
export function AvisoIa({ texto = 'Generado por IA — revisa antes de usarlo', className }: Props) {
  return (
    <p className={cn('flex items-center gap-1.5 rounded-md bg-warning/10 px-2.5 py-1.5 text-xs text-warning', className)}>
      <Info className="size-3.5 shrink-0" />
      {texto}
    </p>
  )
}
