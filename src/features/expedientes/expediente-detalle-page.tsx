import { useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Bot,
  CalendarClock,
  CalendarPlus,
  Eye,
  FileText,
  FileUp,
  History,
  Pencil,
  Plus,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useConfirmar } from '@/components/common/confirmar'
import { DataTable, type Columna } from '@/components/common/data-table'
import { EstadoError, EstadoVacio } from '@/components/common/estados'
import {
  EstadoEventoBadge,
  EstadoExpedienteBadge,
  TipoEventoBadge,
} from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { EventoDialogo } from '@/features/agenda/evento-dialogo'
import { useAuth } from '@/features/auth/auth-context'
import { REGISTRADO_POR_SISTEMA } from '@/lib/etiquetas'
import { useEliminarDocumento } from '@/features/documentos/hooks'
import { ApiError, mensajeDeError } from '@/lib/api'
import { fechaCorta, fechaHora, pesoLegible } from '@/lib/formato'
import type { Documento } from '@/types'
import { ExpedienteDialogo } from './expediente-dialogo'
import { useExpediente, useMovimientos } from './hooks'
import { MovimientoDialogo } from './movimiento-dialogo'
import { SubirDocumentoDialogo } from './subir-documento-dialogo'
import { useCanalExpediente } from './use-canal-expediente'

