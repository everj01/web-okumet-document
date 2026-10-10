import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Buscador } from '@/components/common/buscador'
import { useConfirmar } from '@/components/common/confirmar'
import { DataTable, type Columna } from '@/components/common/data-table'
import { ActivoBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { useAuth } from '@/features/auth/auth-context'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import type { Cliente } from '@/types'
import { clientesApi, clientesKeys } from './api'
import { ClienteDialogo } from './cliente-dialogo'
import { useClientes, useEliminarCliente } from './hooks'

export default function ClientesPage() {
  const { puedeEliminar } = useAuth()
  const confirmar = useConfirmar()
  const queryClient = useQueryClient()

  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  const busqueda = useDebounce(buscar)
  const filtro = useMemo(() => ({ pagina, buscar: busqueda }), [pagina, busqueda])
  const { data, isPending, isFetching, error, refetch } = useClientes(filtro)
  const eliminar = useEliminarCliente()

  const abrirNuevo = () => {
    setEditando(null)
    setDialogoAbierto(true)
  }

  const abrirEdicion = (cliente: Cliente) => {
    setEditando(cliente)
    setDialogoAbierto(true)
  }

  const pedirEliminar = async (cliente: Cliente) => {
    const confirmado = await confirmar({
      titulo: 'Eliminar cliente',
      descripcion: `Se eliminará a ${cliente.nombre}. Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligroso: true,
    })

    if (confirmado) {
      eliminar.mutate(cliente.uuid)
    }
  }

  const columnas: Columna<Cliente>[] = [
    {
      id: 'nombre',
      encabezado: 'Cliente',
      celda: (cliente) => (
        <div className="min-w-0">
          <Link to={`/clientes/${cliente.uuid}`} className="font-medium hover:underline">
            {cliente.nombre}
          </Link>
          <p className="text-xs text-muted-foreground">
            {cliente.tipo_persona === 'natural' ? 'Persona natural' : 'Persona jurídica'}
          </p>
        </div>
      ),
    },
    {
      id: 'documento',
      encabezado: 'Documento',
      desde: 'md',
      celda: (cliente) => (
        <span className="tabular-nums">
          {cliente.tipo_documento} {cliente.numero_documento}
        </span>
      ),
    },
    {
      id: 'contacto',
      encabezado: 'Contacto',
      desde: 'lg',
      celda: (cliente) => (
        <div className="text-sm">
          <p>{cliente.email || '—'}</p>
          <p className="text-xs text-muted-foreground">{cliente.telefono || '—'}</p>
        </div>
      ),
    },
    {
      id: 'expedientes',
      encabezado: 'Expedientes',
      className: 'text-center',
      desde: 'sm',
      celda: (cliente) => <span className="tabular-nums">{cliente.expedientes_count ?? 0}</span>,
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      className: 'text-center',
      celda: (cliente) => <ActivoBadge activo={cliente.activo} />,
    },
    {
      id: 'acciones',
      encabezado: '',
      className: 'w-28 text-right',
      celda: (cliente) => (
        <div className="flex justify-end gap-0.5">
          <Button variant="ghost" size="icon-sm" asChild title="Ver historial" aria-label="Ver historial">
            <Link to={`/clientes/${cliente.uuid}`}>
              <Eye className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => abrirEdicion(cliente)}
            title="Editar"
            aria-label="Editar"
          >
            <Pencil className="size-4" />
          </Button>
          {puedeEliminar ? (
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:bg-destructive/10"
              onClick={() => pedirEliminar(cliente)}
              title="Eliminar"
              aria-label="Eliminar"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Clientes"
        descripcion={data ? `${data.meta.total} registrados` : 'Personas y empresas del estudio'}
        acciones={
          <Button onClick={abrirNuevo}>
            <Plus className="size-4" />
            Nuevo cliente
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <Buscador
            valor={buscar}
            onCambiar={(valor) => {
              setBuscar(valor)
              setPagina(1)
            }}
            placeholder="Buscar por nombre, documento o correo"
            className="max-w-md"
          />
        </div>

        <div className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <DataTable
            columnas={columnas}
            filas={data?.data ?? []}
            claveFila={(cliente) => cliente.id}
            cargando={isPending}
            error={error ? mensajeDeError(error) : null}
            onReintentar={() => refetch()}
            onFilaHover={(cliente) =>
              queryClient.prefetchQuery({
                queryKey: clientesKeys.detalle(cliente.uuid),
                queryFn: () => clientesApi.obtener(cliente.uuid),
              })
            }
            filaClassName={(cliente) => (cliente.activo ? undefined : 'opacity-50')}
            vacio={{
              icono: Users,
              titulo: busqueda ? 'Sin resultados' : 'Aún no hay clientes',
              descripcion: busqueda
                ? 'Prueba con otro nombre o número de documento.'
                : 'Registra el primer cliente para empezar a crear expedientes.',
              accion: busqueda ? undefined : (
                <Button onClick={abrirNuevo} variant="outline">
                  <Plus className="size-4" />
                  Nuevo cliente
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

      <ClienteDialogo abierto={dialogoAbierto} onAbierto={setDialogoAbierto} cliente={editando} />
    </div>
  )
}
