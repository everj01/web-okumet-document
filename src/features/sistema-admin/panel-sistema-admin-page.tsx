import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { LogOut, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Buscador } from '@/components/common/buscador'
import { ActivoBadge } from '@/components/common/etiquetas-estado'
import { DataTable, type Columna } from '@/components/common/data-table'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import { fechaCorta } from '@/lib/formato'
import type { NombreRecurso, RecursosSA } from './api'
import { useRecursoSA } from './hooks'
import { useSistemaAdmin } from './sistema-admin-context'

function RecursoTabla<R extends NombreRecurso>({
  recurso,
  columnas,
  placeholder,
}: {
  recurso: R
  columnas: Columna<RecursosSA[R]>[]
  placeholder: string
}) {
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(1)
  const [orden, setOrden] = useState<{ campo: string; direccion: 'asc' | 'desc' } | undefined>(undefined)

  const busqueda = useDebounce(buscar)
  const filtro = useMemo(
    () => ({ pagina, buscar: busqueda, orden: orden?.campo, direccion: orden?.direccion }),
    [pagina, busqueda, orden],
  )

  const { data, isPending, isFetching, error, refetch } = useRecursoSA(recurso, filtro)

  const ordenar = (campo: string) => {
    setOrden((actual) =>
      actual?.campo === campo ? { campo, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' } : { campo, direccion: 'asc' },
    )
    setPagina(1)
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border p-4">
        <Buscador
          valor={buscar}
          onCambiar={(valor) => {
            setBuscar(valor)
            setPagina(1)
          }}
          placeholder={placeholder}
          className="max-w-md"
        />
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
          vacio={{ icono: ShieldAlert, titulo: 'Sin resultados' }}
          paginacion={
            data
              ? { pagina: data.meta.current_page, porPagina: data.meta.per_page, total: data.meta.total, onCambiar: setPagina }
              : undefined
          }
        />
      </div>
    </Card>
  )
}

export default function PanelSistemaAdminPage() {
  const { superAdmin, cerrarSesion } = useSistemaAdmin()
  const navegar = useNavigate()

  const salir = () => {
    cerrarSesion()
    navegar('/sistema_admin', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-neutral-950 p-4 text-neutral-100 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="size-5 text-primary" />
            <div>
              <h1 className="font-semibold">Sistema · Soporte</h1>
              <p className="text-xs text-neutral-400">{superAdmin?.email}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={salir}>
            <LogOut className="size-4" />
            Salir
          </Button>
        </div>

        <Tabs defaultValue="tenants">
          <TabsList>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="expedientes">Expedientes</TabsTrigger>
            <TabsTrigger value="eventos">Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants">
            <RecursoTabla
              recurso="tenants"
              placeholder="Buscar por nombre comercial o RUC"
              columnas={[
                { id: 'nombre_comercial', encabezado: 'Negocio', ordenable: true, celda: (t) => t.nombre_comercial },
                { id: 'ruc', encabezado: 'RUC', desde: 'sm', celda: (t) => t.ruc || '—' },
                {
                  id: 'usuarios_count',
                  encabezado: 'Usuarios',
                  desde: 'md',
                  className: 'text-center',
                  celda: (t) => t.usuarios_count ?? '—',
                },
                { id: 'activo', encabezado: 'Estado', className: 'text-center', celda: (t) => <ActivoBadge activo={t.activo} /> },
              ]}
            />
          </TabsContent>

          <TabsContent value="usuarios">
            <RecursoTabla
              recurso="usuarios"
              placeholder="Buscar por nombre o correo"
              columnas={[
                { id: 'name', encabezado: 'Usuario', ordenable: true, celda: (u) => u.name },
                { id: 'email', encabezado: 'Correo', desde: 'sm', celda: (u) => u.email },
                { id: 'tenant', encabezado: 'Negocio', desde: 'md', celda: (u) => u.tenant?.nombre_comercial || '—' },
                { id: 'rol', encabezado: 'Rol', className: 'text-center capitalize', celda: (u) => u.rol?.nombre || '—' },
                {
                  id: 'activo',
                  encabezado: 'Estado',
                  className: 'text-center',
                  celda: (u) => <ActivoBadge activo={u.activo} />,
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="clientes">
            <RecursoTabla
              recurso="clientes"
              placeholder="Buscar por nombre o documento"
              columnas={[
                { id: 'nombre', encabezado: 'Cliente', ordenable: true, celda: (c) => c.nombre },
                {
                  id: 'documento',
                  encabezado: 'Documento',
                  desde: 'sm',
                  celda: (c) => `${c.tipo_documento} ${c.numero_documento}`,
                },
                { id: 'tenant', encabezado: 'Negocio', desde: 'md', celda: (c) => c.tenant?.nombre_comercial || '—' },
                {
                  id: 'activo',
                  encabezado: 'Estado',
                  className: 'text-center',
                  celda: (c) => <ActivoBadge activo={c.activo} />,
                },
              ]}
            />
          </TabsContent>

          <TabsContent value="expedientes">
            <RecursoTabla
              recurso="expedientes"
              placeholder="Buscar por código o asunto"
              columnas={[
                { id: 'codigo', encabezado: 'Expediente', ordenable: true, celda: (e) => `${e.codigo} — ${e.titulo}` },
                { id: 'estado', encabezado: 'Estado', desde: 'sm', celda: (e) => e.estado },
                { id: 'cliente', encabezado: 'Cliente', desde: 'md', celda: (e) => e.cliente?.nombre || '—' },
                { id: 'tenant', encabezado: 'Negocio', desde: 'lg', celda: (e) => e.tenant?.nombre_comercial || '—' },
              ]}
            />
          </TabsContent>

          <TabsContent value="eventos">
            <RecursoTabla
              recurso="eventos"
              placeholder="Buscar por título"
              columnas={[
                { id: 'titulo', encabezado: 'Fecha', ordenable: true, celda: (e) => e.titulo },
                { id: 'tipo', encabezado: 'Tipo', desde: 'sm', celda: (e) => e.tipo },
                { id: 'inicio', encabezado: 'Inicio', desde: 'md', celda: (e) => fechaCorta(e.inicio) },
                { id: 'tenant', encabezado: 'Negocio', desde: 'lg', celda: (e) => e.tenant?.nombre_comercial || '—' },
              ]}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