export default function ExpedienteDetallePage() {
  const { uuid } = useParams()
  const { puedeEliminar } = useAuth()
  const confirmar = useConfirmar()

  const { data: expediente, isPending, error, refetch } = useExpediente(uuid)
  useCanalExpediente(expediente?.id)
  const { eliminar: eliminarMovimiento } = useMovimientos(uuid)
  const eliminarDocumento = useEliminarDocumento()

  const [editar, setEditar] = useState(false)
  const [nuevoMovimiento, setNuevoMovimiento] = useState(false)
  const [subirDocumento, setSubirDocumento] = useState(false)
  const [nuevaFecha, setNuevaFecha] = useState(false)

  if (error) {
    // Un 403 no se arregla reintentando: el abogado no tiene este expediente asignado.
    if (error instanceof ApiError && error.status === 403) {
      return (
        <EstadoVacio
          icono={ShieldAlert}
          titulo="No tienes acceso a este expediente"
          descripcion={mensajeDeError(error)}
          accion={
            <Button variant="outline" size="sm" asChild>
              <Link to="/expedientes">
                <ArrowLeft className="size-4" />
                Volver a Expedientes
              </Link>
            </Button>
          }
        />
      )
    }

    return <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-72" />
      </div>
    )
  }

  const pedirEliminarDocumento = async (documento: Documento) => {
    const confirmado = await confirmar({
      titulo: 'Eliminar documento',
      descripcion: `Se eliminará "${documento.nombre}" y su texto indexado.`,
      confirmar: 'Eliminar',
      peligroso: true,
    })

    if (confirmado) {
      eliminarDocumento.mutate(documento.uuid)
    }
  }

  const pedirEliminarMovimiento = async (movimientoUuid: string) => {
    const confirmado = await confirmar({
      titulo: 'Eliminar movimiento',
      descripcion: 'Se quitará de la línea de tiempo del expediente.',
      confirmar: 'Eliminar',
      peligroso: true,
    })

    if (confirmado) {
      eliminarMovimiento.mutate(movimientoUuid)
    }
  }

  const columnasDocumentos: Columna<Documento>[] = [
    {
      id: 'nombre',
      encabezado: 'Documento',
      celda: (documento) => (
        <div className="min-w-0">
          <Link to={`/documentos/${documento.uuid}`} className="font-medium hover:underline">
            {documento.nombre}
          </Link>
          {documento.resumen ? <p className="text-xs text-success">Con resumen generado</p> : null}
        </div>
      ),
    },
    {
      id: 'paginas',
      encabezado: 'Páginas',
      desde: 'sm',
      className: 'text-center',
      celda: (documento) => <span className="tabular-nums">{documento.paginas || '—'}</span>,
    },
    {
      id: 'peso',
      encabezado: 'Peso',
      desde: 'sm',
      className: 'text-center',
      celda: (documento) => pesoLegible(documento.tamano),
    },
    {
      id: 'fecha',
      encabezado: 'Subido',
      desde: 'md',
      celda: (documento) => fechaCorta(documento.creado_en),
    },
    {
      id: 'acciones',
      encabezado: '',
      className: 'w-20 text-right',
      celda: (documento) => (
        <div className="flex justify-end gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild title="Abrir documento" aria-label="Abrir documento">
            <Link to={`/documentos/${documento.uuid}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          {puedeEliminar ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => pedirEliminarDocumento(documento)}
              title="Eliminar documento"
              aria-label="Eliminar documento"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  const movimientos = expediente.movimientos ?? []
  const documentos = expediente.documentos ?? []
  const eventos = expediente.eventos ?? []

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/expedientes">
          <ArrowLeft className="size-4" />
          Expedientes
        </Link>
      </Button>

      <PageHeader
        titulo={expediente.titulo}
        descripcion={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{expediente.codigo}</span>
            <EstadoExpedienteBadge estado={expediente.estado} />
            <Link to={`/clientes/${expediente.cliente?.uuid}`} className="hover:underline">
              {expediente.cliente?.nombre}
            </Link>
          </span>
        }
        acciones={
          <Button variant="outline" onClick={() => setEditar(true)}>
            <Pencil className="size-4" />
            Editar
          </Button>
        }
      />

      <Card className="aparecer">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { etiqueta: 'Materia', valor: expediente.materia || '—' },
            { etiqueta: 'Juzgado', valor: expediente.juzgado || '—' },
            { etiqueta: 'Abogado', valor: expediente.abogado?.name || 'Sin asignar' },
            { etiqueta: 'Año', valor: String(expediente.anio) },
            { etiqueta: 'Inicio', valor: fechaCorta(expediente.fecha_inicio) },
          ].map((dato) => (
            <div key={dato.etiqueta}>
              <p className="text-xs text-muted-foreground">{dato.etiqueta}</p>
              <p className="text-sm">{dato.valor}</p>
            </div>
          ))}

          {expediente.descripcion ? (
            <p className="rounded-lg bg-secondary/60 p-4 text-sm whitespace-pre-line sm:col-span-2 lg:col-span-4">
              {expediente.descripcion}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Tabs defaultValue="movimientos">
        <TabsList>
          <TabsTrigger value="movimientos">
            <History />
            Movimientos ({movimientos.length})
          </TabsTrigger>
          <TabsTrigger value="documentos">
            <FileText />
            Documentos ({documentos.length})
          </TabsTrigger>
          <TabsTrigger value="agenda">
            <CalendarClock />
            Agenda ({eventos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="movimientos">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm text-muted-foreground">Línea de tiempo del caso</p>
              <Button size="sm" onClick={() => setNuevoMovimiento(true)}>
                <Plus className="size-4" />
                Registrar
              </Button>
            </div>

            {movimientos.length ? (
              <ol className="space-y-5 p-5 pl-7">
                {movimientos.map((movimiento) => (
                  <li key={movimiento.id} className="relative border-l border-border pb-1 pl-6">
                    <span className="absolute top-1.5 -left-[5px] size-2.5 rounded-full bg-accent" />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="text-xs text-muted-foreground">{fechaCorta(movimiento.fecha)}</p>
                        <p className="font-medium">{movimiento.titulo}</p>
                        {movimiento.detalle ? (
                          <p className="text-sm whitespace-pre-line text-muted-foreground">{movimiento.detalle}</p>
                        ) : null}
                        {movimiento.registrado_por === REGISTRADO_POR_SISTEMA ? (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Bot className="size-3.5" />
                            Registrado automáticamente
                          </p>
                        ) : movimiento.registrado_por ? (
                          <p className="text-xs text-muted-foreground">Registrado por {movimiento.registrado_por}</p>
                        ) : null}
                      </div>
                      {puedeEliminar ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => pedirEliminarMovimiento(movimiento.uuid)}
                          title="Eliminar movimiento"
                          aria-label="Eliminar movimiento"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <EstadoVacio
                icono={History}
                titulo="Sin movimientos"
                descripcion="Registra las actuaciones para tener el historial completo del caso."
                accion={
                  <Button variant="outline" onClick={() => setNuevoMovimiento(true)}>
                    <Plus className="size-4" />
                    Registrar movimiento
                  </Button>
                }
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm text-muted-foreground">PDF del expediente</p>
              <Button size="sm" onClick={() => setSubirDocumento(true)}>
                <FileUp className="size-4" />
                Subir PDF
              </Button>
            </div>

            <DataTable
              columnas={columnasDocumentos}
              filas={documentos}
              claveFila={(documento) => documento.id}
              vacio={{
                icono: FileText,
                titulo: 'Sin documentos',
                descripcion: 'Sube los escritos y resoluciones en PDF para buscarlos por contenido.',
                accion: (
                  <Button variant="outline" onClick={() => setSubirDocumento(true)}>
                    <FileUp className="size-4" />
                    Subir PDF
                  </Button>
                ),
              }}
            />
          </Card>
        </TabsContent>

        <TabsContent value="agenda">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm text-muted-foreground">Audiencias y vencimientos del caso</p>
              <Button size="sm" onClick={() => setNuevaFecha(true)}>
                <CalendarPlus className="size-4" />
                Agregar fecha
              </Button>
            </div>

            {eventos.length ? (
              <ul className="divide-y divide-border">
                {eventos.map((evento) => (
                  <li key={evento.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-medium">{evento.titulo}</p>
                      <p className="text-sm text-muted-foreground">
                        {fechaHora(evento.inicio)}
                        {evento.lugar ? ` · ${evento.lugar}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TipoEventoBadge tipo={evento.tipo} />
                      <EstadoEventoBadge estado={evento.estado} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EstadoVacio
                icono={CalendarClock}
                titulo="Sin fechas"
                descripcion="Agrega la próxima audiencia o vencimiento para recibir el recordatorio."
                accion={
                  <Button variant="outline" onClick={() => setNuevaFecha(true)}>
                    <CalendarPlus className="size-4" />
                    Agregar fecha
                  </Button>
                }
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <ExpedienteDialogo abierto={editar} onAbierto={setEditar} expediente={expediente} />
      <MovimientoDialogo abierto={nuevoMovimiento} onAbierto={setNuevoMovimiento} expedienteUuid={expediente.uuid} />
      <SubirDocumentoDialogo
        abierto={subirDocumento}
        onAbierto={setSubirDocumento}
        expedienteUuid={expediente.uuid}
      />
      <EventoDialogo abierto={nuevaFecha} onAbierto={setNuevaFecha} expedienteFijo={expediente.id} />
    </div>
  )
}
