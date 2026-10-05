import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Campo } from '@/components/common/campo'
import { aInputFecha } from '@/lib/formato'
import { useMovimientos } from './hooks'

const esquema = z.object({
  fecha: z.string().min(1, 'Elige la fecha'),
  titulo: z.string().min(1, 'Describe el movimiento').max(180),
  detalle: z.string().max(5000),
})

type Formulario = z.infer<typeof esquema>

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  expedienteUuid: string
}

export function MovimientoDialogo({ abierto, onAbierto, expedienteUuid }: Props) {
  const { crear } = useMovimientos(expedienteUuid)

  const { register, handleSubmit, reset, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  })

  useEffect(() => {
    if (abierto) {
      reset({ fecha: aInputFecha(new Date().toISOString()), titulo: '', detalle: '' })
    }
  }, [abierto, reset])

  const enviar = handleSubmit(async (valores) => {
    await crear.mutateAsync({ ...valores, detalle: valores.detalle || null })
    onAbierto(false)
  })

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo movimiento</DialogTitle>
          <DialogDescription>Cada actuación queda en la línea de tiempo del expediente.</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4" noValidate>
          <Campo etiqueta="Fecha" obligatorio error={formState.errors.fecha?.message}>
            <Input type="date" {...register('fecha')} aria-invalid={Boolean(formState.errors.fecha)} />
          </Campo>

          <Campo etiqueta="Título" obligatorio error={formState.errors.titulo?.message}>
            <Input
              placeholder="Auto admisorio, escrito presentado..."
              {...register('titulo')}
              aria-invalid={Boolean(formState.errors.titulo)}
            />
          </Campo>

          <Campo etiqueta="Detalle">
            <Textarea rows={4} {...register('detalle')} />
          </Campo>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={crear.isPending}>
              {crear.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
