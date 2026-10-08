import { useMemo, useState } from 'react'
import { ScrollText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Buscador } from '@/components/common/buscador'
import { Campo } from '@/components/common/campo'
import { DataTable, type Columna } from '@/components/common/data-table'
import { PageHeader } from '@/components/common/page-header'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import { fechaHora } from '@/lib/formato'
import type { AccionLog, LogAuditoria, ModuloLog } from './api'
import { useLogsSA } from './hooks'

const ACCIONES: { valor: AccionLog; texto: string }[] = [
  { valor: 'login', texto: 'Login' },
  { valor: 'login_fallido', texto: 'Login fallido' },
  { valor: 'logout', texto: 'Logout' },
  { valor: 'creado', texto: 'Creado' },
  { valor: 'actualizado', texto: 'Actualizado' },
  { valor: 'eliminado', texto: 'Eliminado' },
  { valor: 'exportacion', texto: 'Exportación' },
  { valor: 'reporte', texto: 'Reporte' },
  { valor: 'super_admin', texto: 'Super admin' },
]

const MODULOS: { valor: ModuloLog; texto: string }[] = [
  { valor: 'auth', texto: 'Autenticación' },
  { valor: 'clientes', texto: 'Clientes' },
  { valor: 'expedientes', texto: 'Expedientes' },
  { valor: 'documentos', texto: 'Documentos' },
  { valor: 'usuarios', texto: 'Usuarios' },
  { valor: 'eventos', texto: 'Agenda' },
  { valor: 'exportaciones', texto: 'Exportaciones' },
  { valor: 'reportes', texto: 'Reportes' },
  { valor: 'sistema_admin', texto: 'Sistema admin' },
]

const VARIANTE_ACCION: Record<AccionLog, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  login: 'success',
  login_fallido: 'danger',
  logout: 'neutral',
  creado: 'success',
  actualizado: 'info',
  eliminado: 'danger',
  exportacion: 'warning',
  reporte: 'warning',
  super_admin: 'info',
}

const columnas: Columna<LogAuditoria>[] = [
  { id: 'creado_en', encabezado: 'Fecha', ordenable: true, celda: (l) => fechaHora(l.creado_en) },
  {
    id: 'accion',
    encabezado: 'Acción',
    celda: (l) => <Badge variant={VARIANTE_ACCION[l.accion]}>{ACCIONES.find((a) => a.valor === l.accion)?.texto ?? l.accion}</Badge>,
  },
  { id: 'modulo', encabezado: 'Módulo', desde: 'sm', celda: (l) => MODULOS.find((m) => m.valor === l.modulo)?.texto ?? l.modulo },
  { id: 'descripcion', encabezado: 'Detalle', desde: 'md', celda: (l) => l.descripcion },
  { id: 'actor', encabezado: 'Usuario', desde: 'sm', celda: (l) => l.actor_nombre },
  { id: 'tenant', encabezado: 'Negocio', desde: 'lg', celda: (l) => l.tenant?.nombre_comercial || '—' },
]

export default function AuditoriaSaPage() {
  const [buscar, setBuscar] = useState('')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [accion, setAccion] = useState<AccionLog | 'todas'>('todas')
  const [modulo, setModulo] = useState<ModuloLog | 'todos'>('todos')
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
      accion: accion === 'todas' ? undefined : accion,
      modulo: modulo === 'todos' ? undefined : modulo,
    }),
    [pagina, busqueda, orden, fechaInicio, fechaFin, accion, modulo],
  )

  const { data, isPending, isFetching, error, refetch } = useLogsSA(filtro)

  const ordenar = (campo: string) => {
    setOrden((actual) =>
      actual?.campo === campo ? { campo, direccion: actual.direccion === 'asc' ? 'desc' : 'asc' } : { campo, direccion: 'asc' },
    )
    setPagina(1)
  }

  return (
    <div className="space-y-5">
      <PageHeader titulo="Auditoría" descripcion="Registro de acciones en toda la plataforma: logins, cambios, exportaciones y acciones de soporte." />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
          <Buscador
            valor={buscar}
            onCambiar={(valor) => {
              setBuscar(valor)
              setPagina(1)
            }}
            placeholder="Buscar por usuario o detalle"
            className="max-w-sm flex-1"
          />

          <Campo etiqueta="Acción" className="w-44">
            <Select
              value={accion}
              onValueChange={(v) => {
                setAccion(v as AccionLog | 'todas')
                setPagina(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {ACCIONES.map((a) => (
                  <SelectItem key={a.valor} value={a.valor}>
                    {a.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Módulo" className="w-44">
            <Select
              value={modulo}
              onValueChange={(v) => {
                setModulo(v as ModuloLog | 'todos')
                setPagina(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {MODULOS.map((m) => (
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
            vacio={{ icono: ScrollText, titulo: 'Sin registros para este filtro' }}
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
