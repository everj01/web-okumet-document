import { useMemo, useState } from 'react'
import { Pencil, Plus, Trash2, UserCog } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Buscador } from '@/components/common/buscador'
import { useConfirmar } from '@/components/common/confirmar'
import { DataTable, type Columna } from '@/components/common/data-table'
import { ActivoBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import type { Usuario } from '@/types'
import { useEliminarUsuario, useUsuarios } from './hooks'
import { UsuarioDialogo } from './usuario-dialogo'

export default function UsuariosPage() {
  const confirmar = useConfirmar()
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(1)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  const busqueda = useDebounce(buscar)
  const filtro = useMemo(() => ({ pagina, buscar: busqueda }), [pagina, busqueda])
  const { data, isPending, isFetching, error, refetch } = useUsuarios(filtro)
  const eliminar = useEliminarUsuario()

  const pedirEliminar = async (usuario: Usuario) => {
    const confirmado = await confirmar({
      titulo: 'Eliminar usuario',
      descripcion: `${usuario.name} perderá el acceso al sistema.`,
      confirmar: 'Eliminar',
      peligroso: true,
    })

    if (confirmado) {
      eliminar.mutate(usuario.uuid)
    }
  }

  const columnas: Columna<Usuario>[] = [
    {
      id: 'nombre',
      encabezado: 'Usuario',
      celda: (usuario) => (
        <div className="min-w-0">
          <p className="font-medium">{usuario.name}</p>
          <p className="truncate text-xs text-muted-foreground">{usuario.email}</p>
        </div>
      ),
    },
    {
      id: 'telefono',
      encabezado: 'Teléfono',
      desde: 'md',
      celda: (usuario) => usuario.telefono || '—',
    },
    {
      id: 'rol',
      encabezado: 'Rol',
      className: 'text-center',
      celda: (usuario) => (
        <Badge variant={usuario.rol?.nombre === 'admin' ? 'default' : 'neutral'} className="capitalize">
          {usuario.rol?.nombre ?? '—'}
        </Badge>
      ),
    },
    {
      id: 'estado',
      encabezado: 'Estado',
      className: 'text-center',
      desde: 'sm',
      celda: (usuario) => <ActivoBadge activo={usuario.activo} />,
    },
    {
      id: 'acciones',
      encabezado: '',
      className: 'w-20 text-right',
      celda: (usuario) => (
        <div className="flex justify-end gap-0.5">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setEditando(usuario)
              setDialogoAbierto(true)
            }}
            aria-label="Editar"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => pedirEliminar(usuario)}
            aria-label="Eliminar"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Usuarios"
        descripcion="Cuentas con acceso al sistema y su rol."
        acciones={
          <Button
            onClick={() => {
              setEditando(null)
              setDialogoAbierto(true)
            }}
          >
            <Plus className="size-4" />
            Nuevo usuario
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
            placeholder="Buscar por nombre o correo"
            className="max-w-md"
          />
        </div>

        <div className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <DataTable
            columnas={columnas}
            filas={data?.data ?? []}
            claveFila={(usuario) => usuario.id}
            cargando={isPending}
            error={error ? mensajeDeError(error) : null}
            onReintentar={() => refetch()}
            vacio={{ icono: UserCog, titulo: 'Sin usuarios', descripcion: 'Crea la primera cuenta del equipo.' }}
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

      <UsuarioDialogo abierto={dialogoAbierto} onAbierto={setDialogoAbierto} usuario={editando} />
    </div>
  )
}
