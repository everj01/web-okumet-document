import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Buscador } from '@/components/common/buscador'
import { Campo } from '@/components/common/campo'
import { useConfirmar } from '@/components/common/confirmar'
import { useExpedientes } from '@/features/expedientes/hooks'
import { cn } from '@/lib/utils'

const MAX_EXPEDIENTES = 50

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  onConfirmar: (filtros: { fecha_inicio: string | null; fecha_fin: string | null; expediente_ids: number[] }) => void
}

export function ExportacionDialogo({ abierto, onAbierto, onConfirmar }: Props) {
  const confirmar = useConfirmar()
  const [buscar, setBuscar] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [seleccionados, setSeleccionados] = useState<Set<number>>(new Set())

  const { data, isPending } = useExpedientes({ pagina: 1, buscar, estado: null })
  const expedientes = data?.data ?? []

  const alternar = (id: number) => {
    setSeleccionados((actual) => {
      const siguiente = new Set(actual)
      if (siguiente.has(id)) {
        siguiente.delete(id)
      } else if (siguiente.size < MAX_EXPEDIENTES) {
        siguiente.add(id)
      }
      return siguiente
    })
  }

  const enviar = async () => {
    if (!seleccionados.size) return

    const continuar = await confirmar({
      titulo: 'Generar backup',
      descripcion:
        'La generación puede tardar varios minutos según la cantidad de documentos y expedientes seleccionados. Te avisaremos cuando esté lista para descargar.',
      confirmar: 'Generar',
    })
    if (!continuar) return

    onConfirmar({
      fecha_inicio: fechaInicio || null,
      fecha_fin: fechaFin || null,
      expediente_ids: Array.from(seleccionados),
    })
  }

  return (
    <Dialog
      open={abierto}
      onOpenChange={(valor) => {
        onAbierto(valor)
        if (!valor) {
          setSeleccionados(new Set())
          setBuscar('')
          setFechaInicio('')
          setFechaFin('')
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Exportar datos del negocio</DialogTitle>
          <DialogDescription>
            Selecciona hasta {MAX_EXPEDIENTES} expedientes. El ZIP incluirá los documentos organizados por cliente y
            expediente, más un Excel con los datos informativos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etiqueta="Desde (fecha de inicio del expediente)">
            <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
          </Campo>
          <Campo etiqueta="Hasta">
            <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
          </Campo>
        </div>

        <Buscador valor={buscar} onCambiar={setBuscar} placeholder="Buscar expediente por código o asunto..." />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {seleccionados.size} de {MAX_EXPEDIENTES} seleccionados
          </span>
        </div>

        <div className="max-h-72 space-y-0.5 overflow-y-auto rounded-lg border border-border p-1">
          {isPending ? (
            <p className="p-3 text-sm text-muted-foreground">Cargando expedientes...</p>
          ) : expedientes.length ? (
            expedientes.map((expediente) => {
              const marcado = seleccionados.has(expediente.id)
              const bloqueado = !marcado && seleccionados.size >= MAX_EXPEDIENTES

              return (
                <button
                  key={expediente.id}
                  type="button"
                  disabled={bloqueado}
                  onClick={() => alternar(expediente.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <span
                    className={cn(
                      'grid size-4 shrink-0 place-items-center rounded border border-border',
                      marcado && 'border-primary bg-primary text-primary-foreground',
                    )}
                  >
                    {marcado ? <Check className="size-3" /> : null}
                  </span>
                  <span className="truncate">
                    <span className="font-medium">{expediente.codigo}</span>
                    <span className="text-muted-foreground"> · {expediente.titulo}</span>
                  </span>
                </button>
              )
            })
          ) : (
            <p className="p-3 text-sm text-muted-foreground">Sin expedientes para este filtro.</p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={!seleccionados.size} onClick={enviar}>
            Generar backup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
