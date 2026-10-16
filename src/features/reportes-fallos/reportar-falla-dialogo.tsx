import { useEffect, useState } from 'react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Campo } from '@/components/common/campo'
import { useEnviarReporteFallo } from './hooks'
import { MOTIVOS_REPORTE_FALLO, type MotivoReporteFallo } from './api'

const esquema = z.object({
  motivo: z.enum(MOTIVOS_REPORTE_FALLO.map((m) => m.valor) as [MotivoReporteFallo, ...MotivoReporteFallo[]], {
    message: 'Elige un motivo',
  }),
  comentario: z.string().min(3, 'Cuéntanos un poco más').max(2000),
})

type Formulario = z.infer<typeof esquema>

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  captura: Blob | null
}

export function ReportarFallaDialogo({ abierto, onAbierto, captura }: Props) {
  const enviar = useEnviarReporteFallo()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // crear y revocar en el mismo efecto: con createObjectURL en useMemo, el doble-invocado de
  // StrictMode en desarrollo revocaba la URL justo después de crearla y la imagen quedaba rota
  useEffect(() => {
    if (!captura) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(captura)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [captura])

  const { register, handleSubmit, setValue, watch, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { comentario: '' },
  })

  const enviarReporte = handleSubmit(async (valores) => {
    await enviar.mutateAsync({
      motivo: valores.motivo,
      comentario: valores.comentario,
      ruta: window.location.pathname,
      captura,
    })
    onAbierto(false)
  })

  const errores = formState.errors

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reportar un problema</DialogTitle>
          <DialogDescription>Soporte técnico va a revisar esto junto con una captura de esta pantalla, todos los datos son con fines para mejorar el servicio.</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviarReporte} className="space-y-4" noValidate>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Captura de la pantalla actual"
              className="max-h-40 w-full rounded-lg border border-border object-cover object-top"
            />
          ) : null}

          <Campo etiqueta="Motivo" obligatorio error={errores.motivo?.message}>
            <Select
              value={watch('motivo')}
              onValueChange={(valor) => setValue('motivo', valor as MotivoReporteFallo, { shouldValidate: true })}
            >
              <SelectTrigger aria-invalid={Boolean(errores.motivo)}>
                <SelectValue placeholder="Elige una opción" />
              </SelectTrigger>
              <SelectContent>
                {MOTIVOS_REPORTE_FALLO.map((motivo) => (
                  <SelectItem key={motivo.valor} value={motivo.valor}>
                    {motivo.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Cuéntanos qué pasó" obligatorio error={errores.comentario?.message}>
            <Textarea rows={4} placeholder="Describe lo que viste o esperabas que pasara..." {...register('comentario')} />
          </Campo>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={enviar.isPending}>
              {enviar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Enviar reporte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
