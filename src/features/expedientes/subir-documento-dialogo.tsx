import { useEffect, useState } from 'react'
import { FileUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { useSubirDocumento } from '@/features/documentos/hooks'
import { pesoLegible } from '@/lib/formato'

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  expedienteUuid: string
}

export function SubirDocumentoDialogo({ abierto, onAbierto, expedienteUuid }: Props) {
  const subir = useSubirDocumento(expedienteUuid)
  const [archivo, setArchivo] = useState<File | null>(null)
  const [nombre, setNombre] = useState('')

  useEffect(() => {
    if (abierto) {
      setArchivo(null)
      setNombre('')
    }
  }, [abierto])

  const elegir = (elegido: File | null) => {
    setArchivo(elegido)

    if (elegido && !nombre) {
      setNombre(elegido.name.replace(/\.pdf$/i, ''))
    }
  }

  const enviar = async (evento: React.FormEvent) => {
    evento.preventDefault()

    if (!archivo) return

    await subir.mutateAsync({ archivo, nombre })
    onAbierto(false)
  }

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir documento</DialogTitle>
          <DialogDescription>
            Solo PDF, hasta 20 MB. Al subirlo se extrae el texto para poder buscarlo por contenido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4">
          <Campo etiqueta="Archivo" obligatorio>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-8 text-center transition-colors hover:border-ring hover:bg-secondary/50">
              <FileUp className="size-6 text-muted-foreground" />
              {archivo ? (
                <span className="text-sm">
                  <span className="font-medium">{archivo.name}</span>
                  <span className="text-muted-foreground"> · {pesoLegible(archivo.size)}</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Haz clic para elegir el PDF</span>
              )}
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(evento) => elegir(evento.target.files?.[0] ?? null)}
              />
            </label>
          </Campo>

          <Campo etiqueta="Nombre para mostrar">
            <Input value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
          </Campo>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!archivo || subir.isPending}>
              {subir.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Subir
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
