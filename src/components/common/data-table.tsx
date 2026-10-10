import { memo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EstadoError, EstadoVacio, FilasCargando } from './estados'
import { cn } from '@/lib/utils'

export interface Columna<T> {
  id: string
  encabezado: React.ReactNode
  celda: (fila: T) => React.ReactNode
  className?: string
  desde?: 'sm' | 'md' | 'lg'
  // Permite ordenar por esta columna; usa `id` como campo al llamar onOrdenar
  ordenable?: boolean
}

interface Orden {
  campo: string
  direccion: 'asc' | 'desc'
}

interface Props<T> {
  columnas: Columna<T>[]
  filas: T[]
  claveFila: (fila: T) => React.Key
  cargando?: boolean
  error?: string | null
  onReintentar?: () => void
  vacio?: { icono: LucideIcon; titulo: string; descripcion?: string; accion?: React.ReactNode }
  paginacion?: { pagina: number; porPagina: number; total: number; onCambiar: (pagina: number) => void }
  onFilaHover?: (fila: T) => void
  filaClassName?: (fila: T) => string | undefined
  // Orden actual y callback para columnas con `ordenable`; alterna asc/desc al repetir el campo
  orden?: Orden
  onOrdenar?: (campo: string) => void
}

const visibilidad = { sm: 'hidden sm:table-cell', md: 'hidden md:table-cell', lg: 'hidden lg:table-cell' }

function TablaDatos<T>({
  columnas,
  filas,
  claveFila,
  cargando,
  error,
  onReintentar,
  vacio,
  paginacion,
  onFilaHover,
  filaClassName,
  orden,
  onOrdenar,
}: Props<T>) {
  if (error) {
    return <EstadoError mensaje={error} onReintentar={onReintentar} />
  }

  if (cargando) {
    return <FilasCargando columnas={Math.min(columnas.length, 5)} />
  }

  if (!filas.length && vacio) {
    return <EstadoVacio {...vacio} />
  }

  const ultimaPagina = paginacion ? Math.max(1, Math.ceil(paginacion.total / paginacion.porPagina)) : 1
  const desde = paginacion ? (paginacion.pagina - 1) * paginacion.porPagina + 1 : 0

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columnas.map((columna) => (
              <TableHead key={columna.id} className={cn(columna.desde && visibilidad[columna.desde], columna.className)}>
                {columna.ordenable && onOrdenar ? (
                  <button
                    type="button"
                    onClick={() => onOrdenar(columna.id)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {columna.encabezado}
                    {orden?.campo === columna.id ? (
                      orden.direccion === 'asc' ? (
                        <ChevronUp className="size-3.5" />
                      ) : (
                        <ChevronDown className="size-3.5" />
                      )
                    ) : (
                      <ChevronsUpDown className="size-3.5 opacity-40" />
                    )}
                  </button>
                ) : (
                  columna.encabezado
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filas.map((fila) => (
            <TableRow
              key={claveFila(fila)}
              onMouseEnter={onFilaHover ? () => onFilaHover(fila) : undefined}
              className={filaClassName?.(fila)}
            >
              {columnas.map((columna) => (
                <TableCell key={columna.id} className={cn(columna.desde && visibilidad[columna.desde], columna.className)}>
                  {columna.celda(fila)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {paginacion && paginacion.total > paginacion.porPagina ? (
        <div className="flex items-center justify-between gap-4 border-t border-border px-4 py-3 text-sm text-muted-foreground">
          <span>
            {desde}–{Math.min(desde + filas.length - 1, paginacion.total)} de {paginacion.total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={paginacion.pagina <= 1}
              onClick={() => paginacion.onCambiar(paginacion.pagina - 1)}
              title="Página anterior"
              aria-label="Página anterior"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 tabular-nums">
              {paginacion.pagina} / {ultimaPagina}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={paginacion.pagina >= ultimaPagina}
              onClick={() => paginacion.onCambiar(paginacion.pagina + 1)}
              title="Página siguiente"
              aria-label="Página siguiente"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export const DataTable = memo(TablaDatos) as typeof TablaDatos
