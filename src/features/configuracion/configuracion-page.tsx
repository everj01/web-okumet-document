import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Download, Loader2, Mail, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EstadoError } from '@/components/common/estados'
import { PageHeader } from '@/components/common/page-header'
import { ExportacionDialogo } from '@/features/exportaciones/exportacion-dialogo'
import { useCrearExportacion } from '@/features/exportaciones/hooks'
import { ProgresoExportacionModal } from '@/features/exportaciones/progreso-exportacion-modal'
import { mensajeDeError } from '@/lib/api'
import type { ExportacionPayload } from '@/types'
import { useConfiguracion, useGuardarConfiguracion } from './hooks'

const esquema = z.object({
  correos: z.array(z.object({ valor: z.string().email('Correo no válido') })),
})

type Formulario = z.infer<typeof esquema>

export default function ConfiguracionPage() {
  const { data: configuracion, isPending, error, refetch } = useConfiguracion()
  const guardar = useGuardarConfiguracion()

  const [exportacionAbierta, setExportacionAbierta] = useState(false)
  const [exportacionUuid, setExportacionUuid] = useState<string | null>(null)
  const crearExportacion = useCrearExportacion()

  const iniciarExportacion = (filtros: ExportacionPayload) => {
    setExportacionAbierta(false)
    crearExportacion.mutate(filtros, {
      onSuccess: (exportacion) => setExportacionUuid(exportacion.uuid),
    })
  }

  const { control, register, handleSubmit, reset, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { correos: [] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'correos' })

  useEffect(() => {
    if (!configuracion) return

    reset({ correos: configuracion.correos_cc.map((valor) => ({ valor })) })
  }, [configuracion, reset])

  const enviar = handleSubmit((valores) => {
    guardar.mutate({ correos_cc: valores.correos.map((correo) => correo.valor) })
  })

  const errores = formState.errors.correos

  if (error) {
    return <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader
        titulo="Configuración"
        descripcion="Correos que reciben copia de las notificaciones del estudio (agenda, recordatorios, etc.)."
      />

      {isPending ? (
        <Skeleton className="h-64" />
      ) : (
        <Card className="aparecer">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <Mail className="size-4 text-muted-foreground" />
            <h2 className="font-medium">Correos en copia</h2>
          </div>

          <CardContent className="p-6">
            <form onSubmit={enviar} className="space-y-4" noValidate>
              <div className="space-y-2">
                {fields.length ? (
                  fields.map((field, indice) => (
                    <div key={field.id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <Input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          {...register(`correos.${indice}.valor`)}
                          aria-invalid={Boolean(errores?.[indice]?.valor)}
                        />
                        {errores?.[indice]?.valor ? (
                          <p className="mt-1 text-xs text-destructive">{errores[indice]?.valor?.message}</p>
                        ) : null}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => remove(indice)}
                        aria-label="Quitar correo"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sin correos en copia. Las notificaciones solo le llegan al responsable asignado.
                  </p>
                )}
              </div>

              <Button type="button" variant="outline" size="sm" onClick={() => append({ valor: '' })}>
                <Plus className="size-4" />
                Agregar correo
              </Button>

              <div className="flex justify-end border-t border-border pt-4">
                <Button type="submit" disabled={guardar.isPending}>
                  {guardar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Guardar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="aparecer">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <Download className="size-4 text-muted-foreground" />
          <h2 className="font-medium">Exportar datos (backup)</h2>
        </div>

        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            Genera un ZIP con los documentos del negocio organizados por cliente y expediente, más un Excel con los
            datos informativos de clientes, expedientes, movimientos y eventos.
          </p>
          <Button type="button" onClick={() => setExportacionAbierta(true)} disabled={crearExportacion.isPending}>
            {crearExportacion.isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Exportar datos
          </Button>
        </CardContent>
      </Card>

      <ExportacionDialogo
        abierto={exportacionAbierta}
        onAbierto={setExportacionAbierta}
        onConfirmar={iniciarExportacion}
      />
      <ProgresoExportacionModal uuid={exportacionUuid} onCerrar={() => setExportacionUuid(null)} />
    </div>
  )
}
