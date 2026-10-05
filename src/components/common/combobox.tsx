import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface OpcionCombo {
  valor: number | string
  texto: string
  detalle?: string
}

interface Props {
  opciones: OpcionCombo[]
  valor: number | string | null
  onCambiar: (valor: number | string | null) => void
  placeholder?: string
  vacio?: string
  permitirVacio?: boolean
  className?: string
  invalido?: boolean
}

export function Combobox({
  opciones,
  valor,
  onCambiar,
  placeholder = 'Selecciona una opción',
  vacio = 'Sin resultados',
  permitirVacio,
  className,
  invalido,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const seleccionada = opciones.find((opcion) => opcion.valor === valor)

  return (
    <Popover open={abierto} onOpenChange={setAbierto}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={abierto}
          aria-invalid={invalido}
          className={cn('w-full justify-between font-normal', !seleccionada && 'text-muted-foreground', className)}
        >
          <span className="truncate">{seleccionada?.texto ?? placeholder}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Escribe para filtrar..." />
          <CommandList>
            <CommandEmpty>{vacio}</CommandEmpty>
            <CommandGroup>
              {permitirVacio ? (
                <CommandItem
                  value="__vacio__"
                  onSelect={() => {
                    onCambiar(null)
                    setAbierto(false)
                  }}
                >
                  <span className="text-muted-foreground">{placeholder}</span>
                </CommandItem>
              ) : null}
              {opciones.map((opcion) => (
                <CommandItem
                  key={opcion.valor}
                  value={`${opcion.texto} ${opcion.detalle ?? ''}`}
                  onSelect={() => {
                    onCambiar(opcion.valor)
                    setAbierto(false)
                  }}
                >
                  <Check className={cn('size-4', opcion.valor === valor ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{opcion.texto}</span>
                  {opcion.detalle ? (
                    <span className="ml-auto truncate text-xs text-muted-foreground">{opcion.detalle}</span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
