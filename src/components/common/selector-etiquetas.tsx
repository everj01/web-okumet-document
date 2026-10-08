import { useState } from 'react'
import { Check, Loader2, Plus, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { COLORES_ETIQUETA } from '@/lib/etiquetas'
import { cn } from '@/lib/utils'
import type { Etiqueta, EtiquetaPayload } from '@/types'

interface Props {
  disponibles: Etiqueta[]
  seleccionadas: Etiqueta[]
  onCambiar: (ids: number[]) => void
  onCrear: (datos: EtiquetaPayload) => Promise<Etiqueta>
  guardando?: boolean
}

export function SelectorEtiquetas({ disponibles, seleccionadas, onCambiar, onCrear, guardando }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState<string>(COLORES_ETIQUETA[0].valor)
  const [enviando, setEnviando] = useState(false)

  const idsSeleccionados = new Set(seleccionadas.map((etiqueta) => etiqueta.id))

  const alternar = (id: number) => {
    const siguiente = idsSeleccionados.has(id)
      ? seleccionadas.filter((etiqueta) => etiqueta.id !== id).map((etiqueta) => etiqueta.id)
      : [...idsSeleccionados, id]

    onCambiar(Array.from(new Set(siguiente)))
  }

  const crear = async () => {
    if (!nombre.trim()) return

    setEnviando(true)
    try {
      const etiqueta = await onCrear({ nombre: nombre.trim(), color })
      onCambiar([...idsSeleccionados, etiqueta.id])
      setNombre('')
      setCreando(false)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" disabled={guardando}>
          {guardando ? <Loader2 className="size-3.5 animate-spin" /> : <Tag className="size-3.5" />}
          Etiquetas
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="max-h-48 space-y-0.5 overflow-y-auto">
          {disponibles.length ? (
            disponibles.map((etiqueta) => (
              <button
                key={etiqueta.id}
                type="button"
                onClick={() => alternar(etiqueta.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
              >
                <Check className={cn('size-3.5', idsSeleccionados.has(etiqueta.id) ? 'opacity-100' : 'opacity-0')} />
                <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: etiqueta.color }} />
                <span className="truncate">{etiqueta.nombre}</span>
              </button>
            ))
          ) : (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">Sin etiquetas todavía</p>
          )}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          {creando ? (
            <div className="space-y-2">
              <Input
                autoFocus
                value={nombre}
                onChange={(evento) => setNombre(evento.target.value)}
                placeholder="Nombre de la etiqueta"
                maxLength={40}
              />
              <div className="flex flex-wrap gap-1.5">
                {COLORES_ETIQUETA.map((opcion) => (
                  <button
                    key={opcion.valor}
                    type="button"
                    onClick={() => setColor(opcion.valor)}
                    aria-label={opcion.texto}
                    className={cn(
                      'size-6 rounded-full ring-offset-1 transition-transform',
                      color === opcion.valor ? 'ring-2 ring-ring' : '',
                    )}
                    style={{ backgroundColor: opcion.valor }}
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setCreando(false)}>
                  Cancelar
                </Button>
                <Button type="button" size="sm" disabled={!nombre.trim() || enviando} onClick={crear}>
                  {enviando ? <Loader2 className="size-3.5 animate-spin" /> : null}
                  Crear
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="ghost" size="sm" className="w-full justify-start" onClick={() => setCreando(true)}>
              <Plus className="size-3.5" />
              Nueva etiqueta
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
