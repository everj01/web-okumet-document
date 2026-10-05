import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  valor: string
  onCambiar: (valor: string) => void
  placeholder?: string
  className?: string
}

export function Buscador({ valor, onCambiar, placeholder = 'Buscar...', className }: Props) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={valor}
        onChange={(evento) => onCambiar(evento.target.value)}
        placeholder={placeholder}
        className="pl-9"
      />
      {valor ? (
        <Button
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => onCambiar('')}
          aria-label="Limpiar búsqueda"
        >
          <X className="size-4" />
        </Button>
      ) : null}
    </div>
  )
}
