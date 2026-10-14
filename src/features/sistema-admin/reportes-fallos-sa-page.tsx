import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bug, Check, ImageOff, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Buscador } from '@/components/common/buscador'
import { Campo } from '@/components/common/campo'
import { DataTable, type Columna } from '@/components/common/data-table'
import { PageHeader } from '@/components/common/page-header'
import { MOTIVOS_REPORTE_FALLO, type EstadoReporteFallo, type MotivoReporteFallo, type ReporteFallo } from '@/features/reportes-fallos/api'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import { fechaHora } from '@/lib/formato'
import { sistemaAdminApi } from './api'
import { useReportesFalloSA, useResolverReporteFalloSA } from './hooks'

const TODOS = 'todos'

function etiquetaMotivo(motivo: MotivoReporteFallo) {
  return MOTIVOS_REPORTE_FALLO.find((m) => m.valor === motivo)?.texto ?? motivo
}

function VerCapturaBoton({ reporte }: { reporte: ReporteFallo }) {
  const [abierto, setAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [url, setUrl] = useState<string | null>(null)

  const abrir = async () => {
    setAbierto(true)
    setCargando(true)

    try {
      const blob = await sistemaAdminApi.capturaReporteFallo(reporte.uuid)
      setUrl(URL.createObjectURL(blob))
    } catch {
      setUrl(null)
    } finally {
      setCargando(false)
    }
  }

  const cerrar = (valor: boolean) => {
    setAbierto(valor)
    if (!valor && url) {
      URL.revokeObjectURL(url)
      setUrl(null)
    }
  }

  if (!reporte.captura_url) {
    return (
      <Button variant="ghost" size="sm" disabled title="Este reporte no tiene captura">
        <ImageOff className="size-3.5" />
      </Button>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={abrir}>
        Ver captura
      </Button>

      <Dialog open={abierto} onOpenChange={cerrar}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Captura del reporte</DialogTitle>
          </DialogHeader>

          {cargando ? (
            <div className="flex h-64 items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : url ? (
            <img src={url} alt="Captura de pantalla del reporte" className="max-h-[70vh] w-full rounded-lg border border-border object-contain" />
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No se pudo cargar la captura.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

const esquemaRespuesta = z.object({
  respuesta: z.string().min(3, 'Escribe una respuesta').max(2000),
})

function ResolverReporteFalloBoton({ reporte }: { reporte: ReporteFallo }) {
  const [abierto, setAbierto] = useState(false)
  const resolver = useResolverReporteFalloSA()

  const { register, handleSubmit, reset, formState } = useForm<{ respuesta: string }>({
    resolver: zodResolver(esquemaRespuesta),
    defaultValues: { respuesta: '' },
  })

  const abrir = () => {
    reset({ respuesta: '' })
    setAbierto(true)
  }

  const enviar = handleSubmit(async (valores) => {
    await resolver.mutateAsync({ uuid: reporte.uuid, respuesta: valores.respuesta })
    setAbierto(false)
  })

  if (reporte.estado === 'resuelto') {
    return (
      <Button variant="ghost" size="sm" title={reporte.respuesta ?? undefined} className="text-success hover:text-success">
        <Check className="size-3.5" />
        Resuelto
      </Button>
    )
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={abrir}>
        <Check className="size-3.5" />
        Resolver
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Responder reporte</DialogTitle>
            <DialogDescription>El usuario va a ver esta respuesta en sus notificaciones.</DialogDescription>
          </DialogHeader>

          <form onSubmit={enviar} className="space-y-4" noValidate>
            <Campo etiqueta="Respuesta" obligatorio error={formState.errors.respuesta?.message}>
              <Textarea rows={4} placeholder="Explica qué se hizo o por qué pasó..." {...register('respuesta')} />
            </Campo>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAbierto(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={resolver.isPending}>
                {resolver.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Enviar y marcar resuelto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

const columnas: Columna<ReporteFallo>[] = [
  { id: 'created_at', encabezado: 'Fecha', ordenable: true, celda: (r) => fechaHora(r.creado_en) },
  { id: 'motivo', encabezado: 'Motivo', ordenable: true, celda: (r) => etiquetaMotivo(r.motivo) },
  { id: 'comentario', encabezado: 'Comentario', desde: 'md', celda: (r) => r.comentario || '—' },
  { id: 'ruta', encabezado: 'Vista', desde: 'lg', celda: (r) => r.ruta || '—' },
  { id: 'usuario', encabezado: 'Usuario', desde: 'sm', celda: (r) => r.usuario?.name || '—' },
  { id: 'tenant', encabezado: 'Negocio', desde: 'lg', celda: (r) => r.tenant?.nombre_comercial || '—' },
  {
    id: 'estado',
    encabezado: 'Estado',
    className: 'text-center',
    celda: (r) => <Badge variant={r.estado === 'resuelto' ? 'success' : 'warning'}>{r.estado === 'resuelto' ? 'Resuelto' : 'Pendiente'}</Badge>,
  },
  { id: 'captura', encabezado: '', className: 'text-right', celda: (r) => <VerCapturaBoton reporte={r} /> },
  { id: 'resolver', encabezado: '', className: 'text-right', celda: (r) => <ResolverReporteFalloBoton reporte={r} /> },
]

export default function ReportesFallosSaPage() {
  const [buscar, setBuscar] = useState('')
  const [motivo, setMotivo] = useState<MotivoReporteFallo | typeof TODOS>(TODOS)
  const [estado, setEstado] = useState<EstadoReporteFallo | typeof TODOS>(TODOS)
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [pagina, setPagina] = useState(1)
  const [orden, setOrden] = useState<{ campo: string; direccion: 'asc' | 'desc' } | undefined>(undefined)

  const busqueda = useDebounce(buscar)
  const filtro = useMemo(
    () => ({
      pagina,
      buscar: busqueda,
      orden: orden?.campo,
      direccion: orden?.direccion,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      motivo: motivo === TODOS ? undefined : motivo,
      estado: estado === TODOS ? undefined : estado,
    }),
    [pagina, busqueda, orden, fechaInicio, fechaFin, motivo, estado],
  )

  const { data, isPending, isFetching, error, refetch } = useReportesFalloSA(filtro)

  const ordenar = (campo: string) => {
    setOrden((actual) =>
      actual?.campo === campo ? { campo, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' } : { campo, direccion: 'asc' },
    )
    setPagina(1)
  }

  return (
    <div className="space-y-5">
      <PageHeader titulo="Reportes de fallos" descripcion="Fallas y sugerencias reportadas por usuarios de todos los negocios." />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
          <Buscador
            valor={buscar}
            onCambiar={(valor) => {
              setBuscar(valor)
              setPagina(1)
            }}
            placeholder="Buscar por comentario"
            className="max-w-sm flex-1"
          />

          <Campo etiqueta="Estado" className="w-40">
            <Select
              value={estado}
              onValueChange={(v) => {
                setEstado(v as EstadoReporteFallo | typeof TODOS)
                setPagina(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="resuelto">Resuelto</SelectItem>
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Motivo" className="w-56">
            <Select
              value={motivo}
              onValueChange={(v) => {
                setMotivo(v as MotivoReporteFallo | typeof TODOS)
                setPagina(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos</SelectItem>
                {MOTIVOS_REPORTE_FALLO.map((m) => (
                  <SelectItem key={m.valor} value={m.valor}>
                    {m.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Desde" className="w-36">
            <Input
              type="date"
              value={fechaInicio}
              onChange={(e) => {
                setFechaInicio(e.target.value)
                setPagina(1)
              }}
            />
          </Campo>
          <Campo etiqueta="Hasta" className="w-36">
            <Input
              type="date"
              value={fechaFin}
              onChange={(e) => {
                setFechaFin(e.target.value)
                setPagina(1)
              }}
            />
          </Campo>
        </div>

        <div className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <DataTable
            columnas={columnas}
            filas={data?.data ?? []}
            claveFila={(fila) => fila.id}
            cargando={isPending}
            error={error ? mensajeDeError(error) : null}
            onReintentar={() => refetch()}
            orden={orden}
            onOrdenar={ordenar}
            vacio={{ icono: Bug, titulo: 'Sin reportes para este filtro' }}
            paginacion={
              data
                ? { pagina: data.meta.current_page, porPagina: data.meta.per_page, total: data.meta.total, onCambiar: setPagina }
                : undefined
            }
          />
        </div>
      </Card>
    </div>
  )
}
