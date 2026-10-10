import { X } from 'lucide-react'
import type { Etiqueta } from '@/types'

interface Props {
  etiqueta: Etiqueta
  onQuitar?: () => void
}

export function EtiquetaChip({ etiqueta, onQuitar }: Props) {
  return (
    <span
      className="inline-flex w-fit shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-neutral-800"
      style={{ backgroundColor: etiqueta.color }}
    >
      {etiqueta.nombre}
      {onQuitar ? (
        <button
          type="button"
          onClick={onQuitar}
          className="-mr-0.5 rounded-full p-0.5 transition-colors hover:bg-black/10"
          title={`Quitar etiqueta ${etiqueta.nombre}`}
          aria-label={`Quitar etiqueta ${etiqueta.nombre}`}
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  )
}
