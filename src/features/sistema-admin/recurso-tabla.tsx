import { useMemo, useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Buscador } from '@/components/common/buscador'
import { Campo } from '@/components/common/campo'
import { DataTable, type Columna } from '@/components/common/data-table'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import type { NombreRecurso, RecursosSA } from './api'
import { useRecursoSA } from './hooks'

export function RecursoTabla<R extends NombreRecurso>({
  recurso,
  columnas,
  placeholder,
}: {
  recurso: R
  columnas: Columna<RecursosSA[R]>[]
  placeholder: string
}) {
  const [buscar, setBuscar] = useState('')
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
    }),
    [pagina, busqueda, orden, fechaInicio, fechaFin],
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
      <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
        <Buscador
          valor={buscar}
          onCambiar={(valor) => {
            setBuscar(valor)
            setPagina(1)
          }}
          placeholder={placeholder}
          className="max-w-md flex-1"
        />
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
