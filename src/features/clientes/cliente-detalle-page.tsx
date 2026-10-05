import { Link, useParams } from 'react-router'
import { ArrowLeft, FolderOpen, Mail, MapPin, Pencil, Phone } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DataTable, type Columna } from '@/components/common/data-table'
import { EstadoError } from '@/components/common/estados'
import { ActivoBadge, EstadoExpedienteBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { mensajeDeError } from '@/lib/api'
import { fechaCorta } from '@/lib/formato'
import type { Expediente } from '@/types'
import { ClienteDialogo } from './cliente-dialogo'
import { useCliente } from './hooks'

export default function ClienteDetallePage() {
  const { uuid } = useParams()
  const { data: cliente, isPending, error, refetch } = useCliente(uuid)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  if (error) {
    return <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
  }

  const columnas: Columna<Expediente>[] = [
    {
      id: 'codigo',
      encabezado: 'Código',
      celda: (expediente) => (
        <Link to={`/expedientes/${expediente.uuid}`} className="font-medium hover:underline">
          {expediente.codigo}
        </Link>
      ),
    },
    { id: 'titulo', encabezado: 'Asunto', celda: (expediente) => expediente.titulo },
    {
      id: 'abogado',
      encabezado: 'Abogado',
      desde: 'md',
      celda: (expediente) => expediente.abogado?.name ?? 'Sin asignar',
    },
    {
      id: 'inicio',
      encabezado: 'Inicio',
      desde: 'sm',
      celda: (expediente) => fechaCorta(expediente.fecha_inicio),
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      className: 'text-right',
      celda: (expediente) => <EstadoExpedienteBadge estado={expediente.estado} />,
    },
  ]

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/clientes">
          <ArrowLeft className="size-4" />
          Clientes
        </Link>
      </Button>

      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-36" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <>
          <PageHeader
            titulo={cliente.nombre}
            descripcion={
              <span className="flex flex-wrap items-center gap-2">
                <span>
                  {cliente.tipo_documento} {cliente.numero_documento}
                </span>
                <ActivoBadge activo={cliente.activo} />
              </span>
            }
            acciones={
              <Button variant="outline" onClick={() => setDialogoAbierto(true)}>
                <Pencil className="size-4" />
                Editar
              </Button>
            }
          />

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="aparecer">
              <CardContent className="flex items-center gap-3 p-5">
                <Mail className="size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Correo</p>
                  <p className="truncate text-sm">{cliente.email || '—'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="aparecer">
              <CardContent className="flex items-center gap-3 p-5">
                <Phone className="size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                  <p className="truncate text-sm">{cliente.telefono || '—'}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="aparecer">
              <CardContent className="flex items-center gap-3 p-5">
                <MapPin className="size-4 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Dirección</p>
                  <p className="truncate text-sm">{cliente.direccion || '—'}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {cliente.notas ? (
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="mt-1 text-sm whitespace-pre-line">{cliente.notas}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="font-medium">Historial de casos</h2>
              <p className="text-sm text-muted-foreground">
                {cliente.expedientes_count ?? 0} expedientes registrados
              </p>
            </div>

            <DataTable
              columnas={columnas}
              filas={cliente.expedientes ?? []}
              claveFila={(expediente) => expediente.id}
              filaClassName={() => (cliente.activo ? undefined : 'opacity-50')}
              vacio={{
                icono: FolderOpen,
                titulo: 'Sin expedientes',
                descripcion: 'Cuando abras un caso para este cliente aparecerá aquí.',
              }}
            />
          </Card>

          <ClienteDialogo abierto={dialogoAbierto} onAbierto={setDialogoAbierto} cliente={cliente} />
        </>
      )}
    </div>
  )
}
