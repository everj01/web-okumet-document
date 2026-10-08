import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, FolderOpen, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Buscador } from '@/components/common/buscador'
import { useConfirmar } from '@/components/common/confirmar'
import { DataTable, type Columna } from '@/components/common/data-table'
import { EstadoExpedienteBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { useAuth } from '@/features/auth/auth-context'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import { ESTADOS_EXPEDIENTE, opciones } from '@/lib/etiquetas'
import { fechaCorta } from '@/lib/formato'
import type { Expediente } from '@/types'
import { expedientesApi, expedientesKeys } from './api'
import { ExpedienteDialogo } from './expediente-dialogo'
import { useEliminarExpediente, useExpedientes } from './hooks'
import { useCanalListaExpedientes } from './use-canal-lista-expedientes'

const ESTADOS = opciones(ESTADOS_EXPEDIENTE)
const TODOS = 'todos'

export default function ExpedientesPage() {
  const { puedeEliminar } = useAuth()
  const confirmar = useConfirmar()
  const queryClient = useQueryClient()

  useCanalListaExpedientes()

  const [buscar, setBuscar] = useState('')
  const [estado, setEstado] = useState<string>(TODOS)
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<Expediente | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  const busqueda = useDebounce(buscar)
  const filtro = useMemo(
    () => ({ pagina, buscar: busqueda, estado: estado === TODOS ? null : estado }),
    [pagina, busqueda, estado],
  )

  const { data, isPending, isFetching, error, refetch } = useExpedientes(filtro)
  const eliminar = useEliminarExpediente()

  const abrirNuevo = () => {
    setEditando(null)
    setDialogoAbierto(true)
  }

  const pedirEliminar = async (expediente: Expediente) => {
    const confirmado = await confirmar({
      titulo: 'Eliminar expediente',
      descripcion: `Se eliminarán también los movimientos y documentos de ${expediente.codigo}.`,
      confirmar: 'Eliminar',
      peligroso: true,
    })

    if (confirmado) {
      eliminar.mutate(expediente.uuid)
    }
  }

  const columnas: Columna<Expediente>[] = [
    {
      id: 'expediente',
      encabezado: 'Expediente',
      celda: (expediente) => (
        <div className="min-w-0">
          <Link to={`/expedientes/${expediente.uuid}`} className="font-medium hover:underline">
            {expediente.titulo}
          </Link>
          <p className="text-xs text-muted-foreground">
            {expediente.codigo} · {expediente.materia || 'Sin materia'}
          </p>
        </div>
      ),
    },
    {
      id: 'cliente',
      encabezado: 'Cliente',
      desde: 'md',
      celda: (expediente) => (
        <div>
          <span>{expediente.cliente?.nombre ?? '—'}</span>
          {expediente.cliente?.activo === false ? (
            <p className="text-xs font-medium text-destructive">Cliente inactivo</p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'abogado',
      encabezado: 'Abogado',
      desde: 'lg',
      celda: (expediente) => expediente.abogado?.name ?? 'Sin asignar',
    },
    {
      id: 'anio',
      encabezado: 'Año',
      desde: 'sm',
      className: 'text-center',
      celda: (expediente) => <span className="tabular-nums">{expediente.anio}</span>,
    },
    {
      id: 'inicio',
      encabezado: 'Inicio',
      desde: 'md',
      celda: (expediente) => fechaCorta(expediente.fecha_inicio),
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      className: 'text-center',
      celda: (expediente) => <EstadoExpedienteBadge estado={expediente.estado} />,
    },
    {
      id: 'acciones',
      encabezado: '',
      className: 'w-28 text-right',
      celda: (expediente) => {
        const clienteInactivo = expediente.cliente?.activo === false

        return (
          <div className="flex justify-end gap-0.5">
            {!clienteInactivo ? (
              <>
                <Button variant="ghost" size="icon-sm" asChild aria-label="Ver expediente">
                  <Link to={`/expedientes/${expediente.uuid}`}>
                    <Eye className="size-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setEditando(expediente)
                    setDialogoAbierto(true)
                  }}
                  aria-label="Editar"
                >
                  <Pencil className="size-4" />
                </Button>
              </>
            ) : null}
            {puedeEliminar ? (
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => pedirEliminar(expediente)}
                aria-label="Eliminar"
              >
                <Trash2 className="size-4" />
              </Button>
            ) : null}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Expedientes"
        descripcion={data ? `${data.meta.total} casos registrados` : 'Casos del estudio'}
        acciones={
          <Button onClick={abrirNuevo}>
            <Plus className="size-4" />
            Nuevo expediente
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-border p-4">
          <Buscador
            valor={buscar}
            onCambiar={(valor) => {
              setBuscar(valor)
              setPagina(1)
            }}
            placeholder="Buscar por código, asunto o cliente"
            className="w-full sm:max-w-sm"
          />

          <Select
            value={estado}
            onValueChange={(valor) => {
              setEstado(valor)
              setPagina(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODOS}>Todos los estados</SelectItem>
              {ESTADOS.map((item) => (
                <SelectItem key={item.valor} value={item.valor}>
                  {item.texto}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <DataTable
            columnas={columnas}
            filas={data?.data ?? []}
            claveFila={(expediente) => expediente.id}
            cargando={isPending}
            error={error ? mensajeDeError(error) : null}
            onReintentar={() => refetch()}
            onFilaHover={(expediente) =>
              queryClient.prefetchQuery({
                queryKey: expedientesKeys.detalle(expediente.uuid),
                queryFn: () => expedientesApi.obtener(expediente.uuid),
              })
            }
            filaClassName={(expediente) => (expediente.cliente?.activo === false ? 'opacity-50' : undefined)}
            vacio={{
              icono: FolderOpen,
              titulo: busqueda || estado !== TODOS ? 'Sin resultados' : 'Aún no hay expedientes',
              descripcion:
                busqueda || estado !== TODOS
                  ? 'Prueba quitando filtros o buscando otro término.'
                  : 'Crea el primer expediente para llevar su historial y documentos.',
              accion:
                busqueda || estado !== TODOS ? undefined : (
                  <Button variant="outline" onClick={abrirNuevo}>
                    <Plus className="size-4" />
                    Nuevo expediente
                  </Button>
                ),
            }}
            paginacion={
              data
                ? {
                    pagina: data.meta.current_page,
                    porPagina: data.meta.per_page,
                    total: data.meta.total,
                    onCambiar: setPagina,
                  }
                : undefined
            }
          />
        </div>
      </Card>

      <ExpedienteDialogo abierto={dialogoAbierto} onAbierto={setDialogoAbierto} expediente={editando} />
    </div>
  )
}
