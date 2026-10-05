import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Buscador } from '@/components/common/buscador'
import { DataTable, type Columna } from '@/components/common/data-table'
import { PageHeader } from '@/components/common/page-header'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import { fechaCorta, pesoLegible } from '@/lib/formato'
import type { Documento } from '@/types'
import { documentosApi, documentosKeys } from './api'
import { useDocumentos } from './hooks'

export default function DocumentosPage() {
  const queryClient = useQueryClient()
  const [buscar, setBuscar] = useState('')
  const [pagina, setPagina] = useState(1)

  const busqueda = useDebounce(buscar)
  const filtro = useMemo(() => ({ pagina, buscar: busqueda }), [pagina, busqueda])
  const { data, isPending, isFetching, error, refetch } = useDocumentos(filtro)

  const columnas: Columna<Documento>[] = [
    {
      id: 'nombre',
      encabezado: 'Documento',
      celda: (documento) => (
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0">
            <Link to={`/documentos/${documento.uuid}`} className="font-medium hover:underline">
              {documento.nombre}
            </Link>
            {documento.resumen ? (
              <Badge variant="success" className="mt-1">
                <Sparkles />
                Resumen listo
              </Badge>
            ) : null}
          </div>
        </div>
      ),
    },
    {
      id: 'expediente',
      encabezado: 'Expediente',
      desde: 'md',
      celda: (documento) =>
        documento.expediente ? (
          <Link to={`/expedientes/${documento.expediente.uuid}`} className="hover:underline">
            {documento.expediente.codigo}
          </Link>
        ) : (
          '—'
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
      desde: 'lg',
      celda: (documento) => fechaCorta(documento.creado_en),
    },
    {
      id: 'acciones',
      encabezado: '',
      className: 'w-12 text-right',
      celda: (documento) => (
        <Button variant="ghost" size="icon-sm" asChild aria-label="Abrir documento">
          <Link to={`/documentos/${documento.uuid}`}>
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Documentos"
        descripcion="Busca por nombre o por lo que dice el PDF por dentro."
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <Buscador
            valor={buscar}
            onCambiar={(valor) => {
              setBuscar(valor)
              setPagina(1)
            }}
            placeholder="Ejemplo: medida cautelar, nombre de una parte, número de resolución..."
            className="max-w-xl"
          />
        </div>

        <div className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <DataTable
            columnas={columnas}
            filas={data?.data ?? []}
            claveFila={(documento) => documento.id}
            cargando={isPending}
            error={error ? mensajeDeError(error) : null}
            onReintentar={() => refetch()}
            onFilaHover={(documento) =>
              queryClient.prefetchQuery({
                queryKey: documentosKeys.detalle(documento.uuid),
                queryFn: () => documentosApi.obtener(documento.uuid),
              })
            }
            vacio={{
              icono: FileText,
              titulo: busqueda ? 'Sin coincidencias' : 'Todavía no hay documentos',
              descripcion: busqueda
                ? 'La búsqueda revisa el nombre y el texto del PDF. Prueba con otras palabras.'
                : 'Los PDF se suben desde cada expediente.',
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
    </div>
  )
}
